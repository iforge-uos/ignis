import Logger from "@/utils/logger";
import e from "@db/edgeql-js";
import { ErrorMap } from "@orpc/server";
import { z } from "zod";
import { InputStep, SignInParams, SignInStepInput, StepType, createInputStep, createOutputStep } from "./_types";

export const Input = createInputStep("FINALISE").extend({}).and(InputStep);
export const Output = createOutputStep([]).extend({});
export const Errors = {} as const satisfies ErrorMap;

type SignInStepToType = {
  [Property in StepType]: Omit<
    Extract<z.infer<typeof SignInStepInput>, { type: Property }>,
    "name" | "ucard_number" | "previous" | "type" // these are all redundant so don't let anyone use them
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
  context,
  $location,
  $user,
}: SignInParams<z.infer<typeof Input>>): Promise<z.infer<typeof Output>> {
  Logger.info(`Signing in user ${user.ucard_number}`);

  const inputs = flattenPrevious(input);
  e.insert(e.sign_in.SignIn, {
    location: $location,
    user: $user,
    reason: e.select(e.sign_in.Reason, () => ({filter_single: inputs.REASON.reason})),
    tools: inputs.TOOLS.tools
  });
}
