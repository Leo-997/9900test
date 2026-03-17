import {
  SCOPE_ACTIVE_COMMENT,
  useCommentReplies,
} from '@udecode/plate-comments/react';
import dayjs from 'dayjs';
import { CommentItem } from './comment-item';
import { CommentModes } from '../Input/RichTextEditor/RichTextEditor';

import type { JSX } from "react";

type CommentReplyItemProps = {
  commentMode: CommentModes;
}

export function CommentReplyItems({ commentMode }: CommentReplyItemProps): JSX.Element {
  const commentReplies = useCommentReplies(SCOPE_ACTIVE_COMMENT);

  return (
    <>
      {Object.values(commentReplies)
        .sort((a, b) => dayjs(a.createdAt).diff(dayjs(b.createdAt)))
        .map((comment) => (
          <CommentItem
            key={comment.id}
            commentId={comment.id}
            commentMode={commentMode}
          />
        ))}
    </>
  );
}
