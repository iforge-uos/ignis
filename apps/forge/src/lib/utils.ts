import { RootState } from "@/redux/store";
import { ErrorCodes } from "@ignis/errors";
import { isAxiosError } from "axios";
import { type ClassValue, clsx } from "clsx";
import md5 from "md5";
import { useSelector } from "react-redux";
import { twMerge } from "tailwind-merge";
import { UCARD_LENGTH } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGravatarUrl(email: string, size = 64) {
  const emailHash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=identicon&r=pg&d=404`;
}

export function useUser() {
  return useSelector((state: RootState) => state.user.user);
}

export function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
  });
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function removeSuffix(str: string, suffix: string) {
  if (str.endsWith(suffix)) {
    return str.slice(0, -suffix.length);
  }
  return str;
}

export function extractError(error: Error): string {
  if (error === null) {
    return undefined as never;
  }
  if (isAxiosError(error)) {
    return `${ErrorCodes[error.response?.data.code] || "unspecified_error"}: ${error.response?.data.message}`;
  }
  return error?.message || "Unknown Error. Contact the IT Team";
}

export function uCardNumberToString(ucard_number: number): string {
  return ucard_number.toString().padStart(UCARD_LENGTH, "0");
}
