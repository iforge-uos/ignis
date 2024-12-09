import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useShortcutKey() {
  const isMacOs = !!navigator?.userAgent?.match(/Macintosh;/);
  return isMacOs ? "⌘" : "Ctrl";
}
