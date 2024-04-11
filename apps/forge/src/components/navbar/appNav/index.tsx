// NavBar.tsx
import {Link} from "@tanstack/react-router";
import {useSelector} from "react-redux";
import {AppRootState} from "@/redux/store";
import {appLinks} from "./appLinks";
import {AppLinkDropdown} from './appLinkDropdown.tsx';

export default function AppNav() {
    const currentApp = useSelector((state: AppRootState) => state.app.current_app);
    const sortedAppLinks = appLinks.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

    return (
        <div className="p-2 flex flex-row align-middle justify-items-center justify-center">
            {sortedAppLinks.map((link) => {
                if (link.app === currentApp) {
                    return link.children && link.children.length > 0 ? (
                        <AppLinkDropdown key={link.id} link={link} />
                    ) : (
                        <Link key={link.displayName} to={link.path ?? '#'}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-navbar-foreground hover:bg-accent">
                            {link.displayName}
                        </Link>
                    );
                }
                return null;
            })}
        </div>
    );
}
