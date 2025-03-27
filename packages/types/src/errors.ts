import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

/** If an error can feasibly be hit by the UI it should have an associated error code for checking against on the front end */
const ERROR_CODES = [
  "NOT_REGISTERED",
  "ALREADY_REGISTERED",
  "LDAP_NOT_FOUND",
  "ALREADY_SIGNED_IN_TO_LOCATION",
  "QUEUE_FULL",
  "LOCATION_FULL_AND_QUEUE_DISABLED",
  "AGREEMENT_NOT_SIGNED",
  "NOT_IN_QUEUE",
  "AGREEMENT_ALREADY_SIGNED",
  "NOT_REP",
  "NOT_SIGNED_IN",
  "QUEUE_DISABLED",
  "USER_HAS_ACTIVE_INFRACTIONS",
  "COMPULSORY_TRAINING_MISSING",
  "INTERACTABLE_NOT_FOUND",
  "USER_TRYING_TO_COMPLETE_REP_TRAINING",
  "CSRF_ERROR",
] as const;

export type ErrorCode = TRPC_ERROR_CODE_KEY | `anvil::${(typeof ERROR_CODES)[number]}`;
