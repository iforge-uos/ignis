import { ErrorMap } from "@orpc/server";
import { z } from "zod";
import { InputStep, SignInParams, createInputStep, createOutputStep } from "./_types";

export const Input = createInputStep("TOOLS").extend({ hi: z.string() }).and(InputStep);
export const Output = createOutputStep([]).extend({});
export const Errors = {} as const satisfies ErrorMap;

export default async function ({
  user,
  input,
  context,
}: SignInParams<z.infer<typeof Input>>): Promise<z.infer<typeof Output>> {}
