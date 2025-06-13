import { ErrorMap } from "@orpc/server";
import { z } from "zod/v4";
import { createFinaliseStep, createInitialiseStep, StepType } from "./_steps";
import { type SignInParams } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.PERSONAL_TOOLS_AND_MATERIALS);

export const Transmit = z.undefined();

export const Receive = z.undefined();

export const Finalise = createFinaliseStep(StepType.enum.PERSONAL_TOOLS_AND_MATERIALS, StepType.enum.FINALISE);

export const Errors = {} as const satisfies ErrorMap;

// biome-ignore lint/correctness/useYield: <explanation>
export default async function* (_: SignInParams<z.infer<typeof Initialise>>): AsyncGenerator<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  return {
    type: StepType.enum.PERSONAL_TOOLS_AND_MATERIALS,
    next: StepType.enum.FINALISE,
  };
}
