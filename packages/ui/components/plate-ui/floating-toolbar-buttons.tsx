import React from "react";

import { MARK_BOLD, MARK_CODE, MARK_ITALIC, MARK_STRIKETHROUGH, MARK_UNDERLINE } from "@udecode/plate-basic-marks";
import { useEditorReadOnly } from "@udecode/plate-common";

import { useShortcutKey } from "@/lib/utils";
import { Bold, Code, Italic, Strikethrough, Underline } from "lucide-react";
import { MarkToolbarButton } from "./mark-toolbar-button";
import { MoreDropdownMenu } from "./more-dropdown-menu";
import { TurnIntoDropdownMenu } from "./turn-into-dropdown-menu";

export function FloatingToolbarButtons() {
  const readOnly = useEditorReadOnly();
  const metaKey = useShortcutKey();

  return (
    <>
      {!readOnly && (
        <>
          <TurnIntoDropdownMenu />

          <MarkToolbarButton nodeType={MARK_BOLD} tooltip={`Bold (${metaKey}B)`}>
            <Bold />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={MARK_ITALIC} tooltip={`Italic (${metaKey}I)`}>
            <Italic />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={MARK_UNDERLINE} tooltip={`Underline (${metaKey}U)`}>
            <Underline />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={MARK_STRIKETHROUGH} tooltip={`Strikethrough (⇧${metaKey}M)`}>
            <Strikethrough />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={MARK_CODE} tooltip={`Code (${metaKey}E)`}>
            <Code />
          </MarkToolbarButton>
        </>
      )}

      <MoreDropdownMenu />
    </>
  );
}
