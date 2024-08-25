import { AutoformatBlockRule } from "@udecode/plate-autoformat";
import { AutoformatRule } from "@udecode/plate-autoformat";
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
} from "@udecode/plate-basic-marks";
import { ELEMENT_BLOCKQUOTE } from "@udecode/plate-block-quote";
import { ELEMENT_CODE_BLOCK, insertEmptyCodeBlock } from "@udecode/plate-code-block";
import { ELEMENT_CODE_LINE } from "@udecode/plate-code-block";
import {
  ELEMENT_DEFAULT,
  PlateEditor,
  getParentNode,
  insertNodes,
  isBlock,
  isElement,
  isType,
  setNodes,
} from "@udecode/plate-common";
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_H4, ELEMENT_H5, ELEMENT_H6 } from "@udecode/plate-heading";
import { ELEMENT_HR } from "@udecode/plate-horizontal-rule";
import { ListStyleType, toggleIndentList } from "@udecode/plate-indent-list";
import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
  TTodoListItemElement,
  toggleList,
  unwrapList,
} from "@udecode/plate-list";

export const preFormat: AutoformatBlockRule["preFormat"] = (editor) => unwrapList(editor);

export const format = (editor: PlateEditor, customFormatting: any) => {
  if (editor.selection) {
    const parentEntry = getParentNode(editor, editor.selection);
    if (!parentEntry) return;
    const [node] = parentEntry;
    if (isElement(node) && !isType(editor, node, ELEMENT_CODE_BLOCK) && !isType(editor, node, ELEMENT_CODE_LINE)) {
      customFormatting();
    }
  }
};

export const formatList = (editor: PlateEditor, elementType: string) => {
  format(editor, () =>
    toggleList(editor, {
      type: elementType,
    }),
  );
};

export const formatText = (editor: PlateEditor, text: string) => {
  format(editor, () => editor.insertText(text));
};

export const autoformatBlocks: AutoformatRule[] = [
  {
    mode: "block",
    type: ELEMENT_H1,
    match: "# ",
    preFormat,
  },
  {
    mode: "block",
    type: ELEMENT_H2,
    match: "## ",
    preFormat,
  },
  {
    mode: "block",
    type: ELEMENT_H3,
    match: "### ",
    preFormat,
  },
  {
    mode: "block",
    type: ELEMENT_H4,
    match: "#### ",
    preFormat,
  },
  {
    mode: "block",
    type: ELEMENT_H5,
    match: "##### ",
    preFormat,
  },
  {
    mode: "block",
    type: ELEMENT_H6,
    match: "###### ",
    preFormat,
  },
  {
    mode: "block",
    type: ELEMENT_BLOCKQUOTE,
    match: "> ",
    preFormat,
  },
  {
    mode: "block",
    type: ELEMENT_CODE_BLOCK,
    match: "```",
    triggerAtBlockStart: false,
    preFormat,
    format: (editor) => {
      insertEmptyCodeBlock(editor, {
        defaultType: ELEMENT_DEFAULT,
        insertNodesOptions: { select: true },
      });
    },
  },
  {
    mode: "block",
    type: ELEMENT_HR,
    match: ["---", "—-", "___ "],
    format: (editor) => {
      setNodes(editor, { type: ELEMENT_HR });
      insertNodes(editor, {
        type: ELEMENT_DEFAULT,
        children: [{ text: "" }],
      });
    },
  },
];

export const autoformatIndentLists: AutoformatRule[] = [
  {
    mode: "block",
    type: "list",
    match: ["* ", "- "],
    format: (editor) => {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Disc,
      });
    },
  },
  {
    mode: "block",
    type: "list",
    match: ["1. ", "1) "],
    format: (editor) =>
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Decimal,
      }),
  },
];

export const autoformatLists: AutoformatRule[] = [
  {
    mode: "block",
    type: ELEMENT_LI,
    match: ["* ", "- "],
    preFormat,
    format: (editor) => formatList(editor, ELEMENT_UL),
  },
  {
    mode: "block",
    type: ELEMENT_LI,
    match: ["1. ", "1) "],
    preFormat,
    format: (editor) => formatList(editor, ELEMENT_OL),
  },
  {
    mode: "block",
    type: ELEMENT_TODO_LI,
    match: "[] ",
  },
  {
    mode: "block",
    type: ELEMENT_TODO_LI,
    match: "[x] ",
    format: (editor) =>
      setNodes<TTodoListItemElement>(
        editor,
        { type: ELEMENT_TODO_LI, checked: true },
        {
          match: (n) => isBlock(editor, n),
        },
      ),
  },
];

export const autoformatMarks: AutoformatRule[] = [
  {
    mode: "mark",
    type: [MARK_BOLD, MARK_ITALIC],
    match: "***",
  },
  {
    mode: "mark",
    type: [MARK_UNDERLINE, MARK_ITALIC],
    match: "__*",
  },
  {
    mode: "mark",
    type: [MARK_UNDERLINE, MARK_BOLD],
    match: "__**",
  },
  {
    mode: "mark",
    type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
    match: "___***",
  },
  {
    mode: "mark",
    type: MARK_BOLD,
    match: "**",
  },
  {
    mode: "mark",
    type: MARK_UNDERLINE,
    match: "__",
  },
  {
    mode: "mark",
    type: MARK_ITALIC,
    match: "*",
  },
  {
    mode: "mark",
    type: MARK_ITALIC,
    match: "_",
  },
  {
    mode: "mark",
    type: MARK_STRIKETHROUGH,
    match: "~~",
  },
  {
    mode: "mark",
    type: MARK_SUPERSCRIPT,
    match: "^",
  },
  {
    mode: "mark",
    type: MARK_SUBSCRIPT,
    match: "~",
  },
  {
    mode: "mark",
    type: MARK_CODE,
    match: "`",
  },
];
