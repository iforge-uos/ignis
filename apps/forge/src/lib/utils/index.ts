import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { UCARD_LENGTH } from "../constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
  });
}
/**
 * Function to sleep and block the execution thread for a given time.
 *
 * @param ms - The amount of milliseconds to sleep for
 * @returns A promise that resolves after the given time
 *
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function removeSuffix(str: string, suffix: string) {
  if (str.endsWith(suffix)) {
    return str.slice(0, -suffix.length);
  }
  return str;
}

export function uCardNumberToString(ucard_number: number): string {
  return ucard_number.toString().padStart(UCARD_LENGTH, "0");
}

export function exhaustiveGuard(_value: never): never {
  throw new Error(`ERROR! Reached forbidden guard function with unexpected value: ${JSON.stringify(_value)}`);
}

interface Reduceable<T> {
  reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): U;
}

export function counter<T extends string | number | symbol>(iter: Reduceable<T>) {
  return iter.reduce(
    (acc, current) => {
      acc[current] = (acc[current] || 0) + 1;
      return acc;
    },
    {} as Record<T, number>,
  );
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

const pr = new Intl.PluralRules("en-GB", { type: "ordinal" });

const suffixes = new Map([
  ["one", "st"],
  ["two", "nd"],
  ["few", "rd"],
  ["other", "th"],
]);
export const formatOrdinals = (n: number) => {
  const rule = pr.select(n);
  const suffix = suffixes.get(rule);
  return `${n}${suffix}`;
};

export function clamp(value: number, min: number, max: number) {
  if (value < min) return min
  if (value > max) return max
  return value
}
