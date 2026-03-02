import { useCommentAddButton } from '@udecode/plate-comments/react';

import { Icons } from '@/components/plate-ui/Icons';

import { ToolbarButton } from './toolbar';

import type { JSX } from "react";

export function CommentToolbarButton(): JSX.Element | null {
  const { hidden, props } = useCommentAddButton();

  if (hidden) return null;

  return (
    <ToolbarButton tooltip="Comment (⌘+⇧+M)" {...props}>
      <Icons.commentAdd />
    </ToolbarButton>
  );
}
