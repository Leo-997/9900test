import {
  CommentProvider,
  CommentsPlugin,
  useCommentItemContentState,
} from '@udecode/plate-comments/react';
import dayjs from 'dayjs';
import { usePluginOption } from '@udecode/plate-core/react';
import { CommentAvatar } from './comment-avatar';
import { CommentMoreDropdown } from './comment-more-dropdown';
import { CommentResolveButton } from './comment-resolve-button';
import { CommentValue } from './comment-value';
import { CommentModes } from '../Input/RichTextEditor/RichTextEditor';

import type { JSX } from "react";

type PlateCommentProps = {
  commentId: string;
  commentMode: CommentModes;
};

type CommentItemContentProps = {
  commentMode: CommentModes;
}

function CommentItemContent(props: CommentItemContentProps): JSX.Element {
  const { commentMode } = props;
  const {
    comment,
    isReplyComment,
    user,
    editingValue,
    commentText,
  } = useCommentItemContentState();

  return (
    <div>
      <div className="relative flex items-center gap-2">
        <CommentAvatar userId={comment.userId} />

        <h4 className="text-sm font-semibold leading-none">{user?.name}</h4>

        <div className="text-xs leading-none text-zinc-500 dark:text-zinc-400">
          {dayjs(comment.createdAt).fromNow()}
        </div>

        <div className="absolute -right-0.5 -top-0.5 flex space-x-1">
          {!isReplyComment && commentMode === 'edit' && <CommentResolveButton />}
          {commentMode === 'edit' && <CommentMoreDropdown />}
        </div>
      </div>

      <div className="mb-4 pl-7 pt-0.5">
        {editingValue ? (
          <CommentValue />
        ) : (
          <div className="whitespace-pre-wrap text-sm pl-4 w-full break-words">
            {commentText}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentItem({ commentId, commentMode }: PlateCommentProps): JSX.Element | null {
  const comment = usePluginOption(CommentsPlugin, 'commentById', commentId);
  if (!comment) return null;

  return (
    <CommentProvider key={commentId} id={commentId}>
      <CommentItemContent commentMode={commentMode} />
    </CommentProvider>
  );
}
