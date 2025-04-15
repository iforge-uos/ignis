import { ErrorMap } from "@orpc/server";
import { z } from "zod";
import { InputStep, OutputStep, SignInParams, createInputStep } from "./_types";

export const Input = createInputStep("REGISTER").extend({}).and(InputStep);

export interface Output extends OutputStep {}

export const Errors = {} as const satisfies ErrorMap;

export default async function ({ user, input, context }: SignInParams<z.infer<typeof Input>>): Promise<Output> {
  input;
}
