import React, {useState} from "react";
import {Link, useNavigate} from "@tanstack/react-router";
import {AppLink} from "@/components/navbar/appNav/appLinks.ts";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

type DropdownLinkProps = {
    link: AppLink;
    onClick: (id: string, url: string) => void;
    activeId: string;
};

const DropdownLink: React.FC<DropdownLinkProps> = ({link, onClick, activeId}) => {
    const renderLink = (linkItem: AppLink, level = 0): React.ReactNode => {
        const hasChildren = linkItem.children && linkItem.children.length > 0;
        const isActive = linkItem.id === activeId;

        // Link styles
        const linkClasses = `block px-4 py-2 text-sm rounded-md text-navbar-foreground hover:bg-accent ${isActive ? "border-2 border-accent" : ""}`;

        // Function to handle link click
        const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, itemId: string, itemLink: string) => {
            event.preventDefault();
            onClick(itemId, itemLink);
        };

        // Top level link that is also a trigger for a dropdown
        if (hasChildren && level === 0) {
            return (
                <DropdownMenu.Root key={linkItem.id}>
                    <DropdownMenu.Trigger asChild>
                        <Link to={linkItem.path ?? '#'} className={linkClasses}
                              onClick={(event) => handleLinkClick(event, linkItem.id, linkItem.path ?? "#")}>
                            {linkItem.displayName}
                        </Link>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="start" sideOffset={5}
                                          className="bg-navbar shadow-lg rounded-md border border-gray-200 z-50">
                        {/* Extra entry for the clickable root */}
                        <DropdownMenu.Item asChild>
                            <Link to={linkItem.path ?? '#'} className={linkClasses}
                                  onClick={(event) => handleLinkClick(event, linkItem.id, linkItem.path ?? "#")}>
                                {linkItem.displayName}
                            </Link>
                        </DropdownMenu.Item>
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
                        <button className={linkClasses}>
                            {linkItem.displayName}
                        </button>
                    </DropdownMenu.SubTrigger>
                    <DropdownMenu.SubContent sideOffset={5}
                                             className="bg-navbar shadow-lg rounded-md border border-gray-200 z-50">
                        {linkItem.children!.map((child) => renderLink(child, level + 1))}
                    </DropdownMenu.SubContent>
                </DropdownMenu.Sub>
            );
        }

        return (
            <DropdownMenu.Item key={linkItem.id} asChild>
                <Link to={linkItem.path ?? '#'} className={linkClasses}
                      onClick={(event) => handleLinkClick(event, linkItem.id, linkItem.path ?? "#")}>
                    {linkItem.displayName}
                </Link>
            </DropdownMenu.Item>
        );
    };

    return renderLink(link);
};

export const AppLinkDropdown: React.FC<{ link: AppLink }> = ({link}) => {
    const [activeId, setActiveId] = useState("");
    const navigate = useNavigate();

    const handleItemClick = (id: string, path: string) => {
        setActiveId(id);
        navigate({to: path});
    };

    return <DropdownLink link={link} onClick={handleItemClick} activeId={activeId}/>;
};