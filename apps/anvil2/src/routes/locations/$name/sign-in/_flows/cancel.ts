import { RollbackTransaction } from "@/router";
import { ErrorMap } from "@orpc/server";
import { z } from "zod/v4";
import { OutputStep, SignInParams } from "./_types";
import { createInputStep, InputStep } from "./_input";

export const Input = createInputStep("CANCEL").and(InputStep);

export interface Output extends OutputStep {}

export const Errors = {} as const satisfies ErrorMap;

export default async function ({}: SignInParams<z.infer<typeof Input>>): Promise<Output> {
  throw new RollbackTransaction({ type: "CANCEL" });
}
