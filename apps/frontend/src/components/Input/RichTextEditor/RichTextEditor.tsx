import { Box, debounce, IconButton } from '@mui/material';
import {
  InsertNodesOptions,
  RemoveNodesOptions,
  TElement,
  TNode,
  Value,
  WithPartial,
} from '@udecode/plate';
import { TComment } from '@udecode/plate-comments';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { serializeMd } from '@udecode/plate-markdown';
import { PencilIcon } from 'lucide-react';
import {
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { ParagraphPlugin, PlateEditor } from '@udecode/plate/react';
import { parseText } from '@/utils/editor/parser';
import { getRTEInlineCitations } from '@/utils/editor/getRTEInlineCitations';
import { Plugins } from '@/types/Editor/editor.types';
import { useCreateEditor } from '@/components/plate-ui/Editor/use-create-editor';
import { useUser } from '@/contexts/UserContext';
import { emptyEditorState } from '@/components/plate-ui/Editor/editor-states';
import CustomButton from '@/components/Common/Button';
import './richTextEditor.css';
import { CustomPlateEditor } from '@/components/plate-ui/Editor/plate-editor';

interface IClassNames {
  root?: string;
  toolbar?: string;
  editor?: string;
}

interface IInsertNodesOptions<V extends Value = Value>
extends InsertNodesOptions<V>{
  end?: boolean,
}

interface IRemoveNodesOptions<V extends Value = Value>
extends RemoveNodesOptions<V>{
  end?: boolean,
}

export interface IRTERef {
  clear: () => void;
  save: () => void;
  reset: (newValue?: string) => void;
  isEmpty: () => boolean;
  getMarkdownText: () => string;
  getInlineCitations: () => string[];
  getContent: () => string;
  insertNodes: (content: TElement | TElement[], options?: IInsertNodesOptions<Value>) => string;
  removeNodes: (options?: IRemoveNodesOptions<Value>) => string;
}

type RTEModes =
  | 'normal' // need to click button to save. reverts to read only with pen icon after saving
  | 'autoSave' // no buttons, saves on blur
  | 'manualSave' // click button to save, but does not revert to read-only mode
  | 'readOnly'; // always read only mode.

export type CommentModes =
  | 'readOnly' // hide comment toolbar button and all editing options in comment popover, but user can still view comments by clicking comment mark
  | 'edit'; // user can read and edit comments

interface IRichTextEditorProps {
  initialText?: string;
  title?: ReactNode;
  placeholder?: string;
  classNames?: IClassNames;
  condensed?: boolean; // Removes padding and border in editor area
  hideToolbar?: boolean;
  hideActions?: boolean;
  disablePlugins?: Plugins[];
  disableSaveOnEmpty?: boolean;
  // not to be used for saving or causing the RTE to re-render as this causes issues
  // for that, use onSave
  onChange?: (newText: string) => void;
  onSave?: (newText: string) => void;
  onAddEvidence?: (evidenceId: string, triggerReload?: boolean) => Promise<void>;
  onCancel?: () => void;
  hideEvidence?: boolean;
  hideEmptyEditor?: boolean;
  mode?: RTEModes;
  commentMode?: CommentModes;
  hideComments?: boolean;
  flexibleTableWidth?: boolean;
}

export const RichTextEditor = forwardRef<IRTERef, IRichTextEditorProps>(({
  initialText = '',
  title,
  placeholder,
  classNames,
  condensed = false,
  hideToolbar = false,
  hideActions = false,
  disablePlugins = [],
  disableSaveOnEmpty,
  onChange,
  onSave,
  onAddEvidence,
  onCancel,
  hideEvidence,
  hideEmptyEditor = false,
  mode = 'normal',
  commentMode = 'readOnly',
  hideComments = false,
  flexibleTableWidth = false,
}: IRichTextEditorProps, ref) => {
  const { currentUser } = useUser();
  const { value: initialValue, comments: initialComments } = parseText(initialText);

  const editor = useCreateEditor({
    placeholder,
    disablePlugins,
    value: initialValue,
  }, []);

  const [value, setValue] = useState<Value>(initialValue);
  const [comments, setComments] = useState<Record<string, TComment>>(initialComments);
  const [editing, setEditing] = useState<boolean>(['manualSave', 'autoSave'].includes(mode));
  const [isEmpty, setIsEmpty] = useState<boolean>(editor.api.isEmpty());

  const handleSave = useCallback((newVal: Value, newComments: Record<string, TComment>): void => {
    setValue(newVal);
    onSave?.(JSON.stringify({ value: newVal, comments: newComments }));
    if (mode === 'normal') setEditing(false);
  }, [mode, onSave]);

  const onCommentAdd = useCallback((
    newComment: WithPartial<TComment, 'userId'>,
  ): void => {
    const newComments = {
      ...comments,
      [newComment.id]: newComment as TComment,
    };
    setComments(newComments);
    if (!editing) handleSave(editor.children, newComments);
    if (onChange) onChange(JSON.stringify({ value: editor.children, comments: newComments }));
  }, [comments, editing, editor.children, handleSave, onChange]);

  const onCommentDelete = useCallback((commentId: string): void => {
    const newComments = { ...comments };
    delete newComments[commentId];
    for (const comment of Object.values(newComments)) {
      if (comment.parentId === commentId) {
        delete newComments[comment.id];
      }
    }
    setComments(newComments);
    if (!editing) handleSave(editor.children, newComments);
    if (onChange) onChange(JSON.stringify({ value: editor.children, comments: newComments }));
  }, [comments, editing, editor.children, handleSave, onChange]);

  const onCommentUpdate = useCallback((newComment: Pick<TComment, 'id'> & Partial<Omit<TComment, 'id'>>): void => {
    if (newComment.isResolved) {
      editor.tf.unsetNodes(`${CommentsPlugin.key}_${newComment.id}`, {
        at: [],
        match: (node: TNode) => !!node[`${CommentsPlugin.key}_${newComment.id}`],
      });
      onCommentDelete(newComment.id);
    } else {
      const newComments = {
        ...comments,
        [newComment.id]: {
          ...comments[newComment.id],
          ...newComment,
        },
      };
      setComments(newComments);
      if (!editing) handleSave(editor.children, newComments);
      if (onChange) onChange(JSON.stringify({ value: editor.children, comments: newComments }));
    }
  }, [comments, editing, editor.children, editor.tf, handleSave, onCommentDelete, onChange]);

  const handleAutoSave = debounce(handleSave, 500);

  const handleCancel = useCallback((newValue?: string): void => {
    if (mode === 'normal') setEditing(false);
    editor.tf.reset(); // clear editor, leaving a single empty node
    editor.tf.removeNodes({ at: [0] }); // remove the empty node
    editor.tf.insertNodes(
      newValue
        ? parseText(newValue).value
        : value,
    ); // insert new nodes
    if (onCancel) {
      onCancel();
    }
    if (onChange) onChange(JSON.stringify({ value: editor.children, comments }));
  }, [value, editor.tf, mode, onCancel, onChange, comments, editor.children]);

  const handleOnChange = ({ value: newVal }: { editor: PlateEditor, value: Value }): void => {
    // Using the Delete key after removing all text empties the RTE (no nodes)
    // So we need to account for that and add an empty paragrapy node
    if (!editor.children.length) {
      editor.tf.insertNodes({
        type: ParagraphPlugin.key,
        children: [{ text: '' }],
      });
    }
    setIsEmpty(editor.api.isEmpty());
    if (onSave && mode === 'autoSave') handleAutoSave(newVal, comments);
    if (onChange) debounce(onChange)(JSON.stringify({ value: newVal, comments }));
  };

  useImperativeHandle(
    ref,
    () => ({
      clear: (): void => editor.tf.reset(),
      isEmpty: (): boolean => isEmpty,
      getMarkdownText: (): string => serializeMd(editor),
      getContent: (): string => (
        JSON.stringify({ value: editor.children, comments })
      ),
      getInlineCitations: (): string[] => getRTEInlineCitations(editor),
      save: (): void => setValue(editor.children || emptyEditorState),
      reset: handleCancel,
      insertNodes: (
        content: TElement | TElement[],
        options?: IInsertNodesOptions<Value>,
      ): string => {
        const endPoint = editor.api.end(editor);
        const ops = options?.end && endPoint
          ? { ...options, at: [editor.children.length] }
          : options;
        editor.tf.insertNodes(content, ops);
        return JSON.stringify({ value: editor.children, comments });
      },
      removeNodes: (options?: IRemoveNodesOptions<Value>): string => {
        const ops = options?.end ? { ...options, at: editor.api.end(editor) } : options;
        editor.tf.removeNodes(ops);
        return JSON.stringify({ value: editor.children, comments });
      },
    }),
    [handleCancel, editor, isEmpty, comments],
  );

  useEffect(() => {
    editor.setOptions(
      CommentsPlugin,
      {
        onCommentAdd,
        onCommentDelete,
        onCommentUpdate,
        comments,
        myUserId: currentUser?.id as string,
      },
    );
  }, [comments, currentUser?.id, editor, onCommentAdd, onCommentDelete, onCommentUpdate]);

  return (
    <div style={{ width: '100%' }}>
      <Box
        display={isEmpty && hideEmptyEditor ? 'none' : 'flex'}
        flexDirection="column"
        position="relative"
        className="rich-text-editor"
        width="100%"
      >
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          minHeight={title ? '39px' : '0px'}
        >
          {title}
          {mode === 'normal' && !editing && (
            <IconButton onClick={(): void => setEditing(true)}>
              <PencilIcon />
            </IconButton>
          )}
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          position="relative"
        >
          <CustomPlateEditor
            editor={editor}
            classNames={classNames}
            readonly={mode === 'readOnly' || (mode === 'normal' && !editing)}
            condensed={condensed}
            hideToolbar={hideToolbar}
            disablePlugins={disablePlugins}
            onChange={handleOnChange}
            onAddEvidence={onAddEvidence}
            hideEvidence={hideEvidence}
            commentMode={commentMode}
            hideComments={hideComments}
            flexibleTableWidth={flexibleTableWidth}
          />
        </Box>
        {!hideActions && (mode === 'manualSave' || (mode === 'normal' && editing)) && (
          <Box
            className="rte-actions"
            display="flex"
            flexDirection="row"
            justifyContent="flex-end"
            marginTop="8px"
          >
            <CustomButton
              label="Cancel"
              variant="subtle"
              size="small"
              onClick={(): void => handleCancel()}
            />
            <CustomButton
              label="Save"
              variant="bold"
              size="small"
              onClick={(): void => handleSave(
                editor.children || emptyEditorState,
                comments,
              )}
              style={{ marginLeft: 8 }}
              disabled={Boolean(
                disableSaveOnEmpty
                && isEmpty,
              )}
            />
          </Box>
        )}
      </Box>
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor'; // So it display correctly on Reac Dev Tool
