import { commandMenuIsOpenAtom } from "@/atoms/commandMenuAtoms";
import { useShortcutKey } from "@/lib/utils";
import { Label } from "@packages/ui/components/ui/label";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
  SidebarMenuButton,
  useSidebar,
} from "@packages/ui/components/ui/sidebar";
import { Shortcut } from "@ui/components/ui/kbd";
import { useSetAtom } from "jotai";
import { Search } from "lucide-react";

export function NavSearch() {
  const setCommandMenuOpen = useSetAtom(commandMenuIsOpenAtom);
  const metaKey = useShortcutKey();
  const { state } = useSidebar();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setCommandMenuOpen(true);
  };

  return (
    <SidebarGroup className="py-0 p-0">
      <SidebarGroupContent>
        {state === "expanded" ? (
          <div className="relative">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <SidebarInput
              id="search"
              placeholder="Search the site..."
              className="pl-8 cursor-pointer"
              onClick={handleClick}
              readOnly
              value=""
            />
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Shortcut size="small" keys={[metaKey, "K"]} />
            </div>
          </div>
        ) : (
          <SidebarMenuButton onClick={handleClick} tooltip="Search" className="w-full justify-center items-center">
            <Search className="size-4" />
          </SidebarMenuButton>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
