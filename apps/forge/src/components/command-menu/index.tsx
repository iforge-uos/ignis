import {commandMenuIsOpenAtom} from "@/atoms/commandMenuAtoms.ts";
import { useUser } from "@/lib/utils";
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
import { useAtom } from "jotai";
import { LayoutDashboard, LogIn, LogOut, Settings, UserRound, UserRoundSearch } from "lucide-react";
import React, { ReactElement } from "react";

export default function CommandMenu() {
  const [isOpen, setIsOpen] = useAtom(commandMenuIsOpenAtom)
  const navigate = useNavigate();
  const inputRef = React.useRef<HTMLInputElement>(null)

  const isMacOs = !!navigator?.userAgent?.match(/Macintosh;/);
  const metaKey = isMacOs ? "⌘" : "Ctrl";

  // Focus the input when opened
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [isOpen])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (isMacOs ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [isMacOs, setIsOpen])

  const SETTINGS_SHORTCUTS: Record<string, [() => any, string, ReactElement]> = {
    p: [() => navigate({ to: "/user/me" }), "Profile", <UserRound key="userProfileKey" className="mr-2 h-4 w-4" />],
    ",": [() => navigate({ to: "/user/settings" }), "Settings", <Settings key="userSettingsKey" className="mr-2 h-4 w-4" />],
  };

  const USER_MANAGEMENT_SHORTCUTS: Record<string, [() => any, string, ReactElement]> = {
    d: [() => navigate({ to: "/sign-in/dashboard" }), "Dashboard", <LayoutDashboard key="signinDashboardKey" className="mr-2 h-4 w-4" />],
    u: [() => navigate({ to: "/users" }), "Search users", <UserRoundSearch key="usersPageKey" className="mr-2 h-4 w-4" />],
    i: [() => navigate({ to: "/sign-in/actions/in" }), "Sign in", <LogIn key="signInActionKey" className="mr-2 h-4 w-4" />],
    o: [() => navigate({ to: "/sign-in/actions/out" }), "Sign out", <LogOut key="signOutActionKey" className="mr-2 h-4 w-4" />],
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
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput
            ref={inputRef}
            placeholder="Type a command or search..."
        />
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
