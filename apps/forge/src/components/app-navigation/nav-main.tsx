import { ChevronRight, Link } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@ignis/ui/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@ignis/ui/components/ui/sidebar";
import { Route } from "@/types/nav";
import { useUserRoles } from "@/hooks/useUserRoles";

interface NavMainProps {
  items: Route[];
}

export function NavMain({ items }: NavMainProps) {
  const userRoles = useUserRoles();

  // Filter the items based on the user's roles
  const filteredItems = items.filter((item) => {
    // If the item doesn't have any required roles, it should be included
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true;
    }

    // Check if the user has all the required roles for the item (case-insensitive)
    return item.requiredRoles.every((requiredRole) => userRoles.includes(requiredRole.toLowerCase()));
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.items && item.items.length > 0 && (
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {item.items && item.items.length > 0 && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link to={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
