import type { SignInUser } from "@/lib/utils/queries";
import type { ErrorMap, ORPCErrorConstructorMap } from "@orpc/server";
import e from "@packages/db/edgeql-js";
import { Tuple } from "@packages/types";
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
  Errors as ToolsErrors,
  Finalise as ToolsFinalise,
  Initialise as ToolsInitialise,
  Receive as ToolsReceive,
  Transmit as ToolsTransmit,
} from "./tools";

// The types used for the sign in. I've tried to co-locate things as much as possible, I would like a way to do this
// automatically rather than doing this for each type manually. If you add a new step you need to add to these objects/lists.

export const Errors = {
  ...AgreementsErrors,
  ...CancelErrors,
  ...FinaliseErrors,
  ...InitialiseErrors,
  ...MailingListsErrors,
  ...PersonalToolsAndMaterialsErrors,
  ...QueueErrors,
  ...ReasonErrors,
  ...ToolsErrors,
  ...SignOutErrors,
} as const satisfies ErrorMap;

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
  SignOutFinalise,
]);

const _LOCATION_QUERY = e.assert_exists(
  e.select(e.sign_in.Location, () => ({ filter_single: { name: "MAINSPACE" as const } })),
);
const _USER_QUERY = e.assert_exists(e.select(e.users.User, () => ({ filter_single: { id: "" } })));
const _LOGGED_IN_USER_QUERY = e.assert_exists(e.global.user);

// the types used in a sign in step
type _SignInParams = Parameters<(typeof flow)["~orpc"]["handler"]>[0];
export type Params<T extends z.infer<typeof Initialise>> = Omit<
  _SignInParams,
  "input" | "errors" | "path" | "procedure" | "lastEventId" | "context" // lastEventId is handled implicitly by the system
> & {
  input: T;
  user: SignInUser;
  $user: typeof _USER_QUERY | typeof _LOGGED_IN_USER_QUERY;
  $location: typeof _LOCATION_QUERY;
  errors: ORPCErrorConstructorMap<(typeof flow)["~orpc"]["errorMap"]>;
  context: Omit<_SignInParams["context"], "tx"> & { tx: Executor };
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
