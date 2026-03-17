import { CommentToolbarButton } from './comment-toolbar-button';
import { useRTEComments } from './Contexts/RTECommentsContext';

import type { JSX } from "react";

export function FloatingToolbarButtons(): JSX.Element | null {
  const { commentMode } = useRTEComments();

  if (commentMode === 'readOnly') return null;

  return (
    <CommentToolbarButton />
  );
}
