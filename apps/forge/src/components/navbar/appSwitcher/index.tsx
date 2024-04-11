import ContextMenuWrapper from "@/components/navbar/appSwitcher/ContextMenu.tsx";
import ListItem from "@/components/navbar/appSwitcher/ListItem";
import { appActions } from "@/redux/app/app.slice";
import { Apps } from "@/redux/app/app.types";
import { AppRootState } from "@/redux/store";
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
import { useDispatch, useSelector } from "react-redux";

export default function AppSwitcher() {
  const dispatch = useDispatch();
  const app = useSelector((state: AppRootState) => state.app.current_app);

  // Function to handle app change
  const handleAppChange = (newApp: Apps) => {
    dispatch(appActions.setApp(newApp));
  };

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <ContextMenuWrapper>
            <NavigationMenuTrigger className="bg-navbar">iForge | {app}</NavigationMenuTrigger>
          </ContextMenuWrapper>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/50 to-background p-6 no-underline outline-none focus:shadow-md"
                    to="/"
                    onClick={() => handleAppChange("Main")}
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">iForge</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      The UK's first student-led MakerSpace!
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem to={"/signin"} title="Sign In" icon={<PenLine />} onClick={() => handleAppChange("Sign In")}>
                Remote queue and space access for easy sign-in.
              </ListItem>
              <ListItem to={"/training"} title="Training" icon={<Share2 />} onClick={() => handleAppChange("Training")}>
                Handle your iForge training here.
              </ListItem>
              <ListItem
                to={"/printing"}
                title="Printing"
                icon={<Printer />}
                onClick={() => handleAppChange("Printing")}
              >
                Advanced 3D printing to realize your creative designs.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
