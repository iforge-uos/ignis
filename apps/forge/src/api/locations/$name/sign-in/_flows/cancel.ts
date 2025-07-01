import { RollbackTransaction } from "@/orpc";
import { ErrorMap } from "@orpc/server";
import { z } from "zod/v4";
import { StepType, createFinaliseStep, createInitialiseStep, createTransmitStep } from "./_steps";
import type { Params, Return } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.CANCEL);

export const Transmit = createTransmitStep(StepType.enum.CANCEL);

export const Receive = z.object({ type: z.literal(StepType.enum.CANCEL) });

export const Finalise = createFinaliseStep(StepType.enum.CANCEL, z.undefined());

export const Errors = {} as const satisfies ErrorMap;

// biome-ignore lint/correctness/useYield: <explanation>
export default async function* (
  _: Params<z.infer<typeof Initialise>>,
): Return<z.infer<typeof Transmit>, z.infer<typeof Finalise>, z.infer<typeof Receive>> {
  throw new RollbackTransaction();
}
