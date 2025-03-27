import { SignInUser } from "@/utils/sign-in";
import { LocationNameSchema } from "@dbschema/edgedb-zod/modules/sign_in";
import { ErrorMap, ORPCErrorConstructorMap } from "@orpc/server";
import { z } from "zod";

export const StepType = z.enum([
  "REGISTER",
  "QUEUE",
  "AGREEMENTS",
  "REASON",
  "TOOLS",
  "PERSONAL_TOOLS_AND_MATERIALS",
  "FINALISE",
  "CANCEL",
  "INITIALISE",
]);

export type StepType = z.infer<typeof StepType>;
export const createStepSchema = <S extends StepType>(type: S) => z.object({ type: z.literal(type) });

// lil hack for recursive types
const BaseInputStep = z.object({ name: LocationNameSchema, ucard_number: z.string().regex(/\d{9,}/) });
type InputStep = z.output<typeof BaseInputStep> & {
  previous?: z.infer<typeof SignInStepInput>;
};
export const InputStep: z.ZodType<InputStep> = BaseInputStep.extend({
  previous: z.lazy(() => SignInStepInput.optional()),
});
export const OutputStep = z.object({ type: StepType });

import type { signIn } from "../$ucard";
import { Errors as AgreementsErrors, Input as AgreementsInput, Output as AgreementsOutput } from "./agreements";
import { Errors as CancelErrors, Input as CancelInput, Output as CancelOutput } from "./cancel";
import { Errors as FinaliseErrors, Input as FinaliseInput, Output as FinaliseOutput } from "./finalise";
import { Errors as InitialiseErrors, Input as InitialiseInput, Output as InitialiseOutput } from "./initialise";
import {
  Errors as PersonalToolsAndMaterialsErrors,
  Input as PersonalToolsAndMaterialsInput,
  Output as PersonalToolsAndMaterialsOutput,
} from "./personal-tools-and-materials";
import { Errors as QueueErrors, Input as QueueInput, Output as QueueOutput } from "./queue";
import { Errors as ReasonErrors, Input as ReasonInput, Output as ReasonOutput } from "./reasons";
import { Errors as RegisterErrors, Input as RegisterInput, Output as RegisterOutput } from "./register";
import { Errors as ToolsErrors, Input as ToolsInput, Output as ToolsOutput } from "./tools";

// sadly lil hack means no discriminatedUnion
export const SignInStepInput = z.union([
  RegisterInput,
  QueueInput,
  AgreementsInput,
  ReasonInput,
  ToolsInput,
  PersonalToolsAndMaterialsInput,
  FinaliseInput,
  CancelInput,
  InitialiseInput,
]);

export const SignInStepOutput = z.discriminatedUnion("type", [
  RegisterOutput,
  QueueOutput,
  AgreementsOutput,
  ReasonOutput,
  ToolsOutput,
  PersonalToolsAndMaterialsOutput,
  FinaliseOutput,
  CancelOutput,
  InitialiseOutput,
]);

export type SignInParams<T extends z.infer<typeof SignInStepInput>> = Omit<
  Parameters<(typeof signIn)["~orpc"]["handler"]>[0],
  "input" | "errors"
> & { input: T; user: SignInUser; errors: ORPCErrorConstructorMap<(typeof signIn)["~orpc"]["errorMap"]> };

export const SignInErrors = {
  ...AgreementsErrors,
  ...CancelErrors,
  ...FinaliseErrors,
  ...InitialiseErrors,
  ...PersonalToolsAndMaterialsErrors,
  ...QueueErrors,
  ...ReasonErrors,
  ...RegisterErrors,
  ...ToolsErrors,
} as const satisfies ErrorMap;
