import { ChevronRight } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@packages/ui/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem, useSidebar,
} from "@packages/ui/components/ui/sidebar";
import { Route } from "@/types/nav";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Link } from "@tanstack/react-router";

interface NavMainProps {
  items: Route[];
}

export function NavMain({ items }: NavMainProps) {
  const userRoles = useUserRoles();
  const { toggleSidebar, openMobile, isMobile } = useSidebar()

  const handleClick = () => {
    if (isMobile && openMobile) {
      toggleSidebar();
    }
  }

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
                {item.items && item.items.length > 0 ? (
                  <SidebarMenuButton tooltip={item.title} onClick={handleClick}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                ) : (
                  <Link to={item.url} onClick={handleClick}>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                )}
              </CollapsibleTrigger>
              {item.items && item.items.length > 0 && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link to={subItem.url} onClick={handleClick}>
                            {subItem.icon && <subItem.icon />}
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
