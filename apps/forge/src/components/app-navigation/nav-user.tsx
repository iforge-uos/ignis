import { UserAvatar } from "@/components/avatar";
import { useShortcutKey } from "@/hooks/useShortcutKey";
import { useTheme } from "@/hooks/useTheme";
import { useUser } from "@/hooks/useUser";
import { Button } from "@packages/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@packages/ui/components/dropdown-menu";
import { Shortcut } from "@packages/ui/components/kbd";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@packages/ui/components/sidebar";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Bell, ChevronsUpDown, LogIn, LogOut, Moon, Settings, Sun } from "lucide-react";

export function NavUser() {
  const user = useUser();
  const { isMobile, state, toggleSidebar, openMobile } = useSidebar();
  const { setTheme, theme } = useTheme();

  const metaKey = useShortcutKey();

  const isMinimized = state === "collapsed";

  const handleClick = () => {
    if (isMobile && openMobile) {
      toggleSidebar();
    }
  };

  const handleThemeClick = () => {
    setTheme(theme === "light" ? "dark" : "light");
    handleClick();
  };

  if (!user) {
    return (
      <Link to="/sign-in/dashboard" className="w-full" onClick={handleClick}>
        <Button
          variant="default"
          size={isMinimized ? "icon" : "default"}
          className="w-full justify-center items-center"
        >
          {isMinimized ? <LogIn className="h-4 w-4" /> : "Sign in"}
        </Button>
      </Link>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground justify-center items-center"
            >
              <UserAvatar user={user} />
              {!isMinimized && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                    <span className="truncate font-semibold">{user.display_name}</span>
                    <span className="truncate text-xs">{user.email}@sheffield.ac.uk</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserAvatar user={user} />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.display_name}</span>
                  <span className="truncate text-xs">{user.email}@sheffield.ac.uk</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/user/me" onClick={handleClick}>
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Profile
                  <Shortcut keys={[metaKey, "P"]} className="ml-auto" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild disabled>
                <Link to="/user/settings" onClick={handleClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                  <Shortcut keys={[metaKey, "S"]} className="ml-auto" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild disabled>
                <Link to="" onClick={handleClick}>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                  <Shortcut keys={[metaKey, "N"]} className="ml-auto" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleThemeClick}>
                {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                {theme === "light" ? "Dark" : "Light"} mode
                <Shortcut keys={[metaKey, "T"]} className="ml-auto" />
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/auth/logout" onClick={handleClick}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
                <Shortcut keys={[metaKey, "Q"]} className="ml-auto" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
