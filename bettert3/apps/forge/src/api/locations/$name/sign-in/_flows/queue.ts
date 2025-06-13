// import email from "@/email";
import { QueuePlaceShape } from "@/lib/utils/queries";
import e, { $infer } from "@packages/db/edgeql-js";
import { ErrorMap } from "@orpc/server";
import { logger } from "@sentry/bun";
import { AccessError, ConstraintViolationError } from "gel";
import { z } from "zod/v4";
import { createFinaliseStep, createInitialiseStep, StepType } from "./_steps";
import { type SignInParams } from "./_types";

type Place = $infer<typeof QueuePlaceShape>[number];

export const Initialise = createInitialiseStep(StepType.enum.QUEUE);

export const Transmit = z.undefined();

export const Receive = z.undefined();

export const Finalise = createFinaliseStep(StepType.enum.QUEUE, StepType.enum.FINALISE).extend({
  place: z.custom<Place>((value) => value as any),
});

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

export default async function* (
  { $user, $location, errors, context: { tx } }: SignInParams<z.infer<typeof Initialise>>, // cannot use user as it cannot be passed from the queue.add endpoint
): AsyncGenerator<z.infer<typeof Transmit>, z.infer<typeof Finalise>, z.infer<typeof Receive>> {
  let place: Place;
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

  await email.sendQueuedEmail(place, place.location.name);

  logger.debug(logger.fmt`Sent queued email to user ${place.user.ucard_number}`);

  return { next: StepType.enum.FINALISE, type: StepType.enum.QUEUE, place };
}
