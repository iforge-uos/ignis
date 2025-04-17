import e from "@db/edgeql-js";
import { ErrorMap } from "@orpc/server";
import { z } from "zod";
import {  OutputStep, SignInParams, } from "./_types";
import { createInputStep, InputStep } from "./_input";

export const Input = createInputStep("MAILING_LISTS").extend({}).and(InputStep);

export interface Output extends OutputStep {
  type: "AGREEMENTS";
}

export const Errors = {} as const satisfies ErrorMap;

export default async function ({
  $user,
  input,
  context: { tx },
  errors,
}: SignInParams<z.infer<typeof Input>>): Promise<Output> {
  return {
    type: "AGREEMENTS",
  };
}
