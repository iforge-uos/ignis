import ContextMenuWrapper from "@/components/navbar/appSwitcher/ContextMenu.tsx";
import ListItem from "@/components/navbar/appSwitcher/ListItem";
import { cn, currentAppToColor } from "@/lib/utils.ts";
import { Link } from "@tanstack/react-router";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@ui/components/ui/navigation-menu";
import { BookOpen, PenLine, Printer } from "lucide-react";
import useCurrentApp from "@/hooks/useCurrentApp";

interface AppSwitcherProps {
  onLinkClick?: () => void;
}

export default function AppSwitcher({ onLinkClick }: AppSwitcherProps) {
  const currentapp = useCurrentApp();

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <ContextMenuWrapper>
            <NavigationMenuTrigger className="bg-card font-futura">
              <span className={`border-b-2 ${currentAppToColor(currentapp)}`}>iForge | {currentapp}</span>
            </NavigationMenuTrigger>
          </ContextMenuWrapper>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className={cn(
                      "flex h-full w-full select-none flex-col justify-end rounded-md p-6 no-underline outline-none focus:shadow-md bg-gradient-to-b from-red-300 to-white dark:bg-gradient-to-b dark:from-red-950 dark:to-black",
                    )}
                    to="/"
                    onClick={handleLinkClick}
                  >
                    <div className="mb-2 mt-4 text-lg font-medium font-futura">iForge</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      The UK's first student-led MakerSpace!
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem to={"/signin"} title="Sign In" icon={<PenLine />} onClick={onLinkClick}>
                iForge Sign In System
              </ListItem>
              <ListItem to={"/training"} title="Training" icon={<BookOpen />} onClick={onLinkClick}>
                Handle your iForge training here.
              </ListItem>
              <ListItem to={"/printing"} title="Printing" icon={<Printer />} onClick={onLinkClick}>
                3D Printing (WIP)
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
