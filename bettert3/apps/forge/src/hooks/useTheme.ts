import { useContext } from "react";
import { ThemeProviderContext } from "@/providers/themeProvider";

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
