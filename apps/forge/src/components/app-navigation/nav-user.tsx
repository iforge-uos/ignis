import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@ignis/ui/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@ignis/ui/components/ui/dropdown-menu";
import { BadgeCheck, Bell, ChevronsUpDown, LogIn, LogOut, Moon, Settings, Sparkles, Sun } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@ignis/ui/components/ui/avatar";
import { UserAvatar } from "@/components/avatar";
import { Link } from "@tanstack/react-router";
import { useTheme } from "@/providers/themeProvider/use-theme";
import { useUser } from "@/lib/utils";
import { Button } from "@ignis/ui/components/ui/button";

export function NavUser() {
  const user = useUser();
  const { isMobile, state } = useSidebar();
  const { setTheme, theme } = useTheme();

  const isMacOs = !!navigator?.userAgent?.match(/Macintosh;/);
  const metaKey = isMacOs ? "⌘" : "Ctrl+";

  const isMinimized = state === "collapsed";

  if (!user) {
    return (
        <Link to="/sign-in/dashboard" className="w-full">
          <Button
              variant="default"
              size={isMinimized ? "icon" : "default"}
              className="w-full justify-center items-center"
          >
            {isMinimized ? (
                <LogIn className="h-4 w-4" />
            ) : (
                "Sign in"
            )}
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
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.profile_picture ?? ""} alt={user.last_name ?? "?"} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.display_name}</span>
                    <span className="truncate text-xs">{user.email}@sheffield.ac.uk</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSfRTTBDKCd_kZkVLBHW2LI_GHKkYTwyLWcLkqu7E5AemxJKaw/viewform" rel="noreferrer" target="_blank">
                <DropdownMenuItem>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Apply to become a rep!
                </DropdownMenuItem>
                </a>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to="/user/profile">
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    Profile
                    <DropdownMenuShortcut>{`⇧${metaKey}P`}</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/user/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                    <DropdownMenuShortcut>{`${metaKey}S`}</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild disabled>
                  <Link to="">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                    <DropdownMenuShortcut>{`${metaKey}N`}</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                  {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                  {theme === "light" ? "Dark" : "Light"} mode
                  <DropdownMenuShortcut>{`${metaKey}T`}</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/auth/logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                  <DropdownMenuShortcut>{`${metaKey}Q`}</DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
  );
}