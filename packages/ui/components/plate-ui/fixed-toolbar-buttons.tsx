import React from "react";

import { MARK_BOLD, MARK_CODE, MARK_ITALIC, MARK_STRIKETHROUGH, MARK_UNDERLINE } from "@udecode/plate-basic-marks";
import { useEditorReadOnly } from "@udecode/plate-common";

import { ListStyleType } from "@udecode/plate-indent-list";
import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from "@udecode/plate-media";
import { Bold, Code, Italic, Strikethrough, Underline } from "lucide-react";
import { EmojiDropdownMenu } from "./emoji-dropdown-menu";
import { IndentListToolbarButton } from "./indent-list-toolbar-button";
import { IndentToolbarButton } from "./indent-toolbar-button";
import { InsertDropdownMenu } from "./insert-dropdown-menu";
import { LineHeightDropdownMenu } from "./line-height-dropdown-menu";
import { LinkToolbarButton } from "./link-toolbar-button";
import { MarkToolbarButton } from "./mark-toolbar-button";
import { MediaToolbarButton } from "./media-toolbar-button";
import { ModeDropdownMenu } from "./mode-dropdown-menu";
import { MoreDropdownMenu } from "./more-dropdown-menu";
import { OutdentToolbarButton } from "./outdent-toolbar-button";
import { TableDropdownMenu } from "./table-dropdown-menu";
import { ToolbarGroup } from "./toolbar";
import { TurnIntoDropdownMenu } from "./turn-into-dropdown-menu";

export function FixedToolbarButtons() {
  const readOnly = useEditorReadOnly();

  const isMacOs = !!navigator?.userAgent?.match(/Macintosh;/);
  const metaKey = isMacOs ? "⌘" : "Ctrl";

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex flex-wrap"
        style={{
          transform: "translateX(calc(-1px))",
        }}
      >
        {!readOnly && (
          <>
            <ToolbarGroup noSeparator>
              <InsertDropdownMenu />
              <TurnIntoDropdownMenu />
            </ToolbarGroup>

            <ToolbarGroup>
              <MarkToolbarButton nodeType={MARK_BOLD} tooltip={`Bold (${metaKey}B)`}>
                <Bold />
              </MarkToolbarButton>
              <MarkToolbarButton nodeType={MARK_ITALIC} tooltip={`Italic (${metaKey}I)`}>
                <Italic />
              </MarkToolbarButton>
              <MarkToolbarButton nodeType={MARK_UNDERLINE} tooltip={`Underline (⇧${metaKey}U)`}>
                <Underline />
              </MarkToolbarButton>

              <MarkToolbarButton nodeType={MARK_STRIKETHROUGH} tooltip={`Strikethrough (⇧${metaKey}M)`}>
                <Strikethrough />
              </MarkToolbarButton>
              <MarkToolbarButton nodeType={MARK_CODE} tooltip={`Code (${metaKey}E)`}>
                <Code />
              </MarkToolbarButton>
            </ToolbarGroup>

            <ToolbarGroup>
              {/* <LineHeightDropdownMenu /> */}

              <IndentListToolbarButton nodeType={ListStyleType.Disc} />
              <IndentListToolbarButton nodeType={ListStyleType.Decimal} />

              <OutdentToolbarButton />
              <IndentToolbarButton />
            </ToolbarGroup>

            <ToolbarGroup>
              <LinkToolbarButton />

              <MediaToolbarButton nodeType={ELEMENT_IMAGE} />
              <MediaToolbarButton nodeType={ELEMENT_MEDIA_EMBED} />

              <TableDropdownMenu />

              <EmojiDropdownMenu />

              <MoreDropdownMenu />
            </ToolbarGroup>
          </>
        )}

        <div className="grow" />

        <ToolbarGroup noSeparator>
          <ModeDropdownMenu />
        </ToolbarGroup>
      </div>
    </div>
  );
}
