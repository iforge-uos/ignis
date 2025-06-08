import { AppSwitcher } from "@/components/app-navigation/app-switcher";
import { NavMain } from "@/components/app-navigation/nav-main";
import {NavSearch} from "@/components/app-navigation/nav-search";
import { NavSub } from "@/components/app-navigation/nav-sub";
import { NavUser } from "@/components/app-navigation/nav-user";
import { appConfig } from "@/config/nav";
import useCurrentApp from "@/hooks/useCurrentApp";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@packages/ui/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentApp = useCurrentApp();
  const userRoles = useUserRoles();

  // Filter the apps based on the user's roles
  const filteredApps = appConfig.filter((app) => {
    // If the app doesn't have any required roles, it should be included
    if (!app.requiredRoles || app.requiredRoles.length === 0) {
      return true;
    }

    // Check if the user has all the required roles for the app (case-insensitive)
    return app.requiredRoles.every((requiredRole) => userRoles.includes(requiredRole.toLowerCase()));
  });

  // Find the current app from the filtered apps
  const currentAppConfig = filteredApps.find((app) => app.name === currentApp);

  // If the current app is not found or not navigable from the main menu, render an empty sidebar
  if (!currentAppConfig?.mainMenuNavigable) {
    return null;
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSwitcher />
        <NavSearch />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={currentAppConfig.routes} />
        <NavSub elements={currentAppConfig.navSub || []} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
