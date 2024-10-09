import React, { useMemo } from "react";
import { appLinks } from "@/config/appLinks.ts";
import { Link } from "@tanstack/react-router";
import { AppLinkDropdown } from "./appLinkDropdown.tsx";
import useCurrentApp from "@/hooks/useCurrentApp.ts";

interface AppNavProps {
  onLinkClick?: () => void;
}

const AppNav: React.FC<AppNavProps> = React.memo(({ onLinkClick }) => {
  const currentApp = useCurrentApp();

  const sortedAppLinks = useMemo(() => {
    return appLinks.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  }, []);

  const navLinks = useMemo(() => {
    return sortedAppLinks.map((link) => {
      if (link.app === currentApp) {
        return link.children && link.children.length > 0 ? (
          <AppLinkDropdown key={link.id} link={link} onLinkClick={onLinkClick} />
        ) : (
          <Link
            key={link.displayName}
            to={link.path ?? "#"}
            className="flex justify-center items-center p-2 text-sm font-medium rounded-md text-card-foreground hover:bg-accent font-futura"
            onClick={onLinkClick}
          >
            {link.displayName}
          </Link>
        );
      }
      return null;
    });
  }, [currentApp, sortedAppLinks, onLinkClick]);

  return <div className="p-2 flex flex-row align-middle justify-items-center justify-center gap-2">{navLinks}</div>;
});

AppNav.displayName = "AppNav";

export default AppNav;
