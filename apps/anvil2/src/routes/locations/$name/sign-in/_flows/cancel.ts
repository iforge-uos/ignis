import { RollbackTransaction } from "@/router";
import { ErrorMap } from "@orpc/server";
import { z } from "zod";
import { InputStep, SignInParams, createInputStep, createOutputStep } from "./_types";

export const Input = createInputStep("CANCEL").and(InputStep);
export const Output = createOutputStep([]).extend({});
export const Errors = {} as const satisfies ErrorMap;

export default async function ({}: SignInParams<z.infer<typeof Input>>): Promise<z.infer<typeof Output>> {
  throw new RollbackTransaction({ type: "CANCEL" });
}
