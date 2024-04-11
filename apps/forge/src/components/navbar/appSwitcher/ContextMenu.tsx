import React, {ReactNode} from "react";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem, ContextMenuLabel, ContextMenuSeparator,
    ContextMenuTrigger
} from "@ui/components/ui/context-menu";

type ContextMenuWrapperProps = {
    children: ReactNode;
};

const ContextMenuWrapper: React.FC<ContextMenuWrapperProps> = ({ children }) => {
    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                <ContextMenuLabel>
                    Platform
                </ContextMenuLabel>
                <ContextMenuItem>
                    Copy Logo as SVG
                </ContextMenuItem>
                <ContextMenuItem>
                    Copy WordMark as SVG
                </ContextMenuItem>
                <ContextMenuItem>
                    Brand Guidelines
                </ContextMenuItem>
                <ContextMenuItem>
                    Home
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuLabel>
                    Links
                </ContextMenuLabel>
                <ContextMenuItem>
                    Training
                </ContextMenuItem>
                <ContextMenuItem>
                    ḿ̶̟͔̬̬̹̅̐̀̅ê̷̳͕͎͓̜̓͂͌̒̚ð̷̨̳͈̹̩̾͆̎͐́w̸͉̞̯͙͔̐͂̒̓̑
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};

export default ContextMenuWrapper;