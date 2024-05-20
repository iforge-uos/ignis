import { UserAvatar } from "@/components/avatar";
import { useUser } from "@/lib/utils";
import { RootState } from "@/redux/store";
import { Link } from "@tanstack/react-router";
import { Badge } from "@ui/components/ui/badge";
import { Button } from "@ui/components/ui/button";

import { USER_EMAIL_DOMAIN } from "@/config/constants.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@ui/components/ui/dropdown-menu";
import { useSelector } from "react-redux";

function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function UserNav() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.is_authenticated);
  const user = useUser();

  const isAdmin = user?.roles.some((role) => role.name === "Admin");

  if (isAuthenticated && user && isString(user.email) && isString(user.display_name)) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <UserAvatar user={user} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1.5">
              <p className="text-sm font-medium leading-none">{user.display_name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}@{USER_EMAIL_DOMAIN}
              </p>
              <div className="flex-wrap flex gap-2">
                {user.roles.map((role) => (
                  <Badge className="" key={role.id}>
                    {role.name}
                  </Badge>
                ))}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link to="/user/profile">
              <DropdownMenuItem>
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
            <Link to="/user/settings">
              <DropdownMenuItem>
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link to="/admin/dashboard">
                  <DropdownMenuItem>
                    Admin Dashboard
                    <DropdownMenuShortcut>⇧⌘D</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
            </>
          )}
          <DropdownMenuSeparator />
          <Link to="/auth/logout">
            <DropdownMenuItem>
              Log out
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <Link to="/auth/login">
      <Button variant="ghost">Login</Button>
    </Link>
  );
}
