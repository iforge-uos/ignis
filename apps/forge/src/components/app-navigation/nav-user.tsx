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
import { UserAvatar } from "@/components/avatar";
import { useShortcutKey } from "@/hooks/useShortcutKey";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./theme-switcher";
import { EllipsisVertical } from "@/icons/EllipsisVertical";
import { Bell } from "@/icons/Bell";
import { AnimateIcon } from "@packages/ui/components/icon";
import { Settings } from "@/icons/Settings";
import { LogOut } from "@/icons/LogOut";
import { LogIn } from "@/icons/LogIn";
import { User } from "@/icons/User";

export function NavUser() {
  const user = useUser();
  const { isMobile, state, toggleSidebar, openMobile } = useSidebar();

  const metaKey = useShortcutKey();

  const isMinimized = state === "collapsed";

  const handleClick = () => {
    if (isMobile && openMobile) {
      toggleSidebar();
    }
  };

  if (!user) {
    return (
      <div>
        <ThemeSwitcher className="mb-2 w-fit" />
        <Button
          variant="default"
          size={isMinimized ? "icon" : "default"}
          className="w-full justify-center items-center"
        >
          <Link to="/sign-in/dashboard" className="w-full" onClick={handleClick}>
            <AnimateIcon asChild animateOnHover>
              {isMinimized ? (
                <LogIn className="h-4 w-4" />
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </div>
              )}
            </AnimateIcon>
          </Link>
        </Button>
      </div>
    );
  }

  const unacknowledgedCount = user.notifications.filter(n => !n["@acknowledged_at"]).length

  return (
    <div>
      <ThemeSwitcher className="mb-2 w-fit" />

      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <AnimateIcon animateOnHover asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground justify-center items-center"
                >
                  <UserAvatar user={user} />
                  {isMinimized && !!unacknowledgedCount && (
                    <span
                      className={cn(
                        "bg-primary flex absolute -top-1 -right-1 text-xs dark:text-primary-foreground text-white rounded-sm text-center justify-center items-center",
                        Math.floor(unacknowledgedCount / 10) ? "py-[1px] px-[3px]" : "w-4",
                      )}
                    >
                      {unacknowledgedCount}
                    </span>
                  )}
                  {!isMinimized && (
                    <>
                      <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                        <span className="truncate font-semibold">{user.display_name}</span>
                        <span className="truncate text-xs">{user.email}@sheffield.ac.uk</span>
                      </div>
                      {unacknowledgedCount ? (
                        <span className="bg-primary dark:text-primary-foreground text-white flex ml-auto size-5 rounded-sm text-center justify-center">
                          {unacknowledgedCount}
                        </span>
                      ) : (
                        <EllipsisVertical className="ml-auto size-4" animation="pulse" />
                      )}
                    </>
                  )}
                </SidebarMenuButton>
              </AnimateIcon>
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
                  <AnimateIcon animateOnHover asChild>
                    <Link to="/user" onClick={handleClick}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                      <Shortcut keys={[metaKey, "P"]} className="ml-auto" />
                    </Link>
                  </AnimateIcon>
                </DropdownMenuItem>
                <DropdownMenuItem asChild disabled>
                  <AnimateIcon animateOnHover asChild>
                    <Link to="/user/settings" onClick={handleClick}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                      <Shortcut keys={[metaKey, "S"]} className="ml-auto" />
                    </Link>
                  </AnimateIcon>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <AnimateIcon animateOnHover asChild>
                    <Link to="/notifications" onClick={handleClick}>
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                      <Shortcut keys={[metaKey, "N"]} className="ml-auto" />
                    </Link>
                  </AnimateIcon>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <AnimateIcon animateOnHover asChild>
                  <Link to="/auth/logout" onClick={handleClick}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                    <Shortcut keys={[metaKey, "Q"]} className="ml-auto" />
                  </Link>
                </AnimateIcon>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
