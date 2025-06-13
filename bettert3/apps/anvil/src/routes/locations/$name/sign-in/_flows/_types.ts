import type { SignInUser } from "@/utils/sign-in";
import e from "@db/edgeql-js";
import { LocationNameSchema } from "@db/zod/modules/sign_in";
import type { ErrorMap, ORPCErrorConstructorMap } from "@orpc/server";
import type { Executor } from "gel";
import { z } from "zod/v4";

async function* _foo(): AsyncGenerator<z.ZodObject, any, any> {}

type BoundFunctionWithHandle<T extends (...args: any[]) => any> = T & { handle: boolean };
type FunctionWithHandle<T extends (...args: any[]) => any> = BoundFunctionWithHandle<T> & {
  bind: (thisArg: any, ...args: any[]) => BoundFunctionWithHandle<T>;
};

export function hasHandle<
  T extends (...args: any[]) => AsyncGenerator<TYield, TReturn, TNext>,
  TYield extends NonNullable<unknown>,
  TReturn,
  TNext extends NonNullable<unknown>,
>(fn: T): FunctionWithHandle<T> {
  (fn as any).handle = true;

  const original = fn.bind;
  (fn as any).bind = (thisArg: any, ...args: any[]): BoundFunctionWithHandle<T> => {
    const boundMethod = original.apply(fn, [thisArg, ...args]) as T;
    (boundMethod as any).handle = true;
    return boundMethod as BoundFunctionWithHandle<T>;
  };

  return fn as FunctionWithHandle<T>;
}



import { Tuple } from "@packages/types";
import type { create } from "../$ucard";
import {
  Receive as AgreementReceive,
  Transmit as AgreementTransmit,
  Errors as AgreementsErrors,
  Finalise as AgreementsFinalise,
  Initialise as AgreementsInitialise,
} from "./agreements";
import {
  Errors as CancelErrors,
  Finalise as CancelFinalise,
  Initialise as CancelInitialise,
  Receive as CancelReceive,
  Transmit as CancelTransmit,
} from "./cancel";
import {
  Errors as FinaliseErrors,
  Finalise as FinaliseFinalise,
  Initialise as FinaliseInitialise,
  Receive as FinaliseReceive,
  Transmit as FinaliseTransmit,
} from "./finalise";
import {
  Errors as InitialiseErrors,
  Finalise as InitialiseFinalise,
  Initialise as InitialiseInitialise,
  Receive as InitialiseReceive,
  Transmit as InitialiseTransmit,
} from "./initialise";
import {
  Errors as MailingListsErrors,
  Finalise as MailingListsFinalise,
  Initialise as MailingListsInitialise,
  Receive as MailingListsReceive,
  Transmit as MailingListsTransmit,
} from "./mailing-lists";
import {
  Errors as PersonalToolsAndMaterialsErrors,
  Finalise as PersonalToolsAndMaterialsFinalise,
  Initialise as PersonalToolsAndMaterialsInitialise,
  Receive as PersonalToolsAndMaterialsReceive,
  Transmit as PersonalToolsAndMaterialsTransmit,
} from "./personal-tools-and-materials";
import {
  Errors as QueueErrors,
  Finalise as QueueFinalise,
  Initialise as QueueInitialise,
  Receive as QueueReceive,
  Transmit as QueueTransmit,
} from "./queue";
import {
  Errors as ReasonErrors,
  Finalise as ReasonFinalise,
  Initialise as ReasonInitialise,
  Receive as ReasonReceive,
  Transmit as ReasonTransmit,
} from "./reasons";
import {
  Errors as RegisterErrors,
  Finalise as RegisterFinalise,
  Initialise as RegisterInitialise,
  Receive as RegisterReceive,
  Transmit as RegisterTransmit,
} from "./register";
import {
  Errors as ToolsErrors,
  Finalise as ToolsFinalise,
  Initialise as ToolsInitialise,
  Receive as ToolsReceive,
  Transmit as ToolsTransmit,
} from "./tools";

export const SignInStepInitialise = z.union([
  RegisterInitialise,
  QueueInitialise,
  AgreementsInitialise,
  ReasonInitialise,
  ToolsInitialise,
  MailingListsInitialise,
  PersonalToolsAndMaterialsInitialise,
  FinaliseInitialise,
  CancelInitialise,
  InitialiseInitialise,
]);

export const SignInReceive = z.union([
  RegisterReceive,
  QueueReceive,
  AgreementReceive,
  ReasonReceive,
  ToolsReceive,
  MailingListsReceive,
  PersonalToolsAndMaterialsReceive,
  FinaliseReceive,
  CancelReceive,
  InitialiseReceive,
]);

export const SignInTransmit = z.union([
  RegisterTransmit,
  QueueTransmit,
  AgreementTransmit,
  ReasonTransmit,
  ToolsTransmit,
  MailingListsTransmit,
  PersonalToolsAndMaterialsTransmit,
  FinaliseTransmit,
  CancelTransmit,
  InitialiseTransmit,
]);

export const SignInStepFinalise = z.union([
  RegisterFinalise,
  QueueFinalise,
  AgreementsFinalise,
  ReasonFinalise,
  ToolsFinalise,
  MailingListsFinalise,
  PersonalToolsAndMaterialsFinalise,
  FinaliseFinalise,
  CancelFinalise,
  InitialiseFinalise,
]);

const _LOCATION_QUERY = e.assert_exists(
  e.select(e.sign_in.Location, () => ({ filter_single: { name: "MAINSPACE" as const } })),
);
const _USER_QUERY = e.assert_exists(e.select(e.users.User, () => ({ filter_single: { id: "" } })));

type _SignInParams = Parameters<(typeof create)["~orpc"]["handler"]>[0];
export type SignInParams<T extends z.infer<typeof SignInStepInitialise>> = Omit<
  _SignInParams,
  "input" | "errors" | "path" | "procedure" | "lastEventId" | "context" // lastEventId is handled implicitly by the system
> & {
  input: T;
  user: SignInUser;
  $user: typeof _USER_QUERY;
  $location: typeof _LOCATION_QUERY;
  errors: ORPCErrorConstructorMap<(typeof create)["~orpc"]["errorMap"]>;
  context: Omit<_SignInParams["context"], "tx"> & { tx: Executor };
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

export type Graph = { [KeyT in z.infer<typeof SignInStepFinalise> as KeyT["type"]]: Tuple<KeyT["next"]> };
