import { createContext, useEffect, useState } from "react";
import { Theme, ThemeProviderProps, ThemeProviderState } from "./themeTypes";

const systemTheme = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => null,
  normalisedTheme: systemTheme(),
});

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme);
  const [normalisedTheme, setNormalisedTheme] = useState<"light" | "dark">(theme === "system" ? systemTheme() : theme);

  useEffect(() => {
    const root = window.document.documentElement;

    const applySystemTheme = () => {
      const theme = systemTheme();
      setTheme(theme);
      setNormalisedTheme(theme);
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", applySystemTheme);

    root.classList.remove("light", "dark");
    setNormalisedTheme(theme === "system" ? systemTheme() : theme);
    root.classList.add(normalisedTheme!);

    return () => {
      mediaQuery.removeEventListener("change", applySystemTheme);
    };
  }, [theme, normalisedTheme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
    normalisedTheme: normalisedTheme!,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
