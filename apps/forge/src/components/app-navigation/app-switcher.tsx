import { ChevronsUpDown } from "lucide-react";

import useCurrentApp from "@/hooks/useCurrentApp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@ignis/ui/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@ignis/ui/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { appConfig } from "@/config/nav";
import { useUserRoles } from "@/hooks/useUserRoles";

export function AppSwitcher() {
  const { isMobile } = useSidebar();

  const app = useCurrentApp();
  const userRoles = useUserRoles();

  const isMacOs = !!navigator?.userAgent?.match(/Macintosh;/);
  const metaKey = isMacOs ? "⌘+" : "Ctrl+";

  const currentApp = appConfig.find((a) => a.name === app)!;

  const filteredApps = appConfig.filter((app) => {
    // Check if the app is navigable from the main menu
    if (!app.mainMenuNavigable) {
      return false;
    }

    // If the app doesn't have any required roles, it should be included
    if (!app.requiredRoles || app.requiredRoles.length === 0) {
      return true;
    }

    // Check if the user has all the required roles for the app (case-insensitive)
    return app.requiredRoles.every((role) => userRoles.includes(role.toLowerCase()));
  });

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <currentApp.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{currentApp.name}</span>
                <span className="truncate text-xs">{currentApp.description}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">iForge Apps</DropdownMenuLabel>
            {filteredApps.map((app, index) => (
              <Link key={app.name} to={app.url}>
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <app.logo className="size-4 shrink-0" />
                  </div>
                  {app.name}
                  <DropdownMenuShortcut>
                    {metaKey}
                    {index + 1}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}