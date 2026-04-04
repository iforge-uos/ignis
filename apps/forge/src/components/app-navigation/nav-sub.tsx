import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@packages/ui/components/sidebar";
import { Link } from "@tanstack/react-router";
import { NavSub as NavSubType } from "@/types/nav";

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
            <SidebarMenuButton asChild className="transition-colors duration-200" disabled={item.disabled}>
              {item.isExternal ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
                  <item.icon />
                  <span>{item.name}</span>
                </a>
              ) : (
                <Link to={item.url} params={item.params && typeof item.params === "function" ? item.params() : item.params} onClick={handleClick}>
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
