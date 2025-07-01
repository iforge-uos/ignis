import { themeQueryOptions, useOptimisticThemeMutation } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { motion } from "motion/react";

const themes = [
  {
    theme: "system",
    icon: MonitorIcon,
    label: "System theme",
  },
  {
    theme: "light",
    icon: SunIcon,
    label: "Light theme",
  },
  {
    theme: "dark",
    icon: MoonIcon,
    label: "Dark theme",
  },
] as const;

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const { data: theme } = useSuspenseQuery(themeQueryOptions());
  const { mutate: setTheme } = useOptimisticThemeMutation();

  const currentTheme = theme ?? "system";

  return (
    <div className={cn("relative isolate flex h-8 rounded-full bg-background p-1 ring-1 ring-border", className)}>
      {themes.map(({ theme, icon: Icon, label }) => {
        const isActiveTheme = currentTheme === theme;

        return (
          <button
            type="button"
            key={theme}
            className="relative size-6 cursor-pointer rounded-full"
            onClick={() => {
              if (isActiveTheme) {
                return;
              }

              setTheme(theme);
            }}
            aria-label={label}
          >
            {isActiveTheme && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 rounded-full bg-secondary"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <Icon
              className={cn(
                "relative z-10 m-auto h-4 w-4",
                isActiveTheme ? "text-foreground" : "text-muted-foreground",
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
