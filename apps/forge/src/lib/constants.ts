import { Temporal } from "@js-temporal/polyfill";
import type e from "@packages/db/edgeql-js";

export const TRAINING_LOCATIONS =  ["MAINSPACE", "HEARTSPACE", "GEORGE_PORTER"] satisfies typeof e.training.LocationName.__values__;
export const LOCATIONS =  ["MAINSPACE", "HEARTSPACE"] satisfies typeof e.sign_in.LocationName.__values__;
export const REP_ON_SHIFT = "Rep On Shift";
export const REP_OFF_SHIFT = "Rep Off Shift";
export const PERSONAL = "Personal";
export const UCARD_LENGTH = 9;
export const SIGN_IN_REASONS_STORAGE_KEY = "sign_in_reasons";
export const SIGN_IN_REASONS_LAST_UPDATED_STORAGE_KEY = "sign_in_reasons_last_updated";

export const INFRACTION_TYPES = ["WARNING", "TEMP_BAN", "PERM_BAN", "RESTRICTION", "TRAINING_ISSUE"] satisfies typeof e.users.InfractionType.__values__;

export const NOTIFICATION_TYPES = ["ADMIN", "ADVERT", "ANNOUNCEMENT", "EVENT", "HEALTH_AND_SAFETY", "INFRACTION", "PRINTING", "QUEUE_SLOT_ACTIVE", "RECRUITMENT", "REFERRAL", "REMINDER", "TRAINING"] satisfies typeof e.notification.Type.__values__;
export const NOTIFICATION_STATUS_OPTIONS = ["DRAFT", "REVIEW", "QUEUED", "SENDING", "SENT", "ERRORED"] satisfies typeof e.notification.Status.__values__;
export const DELIVERY_METHOD_OPTIONS = ["BANNER", "EMAIL", "TRAY", "POPUP", "DISCORD"] satisfies typeof e.notification.DeliveryMethod.__values__;

export const USER_EMAIL_DOMAIN = "sheffield.ac.uk";

export const iForgeEpoch = Temporal.ZonedDateTime.from({ year: 2017, month: 1, day: 1, timeZone: "UTC" });
export const ATOM_KEYS = {
  AUTH_REDIRECT_PATH: "Ignis:authRedirectPath",
  USER: "Ignis:user",
  ADMIN_OVERWRITTEN_ROLES: "Ignis:adminOverwrittenRoles",
  ADMIN_OVERWRITE_ROLES: "Ignis:adminOverwriteRoles",
};

export const AVAILABLE_ROLES = ["admin", "rep"];

export const DEFAULT_PKCE_COOKIE = "edgedb-pkce-verifier";
export const DEFAULT_AUTH_COOKIE = "edgedb-session";
