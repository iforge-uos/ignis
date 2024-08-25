import { withRef } from "@udecode/cn";
import { useIndentTodoToolBarButton, useIndentTodoToolBarButtonState } from "@udecode/plate-indent-list";

import { ListTodoIcon } from "lucide-react";
import { ToolbarButton } from "./toolbar";

export const TodoListElementButton = withRef<typeof ToolbarButton>((rest, ref) => {
  const state = useIndentTodoToolBarButtonState({ nodeType: "todo" });
  const { props } = useIndentTodoToolBarButton(state);

  return (
    <ToolbarButton ref={ref} tooltip="Multiple Answer Question" {...props} {...rest}>
      <ListTodoIcon />
    </ToolbarButton>
  );
});
