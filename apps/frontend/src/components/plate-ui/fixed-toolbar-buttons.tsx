/* eslint-disable react/jsx-pascal-case */
import {
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { useEditorReadOnly } from '@udecode/plate/react';

import { Icons, iconVariants } from '@/components/plate-ui/Icons';

import { Plugins } from '@/types/Editor/editor.types';
import { FontBackgroundColorPlugin, FontColorPlugin } from '@udecode/plate-font/react';
import { BulletedListPlugin, NumberedListPlugin } from '@udecode/plate-list/react';
import { CommentModes } from '../Input/RichTextEditor/RichTextEditor';
import { ColorDropdownMenu } from './color-dropdown-menu';
import { CommentToolbarButton } from './comment-toolbar-button';
import { EvidenceToolbarButton } from './evidence-toolbar-button';
import { RedoToolbarButton, UndoToolbarButton } from './history-toolbar-button';
import { IndentToolbarButton } from './indent-toolbar-button';
import { InlineCitationToolbarButton } from './inline-citation-toolbar-button';
import { ListToolbarButton } from './list-toolbar-button';
import { MarkToolbarButton } from './mark-toolbar-button';
import { OutdentToolbarButton } from './outdent-toolbar-button';
import { TableDropdownMenu } from './table-dropdown-menu';
import { ToolbarGroup } from './toolbar';

import type { JSX } from "react";

interface IProps {
  commentMode: CommentModes;
  disablePlugins?: Plugins[];
  onAddEvidence?: (evidenceId: string, triggerReload?: boolean) => Promise<void>;
}

export function FixedToolbarButtons({
  commentMode,
  disablePlugins,
  onAddEvidence,
}: IProps): JSX.Element {
  const readOnly = useEditorReadOnly();

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex flex-wrap"
        style={{
          transform: 'translateX(calc(-1px))',
        }}
      >
        {!readOnly && (
          <>
            <ToolbarGroup>
              <UndoToolbarButton />
              <RedoToolbarButton />
            </ToolbarGroup>
            <ToolbarGroup>
              {!disablePlugins?.includes('bold') && (
                <MarkToolbarButton
                  tooltip="Bold (⌘+B)"
                  nodeType={BoldPlugin.key}
                >
                  <Icons.bold />
                </MarkToolbarButton>
              )}
              {!disablePlugins?.includes('italic') && (
                <MarkToolbarButton
                  tooltip="Italic (⌘+I)"
                  nodeType={ItalicPlugin.key}
                >
                  <Icons.italic />
                </MarkToolbarButton>
              )}
              {!disablePlugins?.includes('underline') && (
                <MarkToolbarButton
                  tooltip="Underline (⌘+U)"
                  nodeType={UnderlinePlugin.key}
                >
                  <Icons.underline />
                </MarkToolbarButton>
              )}
              {!disablePlugins?.includes('strikethrough') && (
                <MarkToolbarButton
                  tooltip="Strikethrough (⌘+⇧+M)"
                  nodeType={StrikethroughPlugin.key}
                >
                  <Icons.strikethrough />
                </MarkToolbarButton>
              )}
            </ToolbarGroup>

            <ToolbarGroup>
              {!disablePlugins?.includes('text-colour') && (
                <ColorDropdownMenu
                  nodeType={FontColorPlugin.key}
                  tooltip="Text Color"
                >
                  <Icons.color className={iconVariants({ variant: 'toolbar' })} />
                </ColorDropdownMenu>
              )}
              {!disablePlugins?.includes('text-bg') && (
                <ColorDropdownMenu
                  nodeType={FontBackgroundColorPlugin.key}
                  tooltip="Highlight Color"
                >
                  <Icons.bg className={iconVariants({ variant: 'toolbar' })} />
                </ColorDropdownMenu>
              )}
            </ToolbarGroup>

            <ToolbarGroup>
              {!disablePlugins?.includes('list') && (
                <>
                  <ListToolbarButton nodeType={BulletedListPlugin.key} />
                  <ListToolbarButton nodeType={NumberedListPlugin.key} />
                  <IndentToolbarButton />
                  <OutdentToolbarButton />
                </>
              )}
            </ToolbarGroup>

            <ToolbarGroup>
              {!disablePlugins?.includes('table') && (
                <TableDropdownMenu />
              )}
            </ToolbarGroup>
            <ToolbarGroup>
              {!disablePlugins?.includes('evidence') && (
                <EvidenceToolbarButton
                  tooltip="Evidence"
                  onAddEvidence={onAddEvidence}
                />
              )}
              {!disablePlugins?.includes('inline-citation') && (
                <InlineCitationToolbarButton
                  tooltip="Add a reference"
                />
              )}
            </ToolbarGroup>
          </>
        )}

        <div className="grow" />

        {!disablePlugins?.includes('comment') && commentMode === 'edit' && (
          <CommentToolbarButton />
        )}
      </div>
    </div>
  );
}
