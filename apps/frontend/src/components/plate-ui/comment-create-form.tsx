import { cn } from '@udecode/cn';
import {
  CommentNewSubmitButton,
  CommentNewTextarea,
  CommentsPlugin,
  useCommentNewSubmitButton,
} from '@udecode/plate-comments/react';
import { usePluginOption } from '@udecode/plate-core/react';
import { buttonVariants } from './button';
import { CommentAvatar } from './comment-avatar';
import { inputVariants } from './input';

import type { JSX } from "react";

interface ICommentCreateFormProps {
  scrollableRef: React.RefObject<HTMLDivElement | null>;
}

export function CommentCreateForm({
  scrollableRef,
}: ICommentCreateFormProps): JSX.Element {
  const myUserId = usePluginOption(CommentsPlugin, 'myUserId');
  const { props } = useCommentNewSubmitButton();

  const scrollToBottom = (): void => {
    const container = scrollableRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  return (
    <div className="flex w-full space-x-2">
      <CommentAvatar userId={myUserId as string} />

      <div className="flex grow flex-col items-end gap-2">
        <CommentNewTextarea className={inputVariants()} rows={5} />

        <CommentNewSubmitButton
          className={cn(buttonVariants({ size: 'sm' }), 'w-[90px]')}
          onClick={(): void => {
            props.onClick();
            setTimeout(() => {
              scrollToBottom();
            }, 10);
          }}
        >
          Comment
        </CommentNewSubmitButton>
      </div>
    </div>
  );
}
