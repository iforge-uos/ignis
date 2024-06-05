import React from "react";

import { withRef } from "@udecode/cn";
import { useIndentButton } from "@udecode/plate-indent";

import { ToolbarButton } from "./toolbar";
import { IndentIncrease } from "lucide-react";

export const IndentToolbarButton = withRef<typeof ToolbarButton>((rest, ref) => {
  const { props } = useIndentButton();

  return (
    <ToolbarButton ref={ref} tooltip="Indent" {...props} {...rest}>
      <IndentIncrease />
    </ToolbarButton>
  );
});
