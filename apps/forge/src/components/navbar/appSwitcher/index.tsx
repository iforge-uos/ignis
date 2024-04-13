import ContextMenuWrapper from "@/components/navbar/appSwitcher/ContextMenu.tsx";
import ListItem from "@/components/navbar/appSwitcher/ListItem";
import { Link } from "@tanstack/react-router";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@ui/components/ui/navigation-menu";
import { PenLine, Printer, Share2 } from "lucide-react";
import useCurrentApp from "@/hooks/useCurrentApp.ts";
import { cn } from "@/lib/utils.ts";

export default function AppSwitcher() {
  const currentapp = useCurrentApp();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <ContextMenuWrapper>
            <NavigationMenuTrigger className="bg-navbar">iForge | {currentapp}</NavigationMenuTrigger>
          </ContextMenuWrapper>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className={cn(
                      "flex h-full w-full select-none flex-col justify-end rounded-md p-6 no-underline outline-none focus:shadow-md bg-gradient-to-b from-red-950 to-black",
                    )}
                    to="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">iForge</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      The UK's first student-led MakerSpace!
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem to={"/signin"} title="Sign In" icon={<PenLine />}>
                Remote queue and space access for easy sign-in.
              </ListItem>
              <ListItem to={"/training"} title="Training" icon={<Share2 />}>
                Handle your iForge training here.
              </ListItem>
              <ListItem to={"/printing"} title="Printing" icon={<Printer />}>
                3D Printing WIP
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
