import { RollbackTransaction } from "@/router";
import { ErrorMap } from "@orpc/server";
import { z } from "zod";
import { InputStep, SignInParams, createStepSchema } from "./_types";

const Step = createStepSchema("CANCEL");
export const Input = Step.and(InputStep);
export const Output = Step.extend({});
export const Errors = {} as const satisfies ErrorMap;

export default async function ({}: SignInParams<z.infer<typeof Input>>): Promise<z.infer<typeof Output>> {
  throw new RollbackTransaction({ type: "CANCEL" });
}
