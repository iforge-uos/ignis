import { RootState } from "@/redux/store";
import { ErrorCodes } from "@ignis/errors";
import { deserializeMd as deserializeMd_ } from "@udecode/plate-serializer-md";
import { createPlateEditor } from "@ui/components/plate-ui/plate-editor";
import { isAxiosError } from "axios";
import { type ClassValue, clsx } from "clsx";
import md5 from "md5";
import { useSelector } from "react-redux";
import { twMerge } from "tailwind-merge";
import { UCARD_LENGTH } from "./constants";
import { Apps } from "@/types/app";

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
    return `${ErrorCodes[error.response?.data.code] || "unspecified_error"}: ${
      error.response?.data.message || error.message || "Unknown Error. Contact the IT Team"
    }`;
  }
  return error?.message || "Unknown Error. Contact the IT Team";
}

export function uCardNumberToString(ucard_number: number): string {
  return ucard_number.toString().padStart(UCARD_LENGTH, "0");
}

export type PickByValue<T, V> = Pick<T, { [K in keyof T]: T[K] extends V ? K : never }[keyof T]>;
export type Entries<T> = {
  [K in keyof T]: [keyof PickByValue<T, T[K]>, T[K]];
}[keyof T][];

export function deserializeMd(content: string) {
  const editor = createPlateEditor();
  return deserializeMd_(editor, content);
}

const trainingKeysToTag = {
  compulsory: "Compulsory",
  in_person: "In-Person Training Required",
  enabled: "Enabled",
} as const;
export type TrainingTag = (typeof trainingKeysToTag)[keyof typeof trainingKeysToTag];
export type TrainingForTags = { [K in keyof typeof trainingKeysToTag]: boolean };

export const ALL_TAGS: readonly TrainingTag[] = Object.values(trainingKeysToTag);

export function trainingTags(training: TrainingForTags) {
  return Object.entries(training)
    .map(([key, value]) => (value ? trainingKeysToTag[key as keyof TrainingForTags] : ""))
    .filter(Boolean) as TrainingTag[];
}

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export function serializeTrainingTags(badges_: TrainingTag[]): Required<TrainingForTags> {
  const badges = new Set(badges_);
  const training: Partial<Mutable<TrainingForTags>> = {};

  for (const [key, badge_] of Object.entries(trainingKeysToTag)) {
    if (badges.has(badge_)) {
      training[key as keyof TrainingForTags] = true;
    }
  }

  return training as Required<TrainingForTags>;
}

export function currentAppToColor(currentApp: Apps): string {
  switch (currentApp) {
    case "Admin":
      return "border-purple-600";
    case "Auth":
      return "border-fuchisa-600";
    case "Main":
      return "border-red-700";
    case "Printing":
      return "border-orange-500";
    case "Sign In":
      return "border-rose-700";
    case "Training":
      return "border-green-700";
    case "User":
      return "border-indigo-600";
    default:
      return "";
  }
}
