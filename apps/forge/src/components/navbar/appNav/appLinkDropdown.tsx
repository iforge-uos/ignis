import { AppLink } from "@/config/appLinks.ts";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button.tsx";
import React, { useState } from "react";

type DropdownLinkProps = {
  link: AppLink;
  onClick: (id: string, url: string) => void;
  activeId: string;
  onLinkClick?: () => void;
};

const DropdownLink: React.FC<DropdownLinkProps> = ({ link, onClick, activeId, onLinkClick }) => {
  const renderLink = (linkItem: AppLink, level = 0): React.ReactNode => {
    const hasChildren = linkItem.children && linkItem.children.length > 0;
    const isActive = linkItem.id === activeId;

    // Link styles
    const linkClasses = `flex justify-center items-center p-2 text-sm font-medium rounded-md text-card-foreground hover:bg-accent ${
      isActive ? "border-2 border-accent/40" : ""
    }`;

    // Function to handle link click
    const handleLinkClick = (
      event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
      itemId: string,
      itemLink: string,
    ) => {
      event.preventDefault();
      onClick(itemId, itemLink);
      if (onLinkClick) onLinkClick();
    };

    // Top level link that is also a trigger for a dropdown
    if (hasChildren && level === 0) {
      return (
        <DropdownMenu.Root key={linkItem.id}>
          <DropdownMenu.Trigger asChild>
            <Link
              to={linkItem.path ?? "#"}
              className={linkClasses}
              onClick={(event) =>
                handleLinkClick(
                  event as unknown as React.MouseEvent<HTMLAnchorElement, MouseEvent>,
                  linkItem.id,
                  linkItem.path ?? "#",
                )
              }
            >
              {linkItem.displayName}
            </Link>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            align="start"
            sideOffset={5}
            className="bg-card shadow-lg rounded-md border border-accent/40 z-50"
          >
            {/* Children links */}
            {linkItem.children!.map((child) => renderLink(child, level + 1))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      );
    }

    if (hasChildren) {
      return (
        <DropdownMenu.Sub key={linkItem.id}>
          <DropdownMenu.SubTrigger asChild>
            <Button className={linkClasses}>{linkItem.displayName}</Button>
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent sideOffset={5} className="bg-card shadow-lg rounded-md border border-gray-200 z-50">
            {linkItem.children!.map((child) => renderLink(child, level + 1))}
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
      );
    }

    return (
      <DropdownMenu.Item key={linkItem.id} asChild>
        <Link
          to={linkItem.path ?? "#"}
          className={`${linkClasses} p-3`}
          onClick={(event) =>
            handleLinkClick(
              event as unknown as React.MouseEvent<HTMLAnchorElement, MouseEvent>,
              linkItem.id,
              linkItem.path ?? "#",
            )
          }
        >
          {linkItem.displayName}
        </Link>
      </DropdownMenu.Item>
    );
  };

  return renderLink(link);
};

export const AppLinkDropdown: React.FC<{ link: AppLink; onLinkClick?: () => void }> = ({ link, onLinkClick }) => {
  const [activeId, setActiveId] = useState("");
  const navigate = useNavigate();

  const handleItemClick = (id: string, path: string) => {
    setActiveId(id);
    navigate({ to: path });
    if (onLinkClick) onLinkClick();
  };

  return <DropdownLink link={link} onClick={handleItemClick} activeId={activeId} onLinkClick={onLinkClick} />;
};
