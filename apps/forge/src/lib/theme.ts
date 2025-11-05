import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import * as z from "zod";

const key = "theme";

const themeSchema = z.enum(["system", "light", "dark"]);

export type Theme = Exclude<z.infer<typeof themeSchema>, "system">;

export const getTheme = createServerFn().handler(() => {
  const theme = getCookie(key) as Theme | undefined;
  // return "dark";
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
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }
  });
