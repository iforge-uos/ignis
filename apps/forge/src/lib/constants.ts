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

export const iForgeEpoch = new Date(Date.UTC(2017, 0, 1));

export const ATOM_KEYS = {
  AUTH_REDIRECT_PATH: "Ignis:authRedirectPath",
  ADMIN_OVERWRITTEN_ROLES: "Ignis:adminOverwrittenRoles",
  ADMIN_OVERWRITE_ROLES: "Ignis:adminOverwriteRoles",
};

export const AVAILABLE_ROLES = ["admin", "rep"];
