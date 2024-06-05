import React from "react";

import type * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { PopoverAnchor } from "@radix-ui/react-popover";
import { cn, withRef } from "@udecode/cn";
import {
  PlateElement,
  isSelectionExpanded,
  useEditorRef,
  useEditorSelector,
  useElement,
  useRemoveNodeButton,
  withHOC,
} from "@udecode/plate-common";
import {
  type TTableElement,
  TableProvider,
  mergeTableCells,
  unmergeTableCells,
  useTableBordersDropdownMenuContentState,
  useTableElement,
  useTableElementState,
  useTableMergeState,
} from "@udecode/plate-table";
import { useReadOnly, useSelected } from "slate-react";

import { Delete, Table, TableCellsMerge, TableCellsSplit } from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Popover, PopoverContent, popoverVariants } from "./popover";
import { Separator } from "./separator";

export const TableBordersDropdownMenuContent = withRef<typeof DropdownMenuPrimitive.Content>((props, ref) => {
  const {
    getOnSelectTableBorder,
    hasBottomBorder,
    hasLeftBorder,
    hasNoBorders,
    hasOuterBorders,
    hasRightBorder,
    hasTopBorder,
  } = useTableBordersDropdownMenuContentState();

  return (
    <DropdownMenuContent align="start" className={cn("min-w-[220px]")} ref={ref} side="right" sideOffset={0} {...props}>
      <DropdownMenuCheckboxItem checked={hasBottomBorder} onCheckedChange={getOnSelectTableBorder("bottom")}>
        {/* TODO these need better icons. Probably overlay a bold line on the side */}
        <Table className="h-8 w-8" />
        <div>Bottom Border</div>
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem checked={hasTopBorder} onCheckedChange={getOnSelectTableBorder("top")}>
        <Table className="h-8 w-8" />
        <div>Top Border</div>
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem checked={hasLeftBorder} onCheckedChange={getOnSelectTableBorder("left")}>
        <Table className="h-8 w-8" />
        <div>Left Border</div>
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem checked={hasRightBorder} onCheckedChange={getOnSelectTableBorder("right")}>
        <Table className="h-8 w-8" />
        <div>Right Border</div>
      </DropdownMenuCheckboxItem>

      <Separator />

      <DropdownMenuCheckboxItem checked={hasNoBorders} onCheckedChange={getOnSelectTableBorder("none")}>
        <Table className="h-8 w-8" />
        <div>No Border</div>
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem checked={hasOuterBorders} onCheckedChange={getOnSelectTableBorder("outer")}>
        <Table className="h-8 w-8" />
        <div>Outside Borders</div>
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  );
});

export const TableFloatingToolbar = withRef<typeof PopoverContent>(({ children, ...props }, ref) => {
  const element = useElement<TTableElement>();
  const { props: buttonProps } = useRemoveNodeButton({ element });

  const selectionCollapsed = useEditorSelector((editor) => !isSelectionExpanded(editor), []);

  const readOnly = useReadOnly();
  const selected = useSelected();
  const editor = useEditorRef();

  const collapsed = !readOnly && selected && selectionCollapsed;
  const open = !readOnly && selected;

  const { canMerge, canUnmerge } = useTableMergeState();

  const mergeContent = canMerge && (
    <Button contentEditable={false} isMenu onClick={() => mergeTableCells(editor)} variant="ghost">
      <TableCellsMerge className="mr-2 size-4" />
      Merge
    </Button>
  );

  const unmergeButton = canUnmerge && (
    <Button contentEditable={false} isMenu onClick={() => unmergeTableCells(editor)} variant="ghost">
      <TableCellsSplit className="mr-2 size-4" />
      Unmerge
    </Button>
  );

  const bordersContent = collapsed && (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button isMenu variant="ghost">
            <Table className="mr-2 size-4" />
            Borders
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuPortal>
          <TableBordersDropdownMenuContent />
        </DropdownMenuPortal>
      </DropdownMenu>

      <Button contentEditable={false} isMenu variant="ghost" {...buttonProps}>
        <Delete className="mr-2 size-4" />
        Delete
      </Button>
    </>
  );

  return (
    <Popover modal={false} open={open}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      {(canMerge || canUnmerge || collapsed) && (
        <PopoverContent
          className={cn(popoverVariants(), "flex w-[220px] flex-col gap-1 p-1")}
          onOpenAutoFocus={(e) => e.preventDefault()}
          ref={ref}
          {...props}
        >
          {unmergeButton}
          {mergeContent}
          {bordersContent}
        </PopoverContent>
      )}
    </Popover>
  );
});

export const TableElement = withHOC(
  TableProvider,
  withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
    const { colSizes, isSelectingCell, marginLeft, minColumnWidth } = useTableElementState();
    const { colGroupProps, props: tableProps } = useTableElement();

    return (
      <TableFloatingToolbar>
        <div style={{ paddingLeft: marginLeft }}>
          <PlateElement
            asChild
            className={cn(
              "my-4 ml-px mr-0 table h-px w-full table-fixed border-collapse",
              isSelectingCell && "[&_*::selection]:bg-none",
              className,
            )}
            ref={ref}
            {...tableProps}
            {...props}
          >
            <table>
              <colgroup {...colGroupProps}>
                {colSizes.map((width, index) => (
                  <col
                    key={index}
                    style={{
                      minWidth: minColumnWidth,
                      width: width || undefined,
                    }}
                  />
                ))}
              </colgroup>

              <tbody className="min-w-full">{children}</tbody>
            </table>
          </PlateElement>
        </div>
      </TableFloatingToolbar>
    );
  }),
);
