import { themeQueryOptions, useOptimisticThemeMutation } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@packages/ui/components/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@packages/ui/components/sidebar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

const themes = [
  {
    theme: "system",
    Icon: MonitorIcon,
    label: "System theme",
  },
  {
    theme: "light",
    Icon: SunIcon,
    label: "Light theme",
  },
  {
    theme: "dark",
    Icon: MoonIcon,
    label: "Dark theme",
  },
] as const;

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const { state } = useSidebar();
  const isMinimized = state === "collapsed";

  const { data: theme } = useSuspenseQuery(themeQueryOptions());
  const { mutate: setTheme } = useOptimisticThemeMutation();

  const currentTheme = theme ?? "system";

  if (isMinimized) {
    const { Icon } = themes.find((t) => t.theme === currentTheme)!;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground justify-center items-center p-1 mb-4"
            tooltip="Change theme"
          >
            <Icon />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8}>
          {themes.map(({ theme, Icon, label }) => (
            <DropdownMenuItem key={theme} onClick={() => setTheme(theme)} className="flex items-center gap-2">
              <Icon />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div
      className={cn("relative isolate flex h-8 rounded-full bg-background p-1 ring-1 ring-border mx-auto", className)}
    >
      {themes.map(({ theme, Icon, label }) => {
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
