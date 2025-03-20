import { ErrorMap } from "@orpc/server";
import { z } from "zod";
import { InputStep, SignInParams, createStepSchema } from "./_types";

const Step = createStepSchema("REASON");
export const Input = Step.extend({ reason: z.object({ id: z.string().uuid() }) }).and(InputStep);
export const Output = Step.extend({});
export const Errors = {} as const satisfies ErrorMap;

export default async function ({
  user,
  input,
  context,
}: SignInParams<z.infer<typeof Input>>): Promise<z.infer<typeof Output>> {
  // if (input)
}
