import { ErrorMap } from "@orpc/server";
import { z } from "zod/v4";
import { StepType, createFinaliseStep, createInitialiseStep, createTransmitStep } from "./_steps";
import type { Params, Return } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.REGISTER);

export const Transmit = createTransmitStep(StepType.enum.REGISTER);

export const Receive = z.object({ type: z.literal(StepType.enum.REGISTER) });

export const Finalise = createFinaliseStep(StepType.enum.REGISTER, StepType.enum.AGREEMENTS);

export const Errors = {} as const satisfies ErrorMap;

export default async function* ({
  user,
  input,
  context,
}: Params<z.infer<typeof Initialise>>): Return<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  yield {}
  return {
    next: StepType.enum.AGREEMENTS,
  };
}
