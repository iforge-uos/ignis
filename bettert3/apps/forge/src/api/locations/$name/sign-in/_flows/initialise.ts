import { SignInUser } from "@/lib/utils/sign-in";
import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import { CreateInfractionSchema } from "@packages/db/zod/modules/users";
import { ErrorMap } from "@orpc/server";
import { logger } from "@sentry/bun";
import { z } from "zod/v4";
import { createFinaliseStep, createInitialiseStep, StepType } from "./_steps";
import { type SignInParams } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.INITIALISE);

export const Transmit = z.object({ type: z.literal(StepType.enum.INITIALISE), user: z.any() });

export const Receive = z.object({ type: z.literal(StepType.enum.INITIALISE) });

export const Finalise = createFinaliseStep(
  StepType.enum.INITIALISE,
  z.union([
    z.literal(StepType.enum.QUEUE),
    z.literal(StepType.enum.SIGN_OUT),
    z.literal(StepType.enum.REASON),
    z.literal(StepType.enum.AGREEMENTS),
  ]),
);

export const Errors = {
  USER_HAS_ACTIVE_INFRACTIONS: {
    message: "User has unresolved infractions",
    status: 421,
    data: z.array(CreateInfractionSchema),
  },
  ALREADY_SIGNED_IN: {
    message: "User is already signed in at a different location, please sign out there before signing in",
    status: 421,
    data: LocationNameSchema,
  },
  NOT_IN_QUEUE: {
    message: "We are still waiting for people who have been queued to show up",
    status: 421,
  },
} as const satisfies ErrorMap;

export default async function* ({
  user,
  $user,
  $location,
  input: { name },
  context: { tx },
  errors,
}: SignInParams<z.infer<typeof Initialise>>): AsyncGenerator<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  yield { type: "INITIALISE", user };
  const unresolvedInfractions = user.infractions.filter((i) => !i.resolved);
  // TODO move to front end
  // for (const infraction of unresolvedInfractions) {
  //   switch (infraction.type) {
  //     case "PERM_BAN":
  //       infractionErrors.push(`User is permanently banned from the iForge. Reason: ${infraction.reason}`);
  //       break;
  //     case "TEMP_BAN":
  //       infractionErrors.push(
  //         `User is banned from the iForge for ${infraction.duration}. Reason: ${infraction.reason}`,
  //       );
  //       break;
  //     case "WARNING":
  //       infractionErrors.push(`User has an unresolved warning. Reason: ${infraction.reason}`);
  //       break;
  //     case "RESTRICTION":
  //       infractionErrors.push(`User has an unresolved restriction. Reason: ${infraction.reason}`);
  //       break;
  //     case "TRAINING_ISSUE":
  //       infractionErrors.push(`User has an unresolved training issue. Reason: ${infraction.reason}`);
  //       break;
  //     default:
  //       exhaustiveGuard(infraction.type);
  //   }
  // }

  if (unresolvedInfractions.length) {
    throw errors.USER_HAS_ACTIVE_INFRACTIONS({ data: unresolvedInfractions });
  }

  const alreadyName = await e
    .assert_single(
      e.select($user.sign_ins, (sign_in) => ({
        filter: e.op("not", sign_in.signed_out),
      })),
    )
    .location.name.run(tx);
  if (alreadyName) {
    if (alreadyName !== name) {
      throw errors.ALREADY_SIGNED_IN({ data: alreadyName });
    }

    return { type: StepType.enum.INITIALISE, next: StepType.enum.SIGN_OUT };
  }

  // Queue checking
  if ((await $location.available_capacity.run(tx)) <= 0) {
    if (await $location.queue_in_use.run(tx)) {
      // could raise so cannot fetch all these at once
      logger.info(logger.fmt`Queue in use, checking if user ${user.ucard_number} has queued at location: ${name}`);

      const queued_and_can_sign_in = await e
        .op(user.ucard_number, "in", $location.queued_users_that_can_sign_in.ucard_number)
        .run(tx);

      if (!queued_and_can_sign_in) {
        logger.warn(logger.fmt`User ${user.ucard_number} has not queued at location: ${name}`);
        throw errors.NOT_IN_QUEUE();
      }
      logger.debug(logger.fmt`User ${user.ucard_number} has queued at location: ${name}`);
    } else {
      logger.debug(logger.fmt`At capacity, attempting to add user ${user.ucard_number} queue`);
      return { type: StepType.enum.INITIALISE, next: StepType.enum.QUEUE };
    }
  }

  // TODO this should go on the front end
  // if (user.first_time)
  if (user.registered) {
    return {
      type: StepType.enum.INITIALISE,
      next: StepType.enum.REASON,
    };
  }

  return { type: StepType.enum.INITIALISE, next: StepType.enum.AGREEMENTS };
}
