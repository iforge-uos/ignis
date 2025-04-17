import { SignInUser } from "@/utils/sign-in";
import e from "@db/edgeql-js";
import { LocationNameSchema } from "@db/zod/modules/sign_in";
import { ErrorMap, ORPCErrorConstructorMap } from "@orpc/server";
import type { Executor } from "gel";
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
  "SIGN_OUT",
  "PROVISIONAL_AGREEMENT",
  "MAILING_LISTS",
]);

export type StepType = z.infer<typeof StepType>;

// lil hack for recursive types
const BaseInputStep = z.object({ name: LocationNameSchema, ucard_number: z.string().regex(/\d{9,}/) });
type InputStep = z.infer<typeof BaseInputStep> & {
  previous?: z.infer<typeof SignInStepInput>;
};
export const InputStep: z.ZodType<InputStep> = BaseInputStep.extend({
  previous: z.lazy(() => SignInStepInput.optional()),
});

export interface OutputStep {
  type: StepType;
}

import type { signIn } from "../$ucard";
import { Errors as AgreementsErrors, Input as AgreementsInput, Output as AgreementsOutput } from "./agreements";
import { Errors as CancelErrors, Input as CancelInput, Output as CancelOutput } from "./cancel";
import { Errors as FinaliseErrors, Input as FinaliseInput, Output as FinaliseOutput } from "./finalise";
import { Errors as InitialiseErrors, Input as InitialiseInput, Output as InitialiseOutput } from "./initialise";
import { Errors as MailingListsErrors, Input as MailingListsInput, Output as MailingListsOutput } from "./mailing-lists"; // biome-ignore format: <explanation>
import { Errors as PersonalToolsAndMaterialsErrors, Input as PersonalToolsAndMaterialsInput, Output as PersonalToolsAndMaterialsOutput } from "./personal-tools-and-materials"; // biome-ignore format: <explanation>
import { Errors as QueueErrors, Input as QueueInput, Output as QueueOutput } from "./queue";
import { Errors as ReasonErrors, Input as ReasonInput, Output as ReasonOutput } from "./reasons";
import { Errors as RegisterErrors, Input as RegisterInput, Output as RegisterOutput } from "./register";
import { Errors as ToolsErrors, Input as ToolsInput, Output as ToolsOutput } from "./tools";

// sadly lil hack means no discriminatedUnion, easily >:)
// if (Object.keys(StepType.Values).length !== SignInStepInputTuple.length)
// throw Error(`Not all sign in types seem to be imported ${new Set(Object.keys(StepType.Values)).difference(new Set(SignInStepInputTuple.map(t => t._type.type)))}`);

// we have no real type difference between the union and the discriminatedUnion here (type is required though they
// aren't enforced as unique). So we should use the benefits of the union version which works
export const SignInStepInput = z.union([
  RegisterInput,
  QueueInput,
  AgreementsInput,
  ReasonInput,
  ToolsInput,
  MailingListsInput,
  PersonalToolsAndMaterialsInput,
  FinaliseInput,
  CancelInput,
  InitialiseInput,
]);

// const SignInStepOutputTuple = [
//   RegisterOutput,
//   QueueOutput,
//   AgreementsOutput,
//   ReasonOutput,
//   ToolsOutput,
//   MailingListsOutput,
//   PersonalToolsAndMaterialsOutput,
//   FinaliseOutput,
//   CancelOutput,
//   InitialiseOutput,
// ] as const;
// if (Object.keys(StepType.Values).length !== SignInStepInputTuple.length)
//   throw Error(`Not all sign in types seem to be imported ${Object.keys(StepType.Values)}`);

export type SignInStepOutput =
  | RegisterOutput
  | QueueOutput
  | AgreementsOutput
  | ReasonOutput
  | ToolsOutput
  | MailingListsOutput
  | PersonalToolsAndMaterialsOutput
  | FinaliseOutput
  | CancelOutput
  | InitialiseOutput;

const _LOCATION_QUERY = e.assert_exists(
  e.select(e.sign_in.Location, () => ({ filter_single: { name: "MAINSPACE" as const } })),
);
const _USER_QUERY = e.assert_exists(e.select(e.users.User, () => ({ filter_single: { id: "" } })));

export type SignInParams<T extends z.infer<typeof SignInStepInput>> = Omit<
  Parameters<(typeof signIn)["~orpc"]["handler"]>[0],
  "input" | "errors" | "path" | "procedure" | "lastEventId"
> & {
  input: T;
  user: SignInUser;
  $user: typeof _USER_QUERY;
  $location: typeof _LOCATION_QUERY;
  errors: ORPCErrorConstructorMap<(typeof signIn)["~orpc"]["errorMap"]>;
  context: { tx: Executor };
};

export const SignInErrors = {
  ...AgreementsErrors,
  ...CancelErrors,
  ...FinaliseErrors,
  ...InitialiseErrors,
  ...MailingListsErrors,
  ...PersonalToolsAndMaterialsErrors,
  ...QueueErrors,
  ...ReasonErrors,
  ...RegisterErrors,
  ...ToolsErrors,
} as const satisfies ErrorMap;
