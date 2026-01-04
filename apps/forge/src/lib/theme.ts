import { createIsomorphicFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { Awaitable } from "@tanstack/router-core";
import * as z from "zod";

const key = "theme";

const themeSchema = z.enum(["system", "light", "dark"]);

export type Theme = Exclude<z.infer<typeof themeSchema>, "system">;

const _getTheme = async (getter: (key: string) => Awaitable<string | undefined>) => {
  const theme = await getter(key) as Theme | undefined;
  return theme ?? null;
};

export const getTheme = createIsomorphicFn()
  .server(async () => _getTheme(getCookie))
  .client(async () => _getTheme(() => cookieStore.get(key).then((c) => c?.value)));


const _setTheme = (theme: Theme | "system", deleteFn: (key: string) => void, setFn: (value: Theme) => void) => {
  if (theme === "system") {
    deleteFn(key);
  } else {
    setFn(theme);
  }
};

const cookieOptions = {
  path: "/",
  sameSite: "lax",
} as const;


export const setTheme = createIsomorphicFn()
  .server(async (theme: Theme | "system") => {
    _setTheme(theme, deleteCookie, (value) =>
      setCookie(key, value, {
        ...cookieOptions,
        secure: process.env.NODE_ENV === "production",
      }),
    );
  })
  .client(async (theme: Theme | "system") => {
    _setTheme(theme, (k) => cookieStore.delete(k), (value) => cookieStore.set({ name: key, value, ...cookieOptions }));
  });
