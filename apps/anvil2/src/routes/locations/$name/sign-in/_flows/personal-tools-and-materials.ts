import { ErrorMap } from "@orpc/server";
import { z } from "zod";
import { InputStep, SignInParams, createInputStep, createOutputStep } from "./_types";

export const Input = createInputStep("PERSONAL_TOOLS_AND_MATERIALS").extend({}).and(InputStep);
export const Output = createOutputStep(["FINALISE"]).extend({});

export const Errors = {} as const satisfies ErrorMap;

export default async function (_: SignInParams<z.infer<typeof Input>>): Promise<z.infer<typeof Output>> {
  return {
    type: "FINALISE"
  }
}
