import Logger from "@/utils/logger";
import e from "@db/edgeql-js";
import { SignIn } from "@packages/types/root";
import { ErrorMap } from "@orpc/server";
import { z } from "zod/v4";
import { OutputStep, StepType, SignInStepInput, SignInParams } from "./_types";
import { createInputStep, InputStep } from "./_input";

export const Input = createInputStep("FINALISE").extend({}).and(InputStep);

export interface Output extends OutputStep, SignIn {
  currentType: "FINALISE"
  type: never
}

export const Errors = {} as const satisfies ErrorMap;

type SignInStepToType = {
  [Type in StepType]: Omit<
    Extract<z.infer<typeof SignInStepInput>, { type: Type }>,
    "name" | "ucard_number" | "previous" | "type" | "currentType"  // these are all redundant so don't let anyone use them
  >;
};

const flattenPrevious = (input: z.infer<typeof SignInStepInput>, ret: any = {}): SignInStepToType => {
  if (input.previous) {
    flattenPrevious(input.previous, ret);
  }
  ret[input.name] = input;
  return ret;
};

export default async function ({
  user,
  input,
  context: { tx },
  $location,
  $user,
}: SignInParams<z.infer<typeof Input>>): Promise<Output> {
  Logger.info(`Signing in user ${user.ucard_number}`);

  const inputs = flattenPrevious(input);
  return await e
    .select(
      e.insert(e.sign_in.SignIn, {
        location: $location,
        user: $user,
        reason: e.select(e.sign_in.Reason, () => ({ filter_single: inputs.REASON.reason })),
        tools: inputs.TOOLS.tools,
      }),
      () => ({
        type: "FINALISE",
      }),
    )
    .run(tx);
}
