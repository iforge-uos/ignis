import { ErrorMap } from "@orpc/server";
import * as z from "zod";
import { StepType, createFinaliseStep, createInitialiseStep, createTransmitStep } from "./_steps";
import type { Params, Return } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.PERSONAL_TOOLS_AND_MATERIALS);

export const Transmit = createTransmitStep(StepType.enum.PERSONAL_TOOLS_AND_MATERIALS);

export const Receive = z.object({ type: z.literal(StepType.enum.PERSONAL_TOOLS_AND_MATERIALS) });

export const Finalise = createFinaliseStep(StepType.enum.PERSONAL_TOOLS_AND_MATERIALS, StepType.enum.FINALISE);

export const Errors = {} as const satisfies ErrorMap;

export default async function* (
  _: Params<z.infer<typeof Initialise>>,
): Return<z.infer<typeof Transmit>, z.infer<typeof Finalise>, z.infer<typeof Receive>> {
  yield {};
  return {
    next: StepType.enum.FINALISE,
  };
}
