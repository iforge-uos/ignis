import { ErrorMap } from "@orpc/server";
import { z } from "zod";
import { InputStep, SignInParams, createStepSchema } from "./_types";

const Step = createStepSchema("AGREEMENTS");
export const Input = Step.extend({}).and(InputStep);
export const Output = Step.extend({ f: z.string() });
export const Errors = {} as const satisfies ErrorMap;

export default async function ({
  user,
  input,
  context,
}: SignInParams<z.infer<typeof Input>>): Promise<z.infer<typeof Output>> {}
