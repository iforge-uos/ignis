import { createIsomorphicFn, createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import * as z from "zod";

const key = "theme";

const themeSchema = z.enum(["system", "light", "dark"]);

export type Theme = Exclude<z.infer<typeof themeSchema>, "system">;

export const getTheme = createIsomorphicFn()
  .server(async () => {
    const theme = getCookie(key) as Theme | undefined;
    return theme ?? null;
  })
  .client(async () => {
    const theme = (await cookieStore.get(key).then((c) => c?.value)) as Theme | undefined;
    return theme ?? null;
  });

export const setTheme = createServerFn({ method: "POST" })
  .inputValidator(themeSchema)
  .handler(async ({ data }) => {
    if (data === "system") {
      deleteCookie(key);
    } else {
      setCookie(key, data, {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
  });
