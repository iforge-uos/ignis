import { cn } from "@/lib/utils";
import { RoutePath } from "@/types/router";
import { Link } from "@tanstack/react-router";
import { NavigationMenuLink } from "@ui/components/ui/navigation-menu";
import React, { AnchorHTMLAttributes, ReactNode } from "react";

interface ListItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: ReactNode;
  title: string;
  to: RoutePath;
  onClick?: () => void;
}

const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps>(
  ({ className, title, icon, children, to, onClick, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref}
            to={to}
            className={cn(
              "flex items-center space-x-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className,
            )}
            onClick={onClick}
            {...props}
          >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <div className="flex flex-col">
              <div className="text-sm font-medium leading-none">{title}</div>
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
            </div>
          </Link>
        </NavigationMenuLink>
      </li>
    );
  },
);

ListItem.displayName = "ListItem";

export default ListItem;
