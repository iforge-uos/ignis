import { ErrorMap } from "@orpc/server";
import { z } from "zod/v4";
import { InputStep, createInputStep } from "./_input";
import { OutputStep, SignInParams } from "./_types";

export const Input = createInputStep("TOOLS").extend({}).and(InputStep);

export interface Output extends OutputStep {
  currentType: "TOOLS";
  type: "FINALISE";
}

export const Errors = {} as const satisfies ErrorMap;

export default async function ({ user, input, context,  }: SignInParams<z.infer<typeof Input>>): Promise<Output> {
  return {
    currentType: "TOOLS",
    type: "AGREEMENTS",
  };
}
