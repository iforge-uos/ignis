import { ErrorMap } from "@orpc/server";
import { z } from "zod";
import {  OutputStep, SignInParams, } from "./_types";
import { createInputStep, InputStep } from "./_input";

export const Input = createInputStep("PERSONAL_TOOLS_AND_MATERIALS").extend({}).and(InputStep);

export interface Output extends OutputStep {
  type: "FINALISE";
}

export const Errors = {} as const satisfies ErrorMap;

export default async function (_: SignInParams<z.infer<typeof Input>>): Promise<Output> {
  return {
    type: "FINALISE",
  };
}
