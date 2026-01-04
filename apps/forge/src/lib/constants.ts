import { Temporal } from "@js-temporal/polyfill";
import type { notification, sign_in, training, users } from "@packages/db/interfaces";
import type { Tuple } from "@packages/types";

export const TRAINING_LOCATIONS = ["MAINSPACE", "HEARTSPACE", "GEORGE_PORTER"] satisfies Tuple<training.LocationName>;
export const LOCATIONS = ["MAINSPACE", "HEARTSPACE"] satisfies Tuple<sign_in.LocationName>;
export const REP_ON_SHIFT = "Rep On Shift";
export const REP_OFF_SHIFT = "Rep Off Shift";
export const PERSONAL = "Personal";

export const INFRACTION_TYPES = [
  "WARNING",
  "TEMP_BAN",
  "PERM_BAN",
  "RESTRICTION",
  "TRAINING_ISSUE",
] satisfies Tuple<users.InfractionType>;
export const UCARD_LENGTH = 9;

export const NOTIFICATION_TYPES = [
  "ADMIN",
  "ADVERT",
  "ANNOUNCEMENT",
  "EVENT",
  "HEALTH_AND_SAFETY",
  "INFRACTION",
  "PRINTING",
  "QUEUE_SLOT_ACTIVE",
  "RECRUITMENT",
  "REFERRAL",
  "REMINDER",
  "TRAINING",
] satisfies Tuple<notification.Type>;

export const NOTIFICATION_STATUS_OPTIONS = [
  "DRAFT",
  "REVIEW",
  "QUEUED",
  "SENDING",
  "SENT",
  "ERRORED",
] satisfies Tuple<notification.Status>;

export const DELIVERY_METHOD_OPTIONS = [
  "BANNER",
  "EMAIL",
  "TRAY",
  "POPUP",
  "DISCORD",
] satisfies Tuple<notification.DeliveryMethod>;

export const USER_EMAIL_DOMAIN = "sheffield.ac.uk";

export const SIGN_IN_REASONS_STORAGE_KEY = "sign_in_reasons";

export const iForgeEpoch = Temporal.ZonedDateTime.from({year: 2017, month: 1, day: 1, timeZone: "UTC"});
export const ATOM_KEYS = {
  AUTH_REDIRECT_PATH: "Ignis:authRedirectPath",
  USER: "Ignis:user",
  ADMIN_OVERWRITTEN_ROLES: "Ignis:adminOverwrittenRoles",
  ADMIN_OVERWRITE_ROLES: "Ignis:adminOverwriteRoles",
};

export const AVAILABLE_ROLES = ["admin", "rep"];

export const DEFAULT_PKCE_COOKIE = "edgedb-pkce-verifier";
export const DEFAULT_AUTH_COOKIE = "edgedb-session";
