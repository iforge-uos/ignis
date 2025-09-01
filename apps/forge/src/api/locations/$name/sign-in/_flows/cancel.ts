import { RollbackTransaction } from "@/orpc";
import { ErrorMap } from "@orpc/server";
import * as z from "zod";
import { StepType, createFinaliseStep, createInitialiseStep, createReceiveStep, createTransmitStep } from "./_steps";
import type { Params, Return } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.CANCEL);

export const Transmit = createTransmitStep(StepType.enum.CANCEL);

export const Receive = createReceiveStep(StepType.enum.CANCEL)

export const Finalise = createFinaliseStep(StepType.enum.CANCEL, z.undefined());

export const Errors = {} as const satisfies ErrorMap;

// biome-ignore lint/correctness/useYield: <explanation>
export default async function* (
  _: Params<z.infer<typeof Initialise>>,
): Return<z.infer<typeof Transmit>, z.infer<typeof Finalise>, z.infer<typeof Receive>> {
  console.log("Exiting")
  throw new RollbackTransaction();
  yield {type: "CANCEL"}
}
