import React from "react";
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

interface UserNavProps {
  onLinkClick?: () => void;
}

export function UserNav({ onLinkClick }: UserNavProps) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.is_authenticated);
  const user = useUser();

  const isMacOs = !!navigator?.userAgent?.match(/Macintosh;/);
  const metaKey = isMacOs ? "⌘" : "Ctrl";

  const isAdmin = user?.roles.some((role) => role.name === "Admin");

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

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
            <Link to="/user/profile" onClick={handleLinkClick}>
              <DropdownMenuItem>
                Profile
                <DropdownMenuShortcut>{`⇧${metaKey}P`}</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
            <Link to="/user/settings" onClick={handleLinkClick}>
              <DropdownMenuItem>
                Settings
                <DropdownMenuShortcut>{`${metaKey}S`}</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link to="/admin/dashboard" onClick={handleLinkClick}>
                  <DropdownMenuItem>
                    Admin Dashboard
                    <DropdownMenuShortcut>{`⇧${metaKey}D`}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
            </>
          )}
          <DropdownMenuSeparator />
          <Link to="/auth/logout" onClick={handleLinkClick}>
            <DropdownMenuItem>
              Log out
              <DropdownMenuShortcut>{`⇧${metaKey}Q`}</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <Link to="/auth/login" onClick={handleLinkClick}>
      <Button variant="ghost" className="font-futura">
        Login
      </Button>
    </Link>
  );
}
