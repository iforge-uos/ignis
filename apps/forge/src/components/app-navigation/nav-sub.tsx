import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@ignis/ui/components/ui/sidebar";
import { NavSub as NavSubType } from "@/types/nav";
import { Link } from "@tanstack/react-router";
import { RoutePath } from "@/types/router";

interface NavSubProps {
  elements: NavSubType[];
}

export function NavSub({ elements }: NavSubProps) {
  const { toggleSidebar, openMobile, isMobile } = useSidebar();

  const handleClick = () => {
    if (isMobile && openMobile) {
      toggleSidebar();
    }
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Useful Links</SidebarGroupLabel>
      <SidebarMenu>
        {elements.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              {item.isExternal ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
                  <item.icon />
                  <span>{item.name}</span>
                </a>
              ) : (
                <Link to={item.url as RoutePath} onClick={handleClick}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
