import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

const getUserAgent = createIsomorphicFn()
  .client(() => navigator.userAgent)
  .server(() => getRequestHeader("user-agent"));

export function useShortcutKey() {
  const userAgent = getUserAgent();

  return userAgent?.match(/Macintosh;/) ? "⌘" : "Ctrl";
}
