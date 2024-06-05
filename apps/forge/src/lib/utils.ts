import { RootState } from "@/redux/store";
import { ErrorCodes } from "@ignis/errors";
import { Location, Training } from "@ignis/types/training";
import { deserializeMd as deserializeMd_ } from "@udecode/plate-serializer-md";
import { createPlateEditor } from "@ui/components/plate-ui/plate-editor";
import { isAxiosError } from "axios";
import { type ClassValue, clsx } from "clsx";
import md5 from "md5";
import { useSelector } from "react-redux";
import { twMerge } from "tailwind-merge";
import { LOCATIONS, UCARD_LENGTH } from "./constants";

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

type TrainingBadge = "Compulsory" | "In-Person Training Required" | "Rep Training" | "Mainspace" | "Heartspace"; // TODO visible
type TrainingForBadges = {
  compulsory?: boolean;
  in_person?: boolean;
  rep?: any;
  locations: Location[];
};

const keyToBadgeMap: Record<keyof TrainingForBadges, TrainingBadge[]> = {
  compulsory: ["Compulsory"],
  in_person: ["In-Person Training Required"],
  rep: ["Rep Training"],
  locations: ["Mainspace", "Heartspace"],
};

export const ALL_BADGES: readonly TrainingBadge[] = Object.values(keyToBadgeMap).flat();

export function trainingBadges(training: TrainingForBadges) {
  return Object.entries(training)
    .flatMap(([key, value]) => (value ? keyToBadgeMap[key as keyof TrainingForBadges] : []))
    .filter(Boolean) as TrainingBadge[];
}

export function serializeTrainingBadges(badges_: TrainingBadge[]): Required<TrainingForBadges> {
  const badges = new Set(badges_);
  const training: Partial<TrainingForBadges> = {};

  for (const badge of badges) {
    const keys = Object.entries(keyToBadgeMap)
      .filter(([_, badges]) => badges.includes(badge))
      .map(([key]) => key as keyof TrainingForBadges);

    for (const key of keys) {
      if (key === "locations") {
        if (!training.locations) {
          training.locations = [];
        }
        training.locations.push(badge.replace(" ", "_").toLowerCase() as Location);
      } else {
        training[key] = true;
      }
    }
  }

  return training as Required<TrainingForBadges>;
}
