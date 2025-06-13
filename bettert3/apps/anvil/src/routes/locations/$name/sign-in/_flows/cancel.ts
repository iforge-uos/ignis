import { RollbackTransaction } from "@/router";
import { ErrorMap } from "@orpc/server";
import { z } from "zod/v4";
import { createFinaliseStep, createInitialiseStep, StepType } from "./_steps";
import { type SignInParams } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.CANCEL);

export const Transmit = z.undefined();

export const Receive = z.undefined();

export const Finalise = createFinaliseStep(StepType.enum.CANCEL, StepType.enum.FINALISE);

export const Errors = {} as const satisfies ErrorMap;

// biome-ignore lint/correctness/useYield: <explanation>
export default async function* (
  _: SignInParams<z.infer<typeof Initialise>>,
): AsyncGenerator<z.infer<typeof Transmit>, z.infer<typeof Finalise>, z.infer<typeof Receive>> {
  throw new RollbackTransaction({ type: StepType.enum.CANCEL, next: "FINALISE" } as z.infer<typeof Finalise>);
}
