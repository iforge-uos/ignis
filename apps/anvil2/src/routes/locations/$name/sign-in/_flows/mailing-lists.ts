import e from "@db/edgeql-js";
import { ErrorMap } from "@orpc/server";
import { z } from "zod";
import { InputStep, SignInParams, createInputStep, createOutputStep } from "./_types";

export const Input = createInputStep("MAILING_LISTS").extend({}).and(InputStep);
export const Output = createOutputStep(["AGREEMENTS"]);

export const Errors = {} as const satisfies ErrorMap;

export default async function ({
  $user,
  input,
  context: { tx },
  errors,
}: SignInParams<z.infer<typeof Input>>): Promise<z.infer<typeof Output>> {

  return {
    type: "AGREEMENTS",
  };
}
