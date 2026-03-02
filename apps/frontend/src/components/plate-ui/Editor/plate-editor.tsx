import { Value } from '@udecode/plate';
import {
  Plate,
  PlateEditor,
} from '@udecode/plate/react';
import { useRef, type JSX } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plugins } from '@/types/Editor/editor.types';
import { CommentModes } from '../../Input/RichTextEditor/RichTextEditor';
import { CommentsPopover } from '../comments-popover';
import { RTECitationProvider } from '../Contexts/RTECitationContext';
import { RTECommentsProvider } from '../Contexts/RTECommentsContext';
import { RTEEvidenceProvider } from '../Contexts/RTEEvidenceContext';
import { RTETableProvider } from '../Contexts/RTETableContext';
import { Editor } from '../editor';
import { FixedToolbar } from '../fixed-toolbar';
import { FixedToolbarButtons } from '../fixed-toolbar-buttons';
import { TooltipProvider } from '../tooltip';

interface IClassNames {
  root?: string;
  toolbar?: string;
  editor?: string;
}

interface IProps {
  editor: PlateEditor,
  classNames?: IClassNames;
  readonly?: boolean;
  condensed?: boolean;
  hideToolbar?: boolean;
  disablePlugins?: Plugins[];
  onChange?: ((options: { editor: PlateEditor, value: Value }) => void) | null;
  onAddEvidence?: (evidenceId: string, triggerReload?: boolean) => Promise<void>;
  commentMode: CommentModes;
  hideComments: boolean;
  flexibleTableWidth?: boolean;
  hideEvidence?: boolean;
}

export function CustomPlateEditor({
  editor,
  classNames,
  readonly,
  condensed,
  hideToolbar,
  disablePlugins = [],
  onChange,
  onAddEvidence,
  commentMode,
  hideComments,
  flexibleTableWidth = false,
  hideEvidence = false,
}: IProps): JSX.Element {
  const rootRef = useRef<HTMLElement | null>(null);

  return (
    <TooltipProvider>
      <DndProvider backend={HTML5Backend}>
        <RTECitationProvider editor={editor}>
          <RTETableProvider flexibleTableWidth={flexibleTableWidth}>
            <RTEEvidenceProvider
              readonly={Boolean(readonly)}
              hideEvidence={hideEvidence}
              editor={editor}
            >
              <RTECommentsProvider hideComments={hideComments} commentMode={commentMode}>
                <Plate
                  editor={editor}
                  onChange={onChange}
                  readOnly={readonly}
                >
                  <span ref={rootRef} className={classNames?.root}>
                    {(!readonly && !hideToolbar) && (
                      <FixedToolbar
                        className={classNames?.toolbar}
                        style={{
                          backgroundColor: '#FAFBFC',
                          borderRadius: '8px 8px 0 0',
                          border: '1px solid #E3E3E8',
                          borderBottom: 'none',
                        }}
                      >
                        <FixedToolbarButtons
                          disablePlugins={disablePlugins}
                          onAddEvidence={onAddEvidence}
                          commentMode={commentMode}
                        />
                      </FixedToolbar>
                    )}

                    <Editor
                      className={classNames?.editor}
                      style={{
                        minHeight: readonly ? '0px' : 'inherit',
                        borderRadius: readonly || hideToolbar ? '8px' : '0 0 8px 8px',
                        // Additional padding for the draggable handle
                        paddingLeft: readonly || disablePlugins?.includes('drag') ? '12px' : '24px',
                        ...(condensed ? {
                          border: 'none',
                          padding: '2px',
                        } : {}),
                      }}
                      spellCheck="true"
                      autoCorrect="true"
                      autoCapitalize="sentences"
                    />
                    <CommentsPopover
                      commentPopoverAnchor={rootRef.current}
                      commentMode={commentMode}
                    />
                  </span>
                </Plate>
              </RTECommentsProvider>
            </RTEEvidenceProvider>
          </RTETableProvider>
        </RTECitationProvider>
      </DndProvider>
    </TooltipProvider>
  );
}
