import e from "@packages/db/edgeql-js";
import { logger } from "@sentry/tanstackstart-react";
import * as z from "zod";
import {
  SIGN_INS,
  StepType,
  createErrorMap,
  createFinaliseStep,
  createInitialiseStep,
  createReceiveStep,
  createTransmitStep,
} from "./_steps";
import type { Params, Return } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.FINALISE);

export const Transmit = createTransmitStep(StepType.enum.FINALISE);

export const Receive = createReceiveStep(StepType.enum.FINALISE);

export const Finalise = createFinaliseStep(StepType.enum.FINALISE, z.undefined()).extend({
  sign_in: z.object({ id: z.uuid() }),
});

export const Errors = createErrorMap(StepType.enum.FINALISE, {} as const);

export default async function* ({
  user,
  input,
  context: { tx },
  $location,
  $user,
}: Params<z.infer<typeof Initialise>>): Return<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  logger.info(logger.fmt`Signing in user ${user.ucard_number}`);

  const inputs = SIGN_INS[`${input.name}-${input.ucard_number}`];
  const sign_in = await e
    .insert(e.sign_in.SignIn, {
      location: $location,
      user: $user,
      reason: e.select(e.sign_in.Reason, () => ({ filter_single: inputs.REASON.RECEIVE.reason })),
      tools: [],
      _tools: e.op("distinct", e.cast(
        e.op(e.tools.Tool, "|", e.tools.GroupedTool),
        e.cast(e.uuid, e.set(...((inputs.TOOLS?.RECEIVE?.tools ?? []).map(({ id }) => id)))),
      )),
    })
    .run(tx);
  yield {};
  return { next: undefined as never, sign_in };
}
