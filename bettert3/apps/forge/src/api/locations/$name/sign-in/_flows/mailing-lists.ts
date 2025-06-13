import e from "@packages/db/edgeql-js";
import { ErrorMap } from "@orpc/server";
import { z } from "zod/v4";
import { createFinaliseStep, createInitialiseStep, StepType } from "./_steps";
import { type SignInParams } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.MAILING_LISTS);

export const Transmit = z.object({ type: z.literal(StepType.enum.MAILING_LISTS) });

export const Receive = z.object({ type: z.literal(StepType.enum.MAILING_LISTS) });

export const Finalise = createFinaliseStep(StepType.enum.MAILING_LISTS, StepType.enum.AGREEMENTS);

export const Errors = {} as const satisfies ErrorMap;

// biome-ignore lint/correctness/useYield: <explanation>
export default async function* (
  _: SignInParams<z.infer<typeof Initialise>>,
): AsyncGenerator<z.infer<typeof Transmit>, z.infer<typeof Finalise>, z.infer<typeof Receive>> {
  return {
    type: StepType.enum.MAILING_LISTS,
    next: StepType.enum.AGREEMENTS,
  };
}
