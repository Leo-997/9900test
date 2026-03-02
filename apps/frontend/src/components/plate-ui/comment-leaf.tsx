import { cn } from '@udecode/cn';
import {
  findCommentNodeById,
  TCommentText,
} from '@udecode/plate-comments';
import { useCommentLeaf, useCommentLeafState } from '@udecode/plate-comments/react';
import {
  PlateLeaf, PlateLeafProps, useEditorRef, useEditorSelection,
} from '@udecode/plate/react';
import { useEffect, type JSX } from 'react';
import { useRTEComments } from './Contexts/RTECommentsContext';

interface IProps extends PlateLeafProps<TCommentText> {
  hideComments: boolean,
}

export function CommentLeaf({
  className,
  ...props
}: IProps): JSX.Element {
  const {
    children, nodeProps, leaf,
  } = props;

  const state = useCommentLeafState({ leaf });
  const { props: rootProps } = useCommentLeaf(state);
  const { hideComments } = useRTEComments();
  const editor = useEditorRef();
  const selection = useEditorSelection();

  const node = findCommentNodeById(editor, state.lastCommentId);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowRight') {
        if (
          node
          && selection
          && JSON.stringify(node[1]) === JSON.stringify(selection.anchor.path)
          && JSON.stringify(node[1]) === JSON.stringify(selection.focus.path)
          && selection.anchor.offset === selection.focus.offset
          && selection.focus.offset === node[0].text.length
          && editor.api.isEnd(selection.anchor, selection.focus)
        ) {
          editor.tf.insertNode({
            text: ' ',
          });
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [editor, node, selection]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowLeft') {
        if (
          node
          && selection
          && JSON.stringify(node[1]) === JSON.stringify(selection.anchor.path)
          && JSON.stringify(node[1]) === JSON.stringify(selection.focus.path)
          && selection.anchor.offset === selection.focus.offset
          && JSON.stringify(selection.focus.path) === '[0,0]'
          && selection.focus.offset === 0
        ) {
          editor.tf.insertNode({
            text: ' ',
          });
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [editor, node, selection]);

  if (hideComments) return children;

  let aboveChildren = children;

  if (!state.isActive) {
    for (let i = 1; i < state.commentCount; i += 1) {
      aboveChildren = <span className="bg-zinc-900/20 dark:bg-zinc-50/20">{aboveChildren}</span>;
    }
  }

  return (
    <PlateLeaf
      {...props}
      className={cn(
        'border-b-2 border-b-[#40E58D]',
        state.isActive ? 'bg-[#84FFBE]' : 'bg-[#D1FCE6]',
        className,
      )}
      nodeProps={{
        ...rootProps,
        ...nodeProps,
      }}
    >
      {aboveChildren}
    </PlateLeaf>
  );
}
