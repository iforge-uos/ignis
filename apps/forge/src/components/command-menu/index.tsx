import { useUser } from "@/lib/utils";
import { RootState } from "@/redux/store";
import { useNavigate } from "@tanstack/react-router";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@ui/components/ui/command";
import { LayoutDashboard, LogIn, LogOut, Settings, UserRound, UserRoundSearch } from "lucide-react";
import React, { ReactElement } from "react";
import { useSelector } from "react-redux";

export default function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const isMacOs = !!navigator?.userAgent?.match(/Macintosh;/);
  const metaKey = isMacOs ? "⌘" : "Ctrl";

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (isMacOs ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isMacOs]);

  const SETTINGS_SHORTCUTS: Record<string, [() => any, string, ReactElement]> = {
    p: [() => navigate({ to: "/user/profile" }), "Profile", <UserRound className="mr-2 h-4 w-4" />],
    ",": [() => navigate({ to: "/user/settings" }), "Settings", <Settings className="mr-2 h-4 w-4" />],
  };

  const USER_MANAGEMENT_SHORTCUTS: Record<string, [() => any, string, ReactElement]> = {
    d: [() => navigate({ to: "/signin/dashboard" }), "Dashboard", <LayoutDashboard className="mr-2 h-4 w-4" />],
    u: [() => navigate({ to: "/users" }), "Search users", <UserRoundSearch className="mr-2 h-4 w-4" />],
    i: [() => navigate({ to: "/signin/actions/in" }), "Sign in", <LogIn className="mr-2 h-4 w-4" />],
    o: [() => navigate({ to: "/signin/actions/out" }), "Sign out", <LogOut className="mr-2 h-4 w-4" />],
  };

  const SHORTCUTS = { ...SETTINGS_SHORTCUTS, ...USER_MANAGEMENT_SHORTCUTS };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMacOs ? e.metaKey : e.ctrlKey) {
        const shortcut = SHORTCUTS[e.key];
        if (shortcut !== undefined) {
          e.preventDefault();
          shortcut[0]();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const groups = new Map<string, typeof SHORTCUTS>();
  const user = useUser();

  if (user) {
    groups.set("Settings", SETTINGS_SHORTCUTS);
  }
  if (user?.roles.some((role) => role.name === "Rep")) {
    groups.set("User Management", USER_MANAGEMENT_SHORTCUTS);
  }

  return (
    <Command className="rounded-lg shadow-md">
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {[...groups].flatMap(([name, shortcuts]: [string, typeof SHORTCUTS], index, array) => {
            const group = (
              <CommandGroup key={name} heading={name}>
                {Object.entries(shortcuts).map(([key, [callback, name, icon]]) => {
                  return (
                    <CommandItem key={name} onSelect={callback}>
                      {icon}
                      <span>{name}</span>
                      <CommandShortcut>
                        {metaKey}
                        {key.toUpperCase()}
                      </CommandShortcut>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            );
            return index < array.length - 1 ? [group, <CommandSeparator key={group.key} />] : [group];
          })}
        </CommandList>
      </CommandDialog>
    </Command>
  );
}
