import type { LocationName } from "@ignis/types/sign_in";
import { InfractionType } from "@ignis/types/users";

export const LOCATIONS: readonly LocationName[] = ["MAINSPACE", "HEARTSPACE"];
export const REP_ON_SHIFT = "Rep On Shift";
export const REP_OFF_SHIFT = "Rep Off Shift";
export const INFRACTION_TYPES: readonly InfractionType[] = [
  "WARNING",
  "TEMP_BAN",
  "PERM_BAN",
  "RESTRICTION",
  "TRAINING_ISSUE",
];
export const UCARD_LENGTH = 9;
