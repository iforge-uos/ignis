import { ErrorMap } from "@orpc/server";
import e from "@packages/db/edgeql-js";
import * as z from "zod";
import { StepType, createFinaliseStep, createInitialiseStep, createReceiveStep, createTransmitStep } from "./_steps";
import type { Params, Return } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.MAILING_LISTS);

export const Transmit = createTransmitStep(StepType.enum.MAILING_LISTS);

export const Receive = createReceiveStep(StepType.enum.MAILING_LISTS);

export const Finalise = createFinaliseStep(StepType.enum.MAILING_LISTS, StepType.enum.REASON);

export const Errors = {} as const satisfies ErrorMap;

export default async function* (
  _: Params<z.infer<typeof Initialise>>,
): Return<z.infer<typeof Transmit>, z.infer<typeof Finalise>, z.infer<typeof Receive>> {
  yield {}
  return {
    next: StepType.enum.REASON,
  };
}
