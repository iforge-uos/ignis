import { ErrorMap } from "@orpc/server";
import { z } from "zod/v4";
import { createFinaliseStep, createInitialiseStep, StepType } from "./_steps";
import { type SignInParams } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.REGISTER);

export const Transmit = z.undefined();

export const Receive = z.object({ type: z.literal(StepType.enum.REGISTER) });

export const Finalise = createFinaliseStep(StepType.enum.REGISTER, StepType.enum.AGREEMENTS);

export const Errors = {} as const satisfies ErrorMap;

// biome-ignore lint/correctness/useYield: <explanation>
export default async function* ({
  user,
  input,
  context,
}: SignInParams<z.infer<typeof Initialise>>): AsyncGenerator<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  return {
    type: StepType.enum.REGISTER,
    next: StepType.enum.AGREEMENTS,
  };
}
