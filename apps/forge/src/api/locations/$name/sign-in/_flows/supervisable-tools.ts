import * as z from "zod";
import { getSignInTools, GetSignInToolsReturns } from "@packages/db/queries/getSignInTools.query";
import { StepType, createErrorMap, createFinaliseStep, createInitialiseStep, createReceiveStep, createTransmitStep } from "./_steps";
import type { Params, Return } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.SUPERVISABLE_TOOLS);

export const Transmit = createTransmitStep(StepType.enum.SUPERVISABLE_TOOLS).extend({
  tools: z.custom<GetSignInToolsReturns>(),
});

export const Receive = createReceiveStep(StepType.enum.SUPERVISABLE_TOOLS);

export const Finalise = createFinaliseStep(StepType.enum.SUPERVISABLE_TOOLS, StepType.enum.FINALISE);

export const Errors = createErrorMap(StepType.enum.SUPERVISABLE_TOOLS, {} as const);

export default async function* ({
  user,
  input: { name },
  context: { tx },
}: Params<z.infer<typeof Initialise>>): Return<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  const tools = await getSignInTools(tx, { id: user.id, name, collapse: true });

  yield { tools };

  return {
    next: StepType.enum.FINALISE,
  };
}
