import { getHints } from "@/components/client-hint-check";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getTheme } from "./theme";

export const getRequestInfo = createIsomorphicFn()
  .server(async () => {
    const request = getRequest();

    return {
      hints: getHints(request),
      userPreferences: {
        theme: await getTheme(),
      },
    };
  })
  .client(async () => {
    return {
      hints: { theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" } as const,
      userPreferences: {
        theme: await getTheme(),
      }
    };
  });
