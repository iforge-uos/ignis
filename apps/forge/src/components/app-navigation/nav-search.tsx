import { InputGroup, InputGroupAddon, InputGroupInput } from "@packages/ui/components/input-group";
import { Shortcut } from "@packages/ui/components/kbd";
import { Label } from "@packages/ui/components/label";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuButton,
  useSidebar,
} from "@packages/ui/components/sidebar";
import { useSetAtom } from "jotai";
import { Search } from "@/icons/Search";
import { commandMenuIsOpenAtom } from "@/atoms/commandMenuAtoms";
import { useShortcutKey } from "@/hooks/useShortcutKey";
import { AnimateIcon } from "@packages/ui/components/icon";

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
        <AnimateIcon animateOnHover>
          <InputGroup>
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <InputGroupInput
              id="search"
              placeholder="Search the site..."
              className="cursor-pointer"
              onClick={handleClick}
              readOnly
              value=""
            />
            <InputGroupAddon>
              <Search animation="find"/>
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <Shortcut size="small" keys={[metaKey, "K"]} />
            </InputGroupAddon>
          </InputGroup>
        </AnimateIcon>
        ) : (
          <SidebarMenuButton onClick={handleClick} tooltip="Search" className="w-full justify-center items-center">
            <Search className="size-4" />
          </SidebarMenuButton>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
