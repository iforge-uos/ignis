import * as z from "zod";
import {
  StepType,
  createErrorMap,
  createFinaliseStep,
  createInitialiseStep,
  createReceiveStep,
  createTransmitStep,
} from "./_steps";
import type { Params, Return } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.CANCEL);

export const Transmit = createTransmitStep(StepType.enum.CANCEL);

export const Receive = createReceiveStep(StepType.enum.CANCEL);

export const Finalise = createFinaliseStep(StepType.enum.CANCEL, z.undefined());

export const Errors = createErrorMap(StepType.enum.CANCEL, {} as const);

export default async function* ({
  context: { tx },
}: Params<z.infer<typeof Initialise>>): Return<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  await tx.rollback();
  yield { type: "CANCEL" };
}
