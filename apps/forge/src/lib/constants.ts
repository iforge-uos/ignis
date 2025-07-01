import type { sign_in, training, users } from "@packages/db/interfaces";
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
