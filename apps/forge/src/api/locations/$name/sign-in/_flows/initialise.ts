import { SignInUser } from "@/lib/utils/sign-in";
import { ErrorMap } from "@orpc/server";
import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import { CreateInfractionSchema } from "@packages/db/zod/modules/users";
import { logger } from "@sentry/node";
import { z } from "zod/v4";
import { StepType, createFinaliseStep, createInitialiseStep, createTransmitStep } from "./_steps";
import type { Params, Return } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.INITIALISE);

export const Transmit = createTransmitStep(StepType.enum.INITIALISE).extend({
  user: z.custom<SignInUser>(),
});

export const Receive = z.object({ type: z.literal(StepType.enum.INITIALISE) });

export const Finalise = createFinaliseStep(
  StepType.enum.INITIALISE,
  z.literal([StepType.enum.QUEUE, StepType.enum.SIGN_OUT, StepType.enum.REASON, StepType.enum.AGREEMENTS]),
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
}: Params<z.infer<typeof Initialise>>): Return<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  yield { user };
  const unresolvedInfractions = user.infractions.filter((i) => !i.resolved);

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

    return { next: StepType.enum.SIGN_OUT };
  }

  // Queue checking
  if ((await $location.available_capacity.run(tx)) <= 0) {
    if (await $location.queue_in_use.run(tx)) {
      // could raise so cannot fetch all these at once
      logger.info(logger.fmt`Queue in use, checking if user ${user.ucard_number} has queued at location: ${name}`);

      const queued_and_can_sign_in = await e.op($user, "in", $location.queued_users_that_can_sign_in).run(tx);

      if (!queued_and_can_sign_in) {
        logger.warn(logger.fmt`User ${user.ucard_number} has not queued at location: ${name}`);
        throw errors.NOT_IN_QUEUE();
      }
      logger.debug(logger.fmt`User ${user.ucard_number} has queued at location: ${name}`);
    } else {
      logger.debug(logger.fmt`At capacity, attempting to add user ${user.ucard_number} queue`);
      return { next: StepType.enum.QUEUE };
    }
  }

  // TODO this should go on the front end
  // if (user.first_time)
  if (user.registered) {
    return {
      next: StepType.enum.REASON,
    };
  }

  return { next: StepType.enum.AGREEMENTS };
}
