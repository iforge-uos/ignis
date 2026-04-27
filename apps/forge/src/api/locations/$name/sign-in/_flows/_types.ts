import type { SignInUser, createTransaction } from "@/lib/utils/queries";
import type { ORPCErrorConstructorMap } from "@orpc/server";
import type { ORPCErrorFromErrorMap } from "@orpc/contract";
import e from "@packages/db/edgeql-js";
import { Tuple, UnionToIntersection } from "@packages/types";
import type { Executor } from "gel";
import * as z from "zod";

import type { flow } from "../$ucard";
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
  Errors as SignOutErrors,
  Finalise as SignOutFinalise,
  Initialise as SignOutInitialise,
  Receive as SignOutReceive,
  Transmit as SignOutTransmit,
} from "./sign-out";
import {
  Errors as SupervisableToolsErrors,
  Finalise as SupervisableToolsFinalise,
  Initialise as SupervisableToolsInitialise,
  Receive as SupervisableToolsReceive,
  Transmit as SupervisableToolsTransmit,
} from "./supervisable-tools";
import {
  Errors as ToolsErrors,
  Finalise as ToolsFinalise,
  Initialise as ToolsInitialise,
  Receive as ToolsReceive,
  Transmit as ToolsTransmit,
} from "./tools";

// The types used for the sign in. I've tried to co-locate things as much as possible, I would like a way to do this
// automatically rather than doing this for each type manually. If you add a new step you need to add to these objects/lists.

const _Errors = [
  AgreementsErrors,
  CancelErrors,
  FinaliseErrors,
  InitialiseErrors,
  MailingListsErrors,
  PersonalToolsAndMaterialsErrors,
  QueueErrors,
  ReasonErrors,
  SupervisableToolsErrors,
  ToolsErrors,
  SignOutErrors,
] as const;
export const Errors = _Errors.map((errors) => errors.map) as unknown as UnionToIntersection<typeof _Errors[number]["map"]>; // for server side orpc
export type ErrorMap = { [KeyT in (typeof _Errors)[number] as KeyT["type"]]: ORPCErrorFromErrorMap<KeyT["map"]> }; // for client side error handling

export const Initialise = z.discriminatedUnion("type", [
  QueueInitialise,
  AgreementsInitialise,
  ReasonInitialise,
  ToolsInitialise,
  MailingListsInitialise,
  PersonalToolsAndMaterialsInitialise,
  FinaliseInitialise,
  CancelInitialise,
  InitialiseInitialise,
  SupervisableToolsInitialise,
  SignOutInitialise,
]);

export const Receive = z.discriminatedUnion("type", [
  QueueReceive,
  AgreementReceive,
  ReasonReceive,
  ToolsReceive,
  MailingListsReceive,
  PersonalToolsAndMaterialsReceive,
  FinaliseReceive,
  CancelReceive,
  InitialiseReceive,
  SupervisableToolsReceive,
  SignOutReceive,
]);

export const Transmit = z.discriminatedUnion("type", [
  QueueTransmit,
  AgreementTransmit,
  ReasonTransmit,
  ToolsTransmit,
  MailingListsTransmit,
  PersonalToolsAndMaterialsTransmit,
  FinaliseTransmit,
  CancelTransmit,
  InitialiseTransmit,
  SupervisableToolsTransmit,
  SignOutTransmit,
]);

export const Finalise = z.union([
  QueueFinalise,
  AgreementsFinalise,
  ReasonFinalise,
  ToolsFinalise,
  MailingListsFinalise,
  PersonalToolsAndMaterialsFinalise,
  FinaliseFinalise,
  CancelFinalise,
  InitialiseFinalise,
  SupervisableToolsFinalise,
  SignOutFinalise,
]);

const _LOCATION_QUERY = e.assert_exists(
  e.select(e.sign_in.Location, () => ({ filter_single: { name: "MAINSPACE" as const } })),
);
const _USER_QUERY = e.assert_exists(e.select(e.users.User, () => ({ filter_single: { id: "" } })));
const _LOGGED_IN_USER_QUERY = e.assert_exists(e.global.user); // you don't ever get this but it makes types nice

// the types used in a sign in step
export type _SignInParams = Parameters<(typeof flow)["~orpc"]["handler"]>[0] & { context: { tx: Transaction } };
export type Params<T extends z.infer<typeof Initialise>> = Omit<
  _SignInParams,
  "input" | "errors" | "path" | "procedure" | "lastEventId" | "context" // lastEventId is handled implicitly by the system
> & {
  input: T;
  user: SignInUser;
  $user: typeof _USER_QUERY | typeof _LOGGED_IN_USER_QUERY;
  $location: typeof _LOCATION_QUERY;
  errors: ORPCErrorConstructorMap<UnionToIntersection<typeof _Errors[number]["map"]>>;
  context: Omit<_SignInParams["context"], "tx"> & { tx: Awaited<ReturnType<typeof createTransaction>> };
};

export type Return<
  Tx extends z.infer<typeof Transmit>,
  Fin extends z.infer<typeof Finalise>,
  Rx extends z.infer<typeof Receive>,
> = AsyncGenerator<Omit<Tx, "type">, Omit<Fin, "type">, Rx>;

/**
 * The adjacency "list" (object) for sign in. This has to be constructed on the frontend manually sadly
 */
export type Graph = { [KeyT in z.infer<typeof Finalise> as KeyT["type"]]: Tuple<KeyT["next"]> };
