import { withProps } from "@udecode/cn";
import { createAlignPlugin } from "@udecode/plate-alignment";
import { createAutoformatPlugin } from "@udecode/plate-autoformat";
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createUnderlinePlugin,
} from "@udecode/plate-basic-marks";
import { ELEMENT_BLOCKQUOTE, createBlockquotePlugin } from "@udecode/plate-block-quote";
import { createExitBreakPlugin, createSoftBreakPlugin } from "@udecode/plate-break";
import { createCaptionPlugin } from "@udecode/plate-caption";
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_SYNTAX,
  createCodeBlockPlugin,
} from "@udecode/plate-code-block";
import { createComboboxPlugin } from "@udecode/plate-combobox";
import {
  Plate,
  PlateLeaf,
  PlateProps,
  RenderAfterEditable,
  Value,
  createPlateEditor as createPlateEditor_,
  createPlugins,
} from "@udecode/plate-common";
import { createDndPlugin } from "@udecode/plate-dnd";
import { createEmojiPlugin } from "@udecode/plate-emoji";
import { createFontBackgroundColorPlugin, createFontColorPlugin, createFontSizePlugin } from "@udecode/plate-font";
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  createHeadingPlugin,
} from "@udecode/plate-heading";
import { ELEMENT_HR, createHorizontalRulePlugin } from "@udecode/plate-horizontal-rule";
import { createIndentPlugin } from "@udecode/plate-indent";
import { createIndentListPlugin } from "@udecode/plate-indent-list";
import { createJuicePlugin } from "@udecode/plate-juice";
import { MARK_KBD, createKbdPlugin } from "@udecode/plate-kbd";
import { createLineHeightPlugin } from "@udecode/plate-line-height";
import { ELEMENT_LINK, createLinkPlugin } from "@udecode/plate-link";
import { ELEMENT_TODO_LI, createTodoListPlugin } from "@udecode/plate-list";
import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED, createImagePlugin, createMediaEmbedPlugin } from "@udecode/plate-media";
import { createNodeIdPlugin } from "@udecode/plate-node-id";
import { ELEMENT_PARAGRAPH, createParagraphPlugin } from "@udecode/plate-paragraph";
import { createResetNodePlugin } from "@udecode/plate-reset-node";
import { createDeletePlugin } from "@udecode/plate-select";
import { createBlockSelectionPlugin } from "@udecode/plate-selection";
import { createDeserializeMdPlugin } from "@udecode/plate-serializer-md";
import { createTabbablePlugin } from "@udecode/plate-tabbable";
import { ELEMENT_TABLE, ELEMENT_TD, ELEMENT_TH, ELEMENT_TR, createTablePlugin } from "@udecode/plate-table";
import { ELEMENT_TOGGLE, createTogglePlugin } from "@udecode/plate-toggle";
import { createTrailingBlockPlugin } from "@udecode/plate-trailing-block";

import {
  autoformatArrow,
  autoformatLegal,
  autoformatLegalHtml,
  autoformatMath,
  autoformatPunctuation,
  autoformatSmartQuotes,
} from "@udecode/plate-autoformat";
import { VariantProps } from "class-variance-authority";
import { TodoLi, TodoMarker } from "./IndentTodoMarker";
import { autoformatBlocks, autoformatIndentLists, autoformatLists, autoformatMarks } from "./autoformat";
import { BlockquoteElement } from "./blockquote-element";
import { CodeBlockElement } from "./code-block-element";
import { CodeLeaf } from "./code-leaf";
import { CodeLineElement } from "./code-line-element";
import { CodeSyntaxLeaf } from "./code-syntax-leaf";
import { CommentLeaf } from "./comment-leaf";
import { CommentsPopover } from "./comments-popover";
import { Editor, EditorProps, editorVariants } from "./editor";
import { EmojiCombobox } from "./emoji-combobox";
import { FixedToolbar } from "./fixed-toolbar";
import { FixedToolbarButtons } from "./fixed-toolbar-buttons";
import { FloatingToolbar } from "./floating-toolbar";
import { FloatingToolbarButtons } from "./floating-toolbar-buttons";
import { HeadingElement } from "./heading-element";
import { HrElement } from "./hr-element";
import { ImageElement } from "./image-element";
import { KbdLeaf } from "./kbd-leaf";
import { LinkElement } from "./link-element";
import { LinkFloatingToolbar } from "./link-floating-toolbar";
import { MediaEmbedElement } from "./media-embed-element";
import { ParagraphElement } from "./paragraph-element";
import { withPlaceholders } from "./placeholder";
import { TableCellElement, TableCellHeaderElement } from "./table-cell-element";
import { TableElement } from "./table-element";
import { TableRowElement } from "./table-row-element";
import { TodoListElement } from "./todo-list-element";
import { ToggleElement } from "./toggle-element";
import { TooltipProvider } from "./tooltip";
import { withDraggables } from "./with-draggables";
import React from "react";

const plugins = createPlugins(
  [
    createParagraphPlugin(),
    createHeadingPlugin(),
    createBlockquotePlugin(),
    createCodeBlockPlugin(),
    createHorizontalRulePlugin(),
    createLinkPlugin({
      renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable,
    }),
    createImagePlugin(),
    createTogglePlugin(),
    createMediaEmbedPlugin(),
    createCaptionPlugin({
      options: {
        pluginKeys: [
          // ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED
        ],
      },
    }),
    createTablePlugin(),
    createTodoListPlugin(),
    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createStrikethroughPlugin(),
    createCodePlugin(),
    createSubscriptPlugin(),
    createSuperscriptPlugin(),
    createFontColorPlugin(),
    createFontBackgroundColorPlugin(),
    createFontSizePlugin(),
    createKbdPlugin(),
    createAlignPlugin({
      inject: {
        props: {
          validTypes: [
            ELEMENT_PARAGRAPH,
            // ELEMENT_H1, ELEMENT_H2, ELEMENT_H3
          ],
        },
      },
    }),
    createIndentPlugin({
      inject: {
        props: {
          validTypes: [ELEMENT_PARAGRAPH, ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_BLOCKQUOTE, ELEMENT_CODE_BLOCK],
        },
      },
    }),
    createIndentListPlugin({
      inject: {
        props: {
          validTypes: [ELEMENT_PARAGRAPH, ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_BLOCKQUOTE, ELEMENT_CODE_BLOCK],
        },
      },
      options: {
        listStyleTypes: {
          todo: {
            liComponent: TodoLi,
            markerComponent: TodoMarker,
            type: "todo",
          },
        },
      },
    }),
    createLineHeightPlugin({
      inject: {
        props: {
          defaultNodeValue: 1.5,
          validNodeValues: [1, 1.2, 1.5, 2, 3],
          validTypes: [
            ELEMENT_PARAGRAPH,
            // ELEMENT_H1, ELEMENT_H2, ELEMENT_H3
          ],
        },
      },
    }),
    createBlockSelectionPlugin({
      options: {
        sizes: {
          top: 0,
          bottom: 0,
        },
      },
    }),
    createDndPlugin({
      options: { enableScroller: true },
    }),
    createEmojiPlugin({
      renderAfterEditable: EmojiCombobox,
    }),
    createExitBreakPlugin({
      options: {
        rules: [
          {
            hotkey: "mod+enter",
          },
          {
            hotkey: "mod+shift+enter",
            before: true,
          },
          {
            hotkey: "enter",
            query: {
              start: true,
              end: true,
              // allow: KEYS_HEADING,
            },
            relative: true,
            level: 1,
          },
        ],
      },
    }),
    createNodeIdPlugin(),
    createResetNodePlugin({
      options: {
        rules: [
          // Usage: https://platejs.org/docs/reset-node
        ],
      },
    }),
    createDeletePlugin(),
    createSoftBreakPlugin({
      options: {
        rules: [
          { hotkey: "shift+enter" },
          {
            hotkey: "enter",
            query: {
              allow: [
                // ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE, ELEMENT_TD
              ],
            },
          },
        ],
      },
    }),
    createTabbablePlugin(),
    createTrailingBlockPlugin({
      options: { type: ELEMENT_PARAGRAPH },
    }),
    createAutoformatPlugin({
      options: {
        rules: [
          ...autoformatBlocks,
          ...autoformatLists,
          ...autoformatIndentLists,
          ...autoformatMarks,
          ...autoformatSmartQuotes,
          ...autoformatPunctuation,
          ...autoformatLegal,
          ...autoformatLegalHtml,
          ...autoformatArrow,
          ...autoformatMath,
        ],
        enableUndoOnDelete: true,
      },
    }),
    createComboboxPlugin(),
    createDeserializeMdPlugin(),
    createJuicePlugin(),
  ],
  {
    components: withDraggables(
      withPlaceholders({
        [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
        [ELEMENT_CODE_BLOCK]: CodeBlockElement,
        [ELEMENT_CODE_LINE]: CodeLineElement,
        [ELEMENT_CODE_SYNTAX]: CodeSyntaxLeaf,
        [ELEMENT_HR]: HrElement,
        [ELEMENT_IMAGE]: ImageElement,
        [ELEMENT_LINK]: LinkElement,
        [ELEMENT_TOGGLE]: ToggleElement,
        [ELEMENT_H1]: withProps(HeadingElement, { variant: "h1" }),
        [ELEMENT_H2]: withProps(HeadingElement, { variant: "h2" }),
        [ELEMENT_H3]: withProps(HeadingElement, { variant: "h3" }),
        [ELEMENT_H4]: withProps(HeadingElement, { variant: "h4" }),
        [ELEMENT_H5]: withProps(HeadingElement, { variant: "h5" }),
        [ELEMENT_H6]: withProps(HeadingElement, { variant: "h6" }),
        [ELEMENT_MEDIA_EMBED]: MediaEmbedElement,
        [ELEMENT_PARAGRAPH]: ParagraphElement,
        [ELEMENT_TABLE]: TableElement,
        [ELEMENT_TR]: TableRowElement,
        [ELEMENT_TD]: TableCellElement,
        [ELEMENT_TH]: TableCellHeaderElement,
        [ELEMENT_TODO_LI]: TodoListElement,
        [MARK_BOLD]: withProps(PlateLeaf, { as: "strong" }),
        [MARK_CODE]: CodeLeaf,
        [MARK_ITALIC]: withProps(PlateLeaf, { as: "em" }),
        [MARK_KBD]: KbdLeaf,
        [MARK_STRIKETHROUGH]: withProps(PlateLeaf, { as: "s" }),
        [MARK_SUBSCRIPT]: withProps(PlateLeaf, { as: "sub" }),
        [MARK_SUPERSCRIPT]: withProps(PlateLeaf, { as: "sup" }),
        [MARK_UNDERLINE]: withProps(PlateLeaf, { as: "u" }),
      }),
    ),
  },
);

export function PlateEditor<V extends Value = Value>({
  initialValue,
  placeholder,
  toolbarClassName,
  className,
  editorProps,
}: Omit<PlateProps<V>, "children"> & {
  placeholder?: string;
  toolbarClassName?: string;
  className?: string;
  editorProps?: EditorProps;
}) {
  return (
    <TooltipProvider disableHoverableContent delayDuration={500} skipDelayDuration={0}>
      <DndProvider backend={HTML5Backend}>
        {/* <CommentsProvider users={{}} myUserId="1"> */}
        <Plate plugins={plugins} initialValue={initialValue}>
          {/* <FixedToolbar className={toolbarClassName}>
            <FixedToolbarButtons />
          </FixedToolbar> */}

          <Editor placeholder={placeholder} className={className} {...editorProps} />

          <FloatingToolbar>
            <FixedToolbarButtons />
          </FloatingToolbar>
          {/* <CommentsPopover /> */}
        </Plate>
        {/* </CommentsProvider> */}
      </DndProvider>
    </TooltipProvider>
  );
}

export const MemoisedPlateEditor = React.memo(PlateEditor);

/* Used for mocking/serialisation purposes */
export function createPlateEditor() {
  return createPlateEditor_({ plugins });
}
