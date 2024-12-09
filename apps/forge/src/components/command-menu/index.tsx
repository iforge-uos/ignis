import { commandMenuIsOpenAtom } from "@/atoms/commandMenuAtoms";
import { CommandConfig, commandConfig } from "@/config/commands";
import { useFilteredCommands } from "@/hooks/useFilteredCommands";
import { useShortcutKey } from "@/lib/utils";
import { RoutePath } from "@/types/router";
import { Card, CardContent, CardFooter } from "@ignis/ui/components/ui/card.tsx";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@ui/components/ui/command";
import { Shortcut } from "@ui/components/ui/kbd";
import { useAtom } from "jotai";
import { X } from "lucide-react";
import React from "react";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

type ActiveContent = {
  type: "component";
  content: ReactNode;
};

export default function CommandMenu() {
  const [isOpen, setIsOpen] = useAtom(commandMenuIsOpenAtom);
  const navigateBase = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeContent, setActiveContent] = useState<ActiveContent | null>(null);

  const metaKey = useShortcutKey();

  const navigate = useCallback(
    (to: RoutePath) => {
      navigateBase({ to }).then(() => setIsOpen(false));
    },
    [navigateBase, setIsOpen],
  );

  const handleCommand = useCallback(
    (command: CommandConfig) => {
      switch (command.action.type) {
        case "navigate":
          navigate(command.action.to);
          break;
        case "component":
          setActiveContent({
            type: "component",
            content: command.action.component,
          });
          command.action.onOpen?.();
          setIsOpen(false);
          break;
        case "custom":
          command.action.handler();
          setIsOpen(false);
          break;
      }
    },
    [navigate, setIsOpen],
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (isMacOs ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isMacOs, setIsOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMacOs ? e.metaKey : e.ctrlKey) {
        const command = commandConfig.find((cmd) => cmd.shortcutKey === e.key);
        if (command && !command.disabled) {
          e.preventDefault();
          handleCommand(command);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleCommand, isMacOs]);

  const groupedCommands = useFilteredCommands();

  const closeActiveContent = useCallback(() => {
    if (activeContent?.type === "component") {
      const command = commandConfig.find(
        (cmd) => cmd.action.type === "component" && cmd.action.component === activeContent.content,
      );
      if (command?.action.type === "component") {
        command.action.onClose?.();
      }
    }
    setActiveContent(null);
  }, [activeContent]);

  return (
    <>
      <Command className="rounded-lg shadow-md">
        <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
          <div className="max-h-[80vh] overflow-hidden flex flex-col">
            <CommandInput ref={inputRef} placeholder="Type a command or search..." />
            <CommandList className="max-h-[calc(80vh-60px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
              <CommandEmpty className="py-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">No results found</p>
                    <p className="text-sm font-medium">
                      Please{" "}
                      <Link to="/sign-in" className="inline-flex items-center gap-1 text-primary hover:underline">
                        sign in
                        <span aria-hidden="true">→</span>
                      </Link>{" "}
                      to access all commands
                    </p>
                  </div>
                </div>
              </CommandEmpty>
              {Object.entries(groupedCommands).map(([groupName, commands], index) => (
                <React.Fragment key={groupName}>
                  <CommandGroup heading={groupName}>
                    {commands.map((command) => (
                      <CommandItem
                        key={`${groupName}-${command.shortcutKey}`}
                        onSelect={() => !command.disabled && handleCommand(command)}
                        disabled={command.disabled}
                      >
                        <command.icon className="mr-2 h-4 w-4" />
                        <span>{command.label}</span>
                        <Shortcut keys={[metaKey, command.shortcutKey.toUpperCase()]} className="ml-auto" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {index < Object.keys(groupedCommands).length - 1 && <CommandSeparator />}
                </React.Fragment>
              ))}
            </CommandList>
          </div>
        </CommandDialog>
      </Command>

      {activeContent?.type === "component" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-lg">
            <CardContent className="pt-6">{activeContent.content as ReactNode}</CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={closeActiveContent}>
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
