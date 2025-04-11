import { ErrorMap } from "@orpc/server";
import { z } from "zod";
import { InputStep, SignInParams, createInputStep, createOutputStep } from "./_types";

export const Input = createInputStep("AGREEMENTS").extend({}).and(InputStep);
export const Output = createOutputStep(["MAILING_LISTS"]).extend({});
export const Errors = {} as const satisfies ErrorMap;

export default async function ({
  user,
  input,
  context,
}: SignInParams<z.infer<typeof Input>>): Promise<z.infer<typeof Output>> {
  return { type: "MAILING_LISTS" };
}
