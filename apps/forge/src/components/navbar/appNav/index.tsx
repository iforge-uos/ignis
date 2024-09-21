import { appLinks } from "@/config/appLinks.ts";
// NavBar.tsx
import { Link } from "@tanstack/react-router";
import { AppLinkDropdown } from "./appLinkDropdown.tsx";

import useCurrentApp from "@/hooks/useCurrentApp.ts";

export default function AppNav() {
  const currentApp = useCurrentApp();
  const sortedAppLinks = appLinks.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  return (
    <div className="p-2 flex flex-row align-middle justify-items-center justify-center gap-2">
      {sortedAppLinks.map((link) => {
        if (link.app === currentApp) {
          return link.children && link.children.length > 0 ? (
            <AppLinkDropdown key={link.id} link={link} />
          ) : (
            <Link
              key={link.displayName}
              to={link.path ?? "#"}
              className="flex justify-center items-center p-2 text-sm font-medium rounded-md text-card-foreground hover:bg-accent font-futura"
            >
              {link.displayName}
            </Link>
          );
        }
        return null;
      })}
    </div>
  );
}
