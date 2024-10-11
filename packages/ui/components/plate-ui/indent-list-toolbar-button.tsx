import React from "react";

import { withRef } from "@udecode/cn";
import { ListStyleType, useIndentListToolbarButton, useIndentListToolbarButtonState } from "@udecode/plate-indent-list";

import { List, ListOrdered } from "lucide-react";
import { ToolbarButton } from "./toolbar";

export const IndentListToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: ListStyleType;
  }
>(({ nodeType = ListStyleType.Disc }, ref) => {
  const state = useIndentListToolbarButtonState({ nodeType });
  const { props } = useIndentListToolbarButton(state);

  return (
    <ToolbarButton ref={ref} tooltip={nodeType === ListStyleType.Disc ? "Bulleted List" : "Numbered List"} {...props}>
      {nodeType === ListStyleType.Disc ? <List /> : <ListOrdered />}
    </ToolbarButton>
  );
});
