import { ErrorMap } from "@orpc/server";
import e from "@packages/db/edgeql-js";
import { z } from "zod/v4";
import { StepType, createFinaliseStep, createInitialiseStep, createTransmitStep } from "./_steps";
import type { Params, Return } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.MAILING_LISTS);

export const Transmit = createTransmitStep(StepType.enum.MAILING_LISTS);

export const Receive = z.object({ type: z.literal(StepType.enum.MAILING_LISTS) });

export const Finalise = createFinaliseStep(StepType.enum.MAILING_LISTS, StepType.enum.AGREEMENTS);

export const Errors = {} as const satisfies ErrorMap;

// biome-ignore lint/correctness/useYield: <explanation>
export default async function* (
  _: Params<z.infer<typeof Initialise>>,
): Return<z.infer<typeof Transmit>, z.infer<typeof Finalise>, z.infer<typeof Receive>> {
  return {
    next: StepType.enum.AGREEMENTS,
  };
}
