import type { LocationName } from "@ignis/types/sign_in";
import type { Location } from "@ignis/types/training";
import { InfractionType } from "@ignis/types/users";

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never;

type Push<T extends any[], V> = [...T, V];

type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> = true extends N
  ? []
  : Push<TuplifyUnion<Exclude<T, L>>, L>;

export type Tuple<T, A extends T[] = []> = TuplifyUnion<T>["length"] extends A["length"] ? [...A] : Tuple<T, [T, ...A]>;

export const LOCATIONS: Tuple<LocationName> = ["MAINSPACE", "HEARTSPACE"];
export const TRAINING_LOCATIONS: Tuple<Location> = ["MAINSPACE", "HEARTSPACE", "GEORGE_PORTER"];
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
