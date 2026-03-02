import { withCn, withProps } from '@udecode/cn';
import { Value, WithPartial } from '@udecode/plate';
import {
  autoformatArrow,
  autoformatLegal,
  autoformatLegalHtml,
  autoformatPunctuation,
  AutoformatRule,
  autoformatSmartQuotes,
} from '@udecode/plate-autoformat';
import { AutoformatPlugin } from '@udecode/plate-autoformat/react';
import {
  BoldPlugin, ItalicPlugin, StrikethroughPlugin, UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { TComment } from '@udecode/plate-comments';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { Hotkeys } from '@udecode/plate-core';
import { PlateEditor, usePlateEditor } from '@udecode/plate-core/react';
import { CsvPlugin } from '@udecode/plate-csv';
import { DndPlugin } from '@udecode/plate-dnd';
import { DocxPlugin } from '@udecode/plate-docx';
import { FontBackgroundColorPlugin, FontColorPlugin, FontSizePlugin } from '@udecode/plate-font/react';
import { indent, outdent } from '@udecode/plate-indent';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { JuicePlugin } from '@udecode/plate-juice';
import { LinkPlugin } from '@udecode/plate-link/react';
import {
  indentListItems, toggleList, unindentListItems, unwrapList,
} from '@udecode/plate-list';
import {
  BulletedListPlugin,
  ListItemPlugin,
  ListPlugin,
  NumberedListPlugin,
} from '@udecode/plate-list/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { DeletePlugin } from '@udecode/plate-select';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import {
  TableCellHeaderPlugin, TableCellPlugin, TablePlugin, TableRowPlugin,
} from '@udecode/plate-table/react';
import { ParagraphPlugin, PlateLeaf } from '@udecode/plate/react';
import { Plugins } from '@/types/Editor/editor.types';
import { CommentLeaf } from '../comment-leaf';
import { DraggableAboveNodes } from '../draggable';
import { EvidenceEmbedElement } from '../evidence-element';
import { InlineCitationElement } from '../inline-citation-element';
import { InlinePlateElement } from '../inline-plate-element';
import { InlineVoidPlateElement } from '../inline-void-plate-element';
import { LinkElement } from '../link-element';
import { ListElement } from '../list-element';
import { ParagraphElement } from '../paragraph-element';
import { withPlaceholders } from '../placeholder';
import { PlateElement } from '../plate-element';
import { DiffPlugin } from '../Plugins/diff-plugin';
import { EvidencePlugin } from '../Plugins/evidence';
import { FloatingToolbarPlugin } from '../Plugins/floating-toolbar-plugin';
import { InlineCitationPlugin } from '../Plugins/inline-citation';
import { InlinePlugin } from '../Plugins/inline-plugin';
import { InlineVoidPlugin } from '../Plugins/inline-void-plugin';
import { TableCellElement, TableCellHeaderElement } from '../table-cell-element';
import { TableElement } from '../table-element';
import { TableRowElement } from '../table-row-element';
import { CleanClipboardHtmlPlugin } from '../Plugins/clean-clipboard-html-plugin';

interface ICommentOptions {
  onCommentAdd: (newComment: WithPartial<TComment, 'userId'>) => void;
  onCommentDelete: (commentId: string) => void;
  onCommentUpdate: (newComment: Pick<TComment, 'id'> & Partial<Omit<TComment, 'id'>>) => void;
  comments: Record<string, TComment>;
  myUserId: string;
}

interface ICreateEditorProps {
  disablePlugins?: Plugins[],
  placeholder?: string,
  commentOptions?: ICommentOptions,
  value: Value;
}

export const autoformatLists: AutoformatRule[] = [
  {
    mode: 'block',
    type: ListItemPlugin.key,
    match: ['* ', '- '],
    preFormat: (editor) => unwrapList(editor),
    format: (editor): void => {
      toggleList(editor, {
        type: BulletedListPlugin.key,
      });
    },
  },
  {
    mode: 'block',
    type: ListItemPlugin.key,
    match: ['1. ', '1) '],
    preFormat: (editor) => unwrapList(editor),
    format: (editor): void => {
      toggleList(editor, {
        type: NumberedListPlugin.key,
      });
    },
  },
];

export const autoformatRules = [
  ...autoformatLists,
  ...autoformatSmartQuotes,
  ...autoformatPunctuation,
  ...autoformatLegal,
  ...autoformatLegalHtml,
  ...autoformatArrow,
];

export const useCreateEditor = ({
  disablePlugins,
  placeholder,
  value,
  commentOptions,
}: ICreateEditorProps, deps: React.DependencyList): PlateEditor => usePlateEditor({
  override: {
    components: withPlaceholders(
      {
        [EvidencePlugin.key]: EvidenceEmbedElement,
        [InlineCitationPlugin.key]: InlineCitationElement,
        [LinkPlugin.key]: LinkElement,
        [ParagraphPlugin.key]: ParagraphElement,
        [ListItemPlugin.key]: withProps(PlateElement, { as: 'li' }),
        [BulletedListPlugin.key]: withProps(ListElement, { variant: 'ul' }),
        [NumberedListPlugin.key]: withProps(ListElement, { variant: 'ol' }),
        [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
        [ItalicPlugin.key]: withCn(withProps(PlateLeaf, { as: 'em' }), 'relative z-[1]'),
        [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
        [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
        [CommentsPlugin.key]: CommentLeaf,
        ...(
          !disablePlugins?.includes('table') ? {
            [TablePlugin.key]: TableElement,
            [TableRowPlugin.key]: TableRowElement,
            [TableCellPlugin.key]: TableCellElement,
            [TableCellHeaderPlugin.key]: TableCellHeaderElement,
          } : {}
        ),
      },
      placeholder ? {
        key: ParagraphPlugin.key,
        placeholder,
        hideOnBlur: true,
        query: {
          maxLevel: 1,
        },
      } : undefined,
    ),
  },
  plugins: [
    CleanClipboardHtmlPlugin,
    ParagraphPlugin,
    DocxPlugin,
    BlockSelectionPlugin,
    NodeIdPlugin,
    DeletePlugin,
    CsvPlugin,
    MarkdownPlugin,
    JuicePlugin,
    EvidencePlugin.configure({
      enabled: !disablePlugins?.includes('evidence'),
    }),
    InlineCitationPlugin.configure({
      enabled: !disablePlugins?.includes('inline-citation'),
    }),
    LinkPlugin.configure({
      enabled: !disablePlugins?.includes('link'),
    }),
    TablePlugin.configure({
      enabled: !disablePlugins?.includes('table'),
      options: {
        disableMerge: false,
      },
    }),
    BoldPlugin.configure({
      enabled: !disablePlugins?.includes('bold'),
    }),
    ItalicPlugin.configure({
      enabled: !disablePlugins?.includes('italic'),
    }),
    UnderlinePlugin.configure({
      enabled: !disablePlugins?.includes('underline'),
    }),
    StrikethroughPlugin.configure({
      enabled: !disablePlugins?.includes('strikethrough'),
    }),
    FontColorPlugin.configure({
      enabled: !disablePlugins?.includes('text-colour'),
    }),
    FontBackgroundColorPlugin.configure({
      enabled: !disablePlugins?.includes('text-bg'),
    }),
    FontSizePlugin.configure({
      enabled: false,
    }),
    DndPlugin.configure({
      enabled: !disablePlugins?.includes('drag'),
      render: {
        aboveNodes: DraggableAboveNodes,
      },
    }),
    IndentPlugin.configure({
      enabled: !disablePlugins?.includes('list'),
      inject: {
        targetPlugins: [ParagraphPlugin.key],
      },
      handlers: {
        onKeyDown: (ctx) => {
          if (ctx.event.defaultPrevented) return;
          if (Hotkeys.isTab(ctx.editor, ctx.event)) {
            ctx.event.preventDefault();
            indentListItems(ctx.editor);
            indent(ctx.editor);
          }
          if (Hotkeys.isUntab(ctx.editor, ctx.event)) {
            ctx.event.preventDefault();
            unindentListItems(ctx.editor);
            outdent(ctx.editor);
          }
        },
      },
    }),
    ListPlugin.configure({
      enabled: !disablePlugins?.includes('list'),
      inject: {
        targetPlugins: [
          ParagraphPlugin.key,
        ],
      },
    }),
    AutoformatPlugin.configure({
      options: {
        rules: [
          ...autoformatRules,
        ],
        enableUndoOnDelete: true,
      },
    }),
    CommentsPlugin.configure({
      enabled: !disablePlugins?.includes('comment'),
      options: {
        ...commentOptions,
      },
    }),
    FloatingToolbarPlugin.configure({
      enabled: true,
    }),
    DiffPlugin,
    InlinePlugin.withComponent(InlinePlateElement),
    InlineVoidPlugin.withComponent(InlineVoidPlateElement),
  ],
  value,
}, deps);
