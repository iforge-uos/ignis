import { exhaustiveGuard } from "@/utils/base";
import { ErrorMap } from "@orpc/server";
import { z } from "zod";
import { InputStep, SignInParams, createStepSchema } from "./_types";

const Step = createStepSchema("INITIALISE");
export const Input = Step.extend({}).and(InputStep);
export const Output = Step.extend({});
export const Errors = {
  USER_HAS_ACTIVE_INFRACTIONS: {
    message: "User has unresolved infractions and cannot sign in.",
    status: 421,
  },
  ALREADY_SIGNED_IN: {
    message: "User is already signed in at a different location, please sign out there before signing in.",
    status: 421,
  },
} as const satisfies ErrorMap;

export default async function ({
  user,
  input,
  context,
  errors,
}: SignInParams<z.infer<typeof Input>>): Promise<z.infer<typeof Output>> {
  // region Infractions
  const unresolvedInfractions = user.infractions.filter((i) => !i.resolved);
  const infractionErrors = [];
  for (const infraction of unresolvedInfractions) {
    switch (infraction.type) {
      case "PERM_BAN":
        infractionErrors.push(`User is permanently banned from the iForge. Reason: ${infraction.reason}`);
        break;
      case "TEMP_BAN":
        infractionErrors.push(
          `User is banned from the iForge for ${infraction.duration}. Reason: ${infraction.reason}`,
        );
        break;
      case "WARNING":
        infractionErrors.push(`User has an unresolved warning. Reason: ${infraction.reason}`);
        break;
      case "RESTRICTION":
        infractionErrors.push(`User has an unresolved restriction. Reason: ${infraction.reason}`);
        break;
      case "TRAINING_ISSUE":
        infractionErrors.push(`User has an unresolved training issue. Reason: ${infraction.reason}`);
        break;
      default:
        exhaustiveGuard(infraction.type);
    }
  }

  if (infractionErrors.length) {
    throw errors.USER_HAS_ACTIVE_INFRACTIONS();
  }

  if ((await getAvailableCapacity(name)) <= 0) {
    if (await queueInUse(name)) {
      Logger.info(`Queue in use, checking if user ${user.id} has queued at location: ${name}`);
      await assertHasQueued(name, ucard_number);
    } else {
      throw errors.AT_CAPACITY;
    }
  }

  return {
    type: "QUEUE",
  };
}
