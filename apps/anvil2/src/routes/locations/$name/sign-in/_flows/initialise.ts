import Logger from "@/utils/logger";
import { SignInUser } from "@/utils/sign-in";
import e from "@db/edgeql-js";
import { LocationNameSchema } from "@db/zod/modules/sign_in";
import { CreateInfractionSchema } from "@db/zod/modules/users";
import { ErrorMap } from "@orpc/server";
import { z } from "zod";
import {  OutputStep, SignInParams, } from "./_types";
import { createInputStep, InputStep } from "./_input";

export const Input = createInputStep("INITIALISE").extend({}).and(InputStep);

export interface Output extends OutputStep {
  type: "QUEUE" | "SIGN_OUT" | "REASON" | "AGREEMENTS";
  user: SignInUser;
}

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

export default async function ({
  user,
  $user,
  $location,
  input: { name },
  context: { tx },
  errors,
}: SignInParams<z.infer<typeof Input>>): Promise<Output> {
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

    return { type: "SIGN_OUT", user };
  }

  // Queue checking
  if ((await $location.available_capacity.run(tx)) <= 0) {
    if (await $location.queue_in_use.run(tx)) {
      // could raise so cannot fetch all these at once
      Logger.info(`Queue in use, checking if user ${user.ucard_number} has queued at location: ${name}`);

      const queued_and_can_sign_in = await e
        .op(user.ucard_number, "in", $location.queued_users_that_can_sign_in.ucard_number)
        .run(tx);

      if (!queued_and_can_sign_in) {
        Logger.warn(`User ${user.ucard_number} has not queued at location: ${name}`);
        throw errors.NOT_IN_QUEUE();
      }
      Logger.debug(`User ${user.ucard_number} has queued at location: ${name}`);
    } else {
      Logger.debug(`At capacity, attempting to add user ${user.ucard_number} queue`);
      return {
        type: "QUEUE",
        user,
      };
    }
  }

  // TODO this should go on the front end
  // if (user.first_time)
  if (user.registered) {
    return {
      type: "REASON",
      user,
    };
  }

  return {
    type: "AGREEMENTS",
    user,
  };
}
