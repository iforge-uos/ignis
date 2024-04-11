import React, {AnchorHTMLAttributes, ReactNode} from "react";
import {NavigationMenuLink} from "@ui/components/ui/navigation-menu";
import {Link} from "@tanstack/react-router";
import {cn} from "@/lib/utils";

interface ListItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    icon?: ReactNode;
    title: string;
    to: string;
}

const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps>(
    ({className, title, icon, children, to, ...props}, ref) => {
        return (
            <li>
                <NavigationMenuLink asChild>
                    <Link
                        ref={ref}
                        to={to}
                        className={cn(
                            "flex items-center space-x-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            className
                        )}
                        {...props}
                    >
                        {icon && <span className="flex-shrink-0">{icon}</span>}
                        <div className="flex flex-col">
                            <div className="text-sm font-medium leading-none">{title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {children}
                            </p>
                        </div>
                    </Link>
                </NavigationMenuLink>
            </li>
        );
    }
);

ListItem.displayName = "ListItem";

export default ListItem;
