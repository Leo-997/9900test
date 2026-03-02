import { cn } from '@udecode/cn';
import {
  CommentResolveButton as CommentResolveButtonPrimitive,
  useComment,
} from '@udecode/plate-comments/react';

import { Icons } from '@/components/plate-ui/Icons';

import { buttonVariants } from './button';

import type { JSX } from "react";

export function CommentResolveButton(): JSX.Element {
  const comment = useComment();

  return (
    <CommentResolveButtonPrimitive
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'h-6 p-1 text-zinc-500 dark:text-zinc-400',
      )}
    >
      {comment?.isResolved ? (
        <Icons.refresh className="size-4" />
      ) : (
        <Icons.check className="size-4" />
      )}
    </CommentResolveButtonPrimitive>
  );
}
