import { ErrorMap } from "@orpc/server";
import { z } from "zod/v4";
import { InputStep, createInputStep } from "./_input";
import { OutputStep, SignInParams } from "./_types";

export const Input = createInputStep("REGISTER").extend({}).and(InputStep);

export interface Output extends OutputStep {
  currentType: "REGISTER";
  type: "PROVISIONAL_AGREEMENT";
}

export const Errors = {} as const satisfies ErrorMap;

export default async function ({ user, input, context }: SignInParams<z.infer<typeof Input>>): Promise<Output> {
  return {};
}
