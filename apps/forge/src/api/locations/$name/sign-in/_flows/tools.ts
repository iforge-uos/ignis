import * as z from "zod";
import { GetSignInToolsReturns, getSignInTools } from "@/lib/utils/sign-in-tools";
import {
  createErrorMap,
  createFinaliseStep,
  createInitialiseStep,
  createReceiveStep,
  createTransmitStep,
  StepType,
} from "./_steps";
import type { Params, Return } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.TOOLS);

export const Transmit = createTransmitStep(StepType.enum.TOOLS).extend({
  tools: z.custom<GetSignInToolsReturns>(),
});

export const Receive = createReceiveStep(StepType.enum.TOOLS).extend({
  tools: z.array(z.object({ id: z.uuid() })),
});

export const Finalise = createFinaliseStep(StepType.enum.TOOLS, StepType.enum.FINALISE);

export const Errors = createErrorMap(StepType.enum.TOOLS, {} as const);

export default async function* ({
  user: { id },
  input: { name },
  context: { tx },
}: Params<z.infer<typeof Initialise>>): Return<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  const tools = await getSignInTools(tx, { id, name, collapse: false });

  const selected = yield { tools };

  return {
    next: StepType.enum.FINALISE,
  };
}
