import { commandMenuIsOpenAtom } from "@/atoms/commandMenuAtoms.ts";
import { useUser } from "@/lib/utils";
import {RoutePath} from "@/types/router.ts";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
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
import { LayoutDashboard, LogIn, LogOut, Settings, UserRound, UserRoundSearch } from 'lucide-react';
import React, { ReactElement } from "react";

type NavigateFunction = (to: RoutePath) => void;

type ShortcutItem = {
  callback: () => void;
  label: string;
  icon: ReactElement;
  disabled?: boolean;
};

export default function CommandMenu() {
  const [isOpen, setIsOpen] = useAtom(commandMenuIsOpenAtom);
  const navigateBase = useNavigate();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isMacOs = !!navigator?.userAgent?.match(/Macintosh;/);
  const metaKey = isMacOs ? "⌘" : "Ctrl";

  const navigate: NavigateFunction = (to: RoutePath) => {
    navigateBase({to}).then(() => setIsOpen(false));
  };

  // Focus the input when opened
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (isMacOs ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isMacOs, setIsOpen]);

  const SETTINGS_SHORTCUTS: Record<string, ShortcutItem> = {
    p: {
      callback: () => navigate("/user/me"),
      label: "Profile",
      icon: <UserRound key="userProfileKey" className="mr-2 h-4 w-4" />,
    },
    ",": {
      callback: () => navigate("/user/settings"),
      label: "Settings",
      icon: <Settings key="userSettingsKey" className="mr-2 h-4 w-4" />,
    },
  };

  const USER_MANAGEMENT_SHORTCUTS: Record<string, ShortcutItem> = {
    d: {
      callback: () => navigate("/sign-in/dashboard"),
      label: "Dashboard",
      icon: <LayoutDashboard key="signinDashboardKey" className="mr-2 h-4 w-4" />,
    },
    u: {
      callback: () => navigate("/users"),
      label: "Search users",
      icon: <UserRoundSearch key="usersPageKey" className="mr-2 h-4 w-4" />,
      disabled: true,
    },
    i: {
      callback: () => navigate("/sign-in/actions/in"),
      label: "Sign in",
      icon: <LogIn key="signInActionKey" className="mr-2 h-4 w-4" />,
    },
    o: {
      callback: () => navigate("/sign-in/actions/out"),
      label: "Sign out",
      icon: <LogOut key="signOutActionKey" className="mr-2 h-4 w-4" />,
    },
  };

  const SHORTCUTS = { ...SETTINGS_SHORTCUTS, ...USER_MANAGEMENT_SHORTCUTS };

  // biome-ignore lint/correctness/useExhaustiveDependencies: thisRunsOnMount only
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMacOs ? e.metaKey : e.ctrlKey) {
        const shortcut = SHORTCUTS[e.key];
        if (shortcut !== undefined && !shortcut.disabled) {
          e.preventDefault();
          shortcut.callback();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const groups = new Map<string, Record<string, ShortcutItem>>();
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
          <DialogTitle className="sr-only">Command Menu</DialogTitle>
          <DialogDescription className="sr-only">
            Use the command menu to navigate the application
          </DialogDescription>
          <div className="max-h-[80vh] overflow-hidden flex flex-col">
            <CommandInput
                ref={inputRef}
                placeholder="Type a command or search..."
            />
            <CommandList className="max-h-[calc(80vh-60px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
              <CommandEmpty>No results found.</CommandEmpty>
              {[...groups].flatMap(([name, shortcuts], index) => [
                <CommandGroup key={`group-${name}`} heading={name}>
                  {Object.entries(shortcuts).map(([key, { callback, label, icon, disabled }]) => (
                      <CommandItem
                          key={`item-${name}-${key}`}
                          onSelect={() => !disabled && callback()}
                          disabled={disabled}
                      >
                        {icon}
                        <span>{label}</span>
                        <CommandShortcut>
                          {metaKey}
                          {key.toUpperCase()}
                        </CommandShortcut>
                      </CommandItem>
                  ))}
                </CommandGroup>,
                index < groups.size - 1 ? <CommandSeparator key={`separator-${name}`} /> : null
              ]).filter(Boolean)}
            </CommandList>
          </div>
        </CommandDialog>
      </Command>
  );
}