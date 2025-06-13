import { getHints } from "@/components/client-hint-check";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { getTheme } from "./theme";

export const getRequestInfo = createServerFn().handler(async () => {
  const request = getWebRequest();

  const requestInfo = {
    hints: getHints(request),
    userPreferences: {
      theme: await getTheme(),
    },
  };

  return requestInfo;
});
