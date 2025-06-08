export * as users from "./users";
export * as sign_in from "./sign_in";
export * as root from "./root";
export * as training from "./training";

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never;

type Push<T extends any[], V> = [...T, V];

type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> = true extends N
  ? []
  : Push<TuplifyUnion<Exclude<T, L>>, L>;

export type Tuple<T, A extends T[] = []> = TuplifyUnion<T>["length"] extends A["length"] ? [...A] : Tuple<T, [T, ...A]>;
