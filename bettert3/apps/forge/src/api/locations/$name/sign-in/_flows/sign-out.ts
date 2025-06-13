import { ErrorMap } from "@orpc/server";
import e from "@packages/db/edgeql-js";
import { z } from "zod/v4";
import { StepType, createFinaliseStep, createInitialiseStep } from "./_steps";
import { type SignInParams } from "./_types";
import { CardinalityViolationError } from "gel";

export const Initialise = createInitialiseStep(StepType.enum.SIGN_OUT);

export const Transmit = z.object({
});

export const Receive = z.undefined();

export const Finalise = createFinaliseStep(StepType.enum.SIGN_OUT, StepType.enum.FINALISE);

export const Errors = {
    NOT_SIGNED_IN: {
        status: 500,
        message:  "User was not signed in",
    }
} as const satisfies ErrorMap;

export default async function* ({
  $user,
  $location,
  context: { tx },
  errors
}: SignInParams<z.infer<typeof Initialise>>): AsyncGenerator<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  try {
    await e
      .assert_exists(
        e.update(e.sign_in.SignIn, (sign_in) => ({
          filter_single: e.all(
            e.set(
              e.op(sign_in.location,  "=", $location),
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
      throw errors.NOT_SIGNED_IN({})
    }
    throw error;
  }
  if (await $location.can_sign_in.run(tx)) {
    await this.dequeueTop(name);
  }
}
