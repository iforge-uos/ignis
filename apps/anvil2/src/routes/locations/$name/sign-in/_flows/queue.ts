import email from "@/email";
import Logger from "@/utils/logger";
import { QueuePlaceShape } from "@/utils/queries";
import e, { $infer } from "@db/edgeql-js";
import { ErrorMap } from "@orpc/server";
import { AccessError, ConstraintViolationError } from "gel";
import { z } from "zod/v4";
import { OutputStep, SignInParams } from "./_types";
import { createInputStep, InputStep } from "./_input";
import { sign_in } from "@db/interfaces";

export const Input = createInputStep("QUEUE").extend({}).and(InputStep);

export interface Output extends OutputStep {
  type: "FINALISE";
  place: sign_in.QueuePlace;
}

export const Errors = {
  QUEUE_DISABLED: {
    status: 503,
    message: "The queue has been manually disabled",
  },
  USER_ALREADY_IN_QUEUE: {
    status: 400,
    message: "The user is already in the queue",
  },
} as const satisfies ErrorMap;

export default async function (
  { $user, $location, errors, context: { tx } }: Omit<SignInParams<z.infer<typeof Input>>, "user">, // cannot use user as it cannot be passed from the queue.add endpoint
): Promise<Output> {
  let place: $infer<typeof QueuePlaceShape>[number];
  try {
    place = await e
      .select(
        e.insert(e.sign_in.QueuePlace, {
          user: $user,
          location: $location,
        }),
        QueuePlaceShape,
      )
      .run(tx);
  } catch (error) {
    if (error instanceof AccessError) {
      throw errors.QUEUE_DISABLED({
        cause: error,
        message: error.message,
      });
    }
    if (error instanceof ConstraintViolationError) {
      throw errors.USER_ALREADY_IN_QUEUE({
        cause: error,
      });
    }

    throw error;
  }

  await email.sendQueuedEmail(place, location);

  Logger.debug(`Sent queued email to user ${place.user.display_name} (${place.user.ucard_number})`);

  return { type: "FINALISE", place };
}
