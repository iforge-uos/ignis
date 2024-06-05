import React from "react";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

import { focusEditor, someNode, useEditorRef, useEditorSelector } from "@udecode/plate-common";
import {
  ELEMENT_TABLE,
  deleteColumn,
  deleteRow,
  deleteTable,
  insertTable,
  insertTableColumn,
  insertTableRow,
} from "@udecode/plate-table";

import {
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  Delete,
  FileSpreadsheet,
  Table,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

export function TableDropdownMenu(props: DropdownMenuProps) {
  const tableSelected = useEditorSelector((editor) => someNode(editor, { match: { type: ELEMENT_TABLE } }), []);

  const editor = useEditorRef();
  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton isDropdown pressed={openState.open} tooltip="Table">
          <Table />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="flex w-[180px] min-w-0 flex-col gap-0.5">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileSpreadsheet /> <span>Table</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              className="min-w-[180px]"
              onSelect={() => {
                insertTable(editor);
                focusEditor(editor);
              }}
            >
              <Table /> Insert table
            </DropdownMenuItem>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={() => {
                deleteTable(editor);
                focusEditor(editor);
              }}
            >
              <Delete /> Delete table
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={!tableSelected}>
            <BetweenVerticalEnd /> <span>Column</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={() => {
                insertTableColumn(editor);
                focusEditor(editor);
              }}
            >
              <BetweenVerticalEnd /> Insert column after
            </DropdownMenuItem>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={() => {
                deleteColumn(editor);
                focusEditor(editor);
              }}
            >
              <Delete /> Delete column
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={!tableSelected}>
            <BetweenHorizontalStart /> <span>Row</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={() => {
                insertTableRow(editor);
                focusEditor(editor);
              }}
            >
              <BetweenHorizontalEnd />
              Insert row after
            </DropdownMenuItem>
            <DropdownMenuItem
              className="min-w-[180px]"
              disabled={!tableSelected}
              onSelect={() => {
                deleteRow(editor);
                focusEditor(editor);
              }}
            >
              <Delete /> Delete row
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
