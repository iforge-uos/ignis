import { TElement } from "@udecode/plate-common";
import {
  type LiFC,
  MarkerFC,
  useIndentTodoListElement,
  useIndentTodoListElementState,
} from "@udecode/plate-indent-list";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";

export const TodoMarker: MarkerFC = ({ element }: { element: TElement }) => {
  const state = useIndentTodoListElementState({ element });
  const { checkboxProps } = useIndentTodoListElement(state);

  return (
    <div contentEditable={false}>
      <Checkbox style={{ left: -24, position: "absolute", top: 4 }} {...checkboxProps} />
    </div>
  );
};

export const TodoLi: LiFC = (props) => {
  const { children, element } = props;

  return <span className={cn((element.checked as boolean) && "text-muted-foreground")}>{children}</span>;
};
