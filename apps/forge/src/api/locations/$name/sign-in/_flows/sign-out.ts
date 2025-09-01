import { QueuePlaceShape } from "@/lib/utils/queries";
import { ErrorMap } from "@orpc/server";
import e from "@packages/db/edgeql-js";
import { logger } from "@sentry/tanstackstart-react";
import { CardinalityViolationError } from "gel";
import * as z from "zod";
import { StepType, createFinaliseStep, createInitialiseStep, createReceiveStep, createTransmitStep } from "./_steps";
import type { Params, Return } from "./_types";
import email from "@/email"

export const Initialise = createInitialiseStep(StepType.enum.SIGN_OUT);

export const Transmit = createTransmitStep(StepType.enum.SIGN_OUT);

export const Receive = createReceiveStep(StepType.enum.SIGN_OUT);

export const Finalise = createFinaliseStep(StepType.enum.SIGN_OUT, z.undefined());

export const Errors = {
  NOT_SIGNED_IN: {
    status: 500,
    message: "User was not signed in",
  },
} as const satisfies ErrorMap;

export default async function* ({
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
  let sign_in: {id: string};
  try {
    sign_in = await e
      .assert_exists(
        e.update(e.sign_in.SignIn, (sign_in) => ({
          filter_single: e.all(
            e.set(
              e.op(sign_in.location, "=", $location),
              e.op(sign_in.user, "=", $user),
              e.op("not", sign_in.signed_out),
            ),
          ),
          set: {
            ends_at: new Date(),
          },
        })),
      )
      .run(tx);
  } catch (error) {
    if (error instanceof CardinalityViolationError) {
      throw errors.NOT_SIGNED_IN({});
    }
    throw error;
  }

  const { can_sign_in, available_capacity } = await e
    .select($location, () => ({ can_sign_in: true, available_capacity: true }))
    .run(tx);

  if (can_sign_in) {
    if (available_capacity > 0) {
      const places = await e
        .select(e.sign_in.QueuePlace, (queue_place) => ({
          filter: e.op(
            e.op(queue_place.location, "=", $location),
            "and",
            e.op("not", e.op("exists", queue_place.notified_at)),
          ),
          order_by: {
            expression: queue_place.created_at,
            direction: e.ASC,
          },
          limit: available_capacity,
          ...QueuePlaceShape(queue_place),
        }))
        .run(tx);

      logger.info(logger.fmt`Dequeuing ${places.length} users for ${name}`);

      for (const place of places) {
        await e
          .update(e.sign_in.QueuePlace, (queue_place) => ({
            filter: e.op(queue_place.id, "=", e.uuid(place.id)),
            set: {
              notified_at: new Date(),
            },
          }))
          .run(tx);

        await email.sendUnqueuedEmail(place, name);
        logger.info(logger.fmt`Sent unqueued email to user ${place.user.display_name} (${place.user.ucard_number})`);
      }
    } else {
      logger.info(logger.fmt`No available capacity to dequeue users for ${name}`);
    }
  }

  return { next: undefined as never };
}
