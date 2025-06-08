import { ErrorMap } from "@orpc/server";
import { z } from "zod/v4";
import { InputStep, createInputStep } from "./_input";
import type { OutputStep, SignInParams } from "./_types";

export const Input = createInputStep("AGREEMENTS").extend({}).and(InputStep);

export interface Output extends OutputStep {
  currentType: "AGREEMENTS";
  type: "MAILING_LISTS";
}

export const Errors = {} as const satisfies ErrorMap;

export default async function ({ user, input, context }: SignInParams<z.infer<typeof Input>>): Promise<Output> {
  return { type: "MAILING_LISTS" };
}
