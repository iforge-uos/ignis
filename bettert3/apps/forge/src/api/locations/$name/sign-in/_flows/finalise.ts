import e from "@packages/db/edgeql-js";
import { ErrorMap } from "@orpc/server";
import { logger } from "@sentry/bun";
import { z } from "zod/v4";
import { createFinaliseStep, createInitialiseStep, StepType } from "./_steps";
import { type SignInParams } from "./_types";

export const Initialise = createInitialiseStep(StepType.enum.FINALISE);

export const Transmit = z.object({ type: z.literal(StepType.enum.FINALISE) });

export const Receive = z.object({ type: z.literal(StepType.enum.FINALISE) });

export const Finalise = createFinaliseStep(StepType.enum.FINALISE, z.union([])).extend({
  sign_in: z.object({ id: z.uuid() }),
});

export const Errors = {} as const satisfies ErrorMap;

export default async function* ({
  user,
  input,
  context: { tx },
  $location,
  $user,
}: SignInParams<z.infer<typeof Initialise>>): AsyncGenerator<
  z.infer<typeof Transmit>,
  z.infer<typeof Finalise>,
  z.infer<typeof Receive>
> {
  logger.info(logger.fmt`Signing in user ${user.ucard_number}`);

  const inputs = flattenPrevious(input);
  const sign_in = await e
    .select(
      e.insert(e.sign_in.SignIn, {
        location: $location,
        user: $user,
        reason: e.select(e.sign_in.Reason, () => ({ filter_single: inputs.REASON.reason })),
        tools: inputs.TOOLS.tools,
      }),
      () => ({
        id: true,
      }),
    )
    .run(tx);

  return { type: StepType.enum.FINALISE, next: undefined as never, sign_in };
}