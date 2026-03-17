import { cn } from '@udecode/cn';
import { PlateContent, PlateContentProps } from '@udecode/plate/react';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import React from 'react';

const editorVariants = cva(
  cn(
    'relative overflow-x-auto whitespace-pre-wrap break-words',
    'min-h-[80px] w-full rounded-md px-3 py-2 text-base ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400',
    '[&_[data-slate-placeholder]]:text-zinc-500 [&_[data-slate-placeholder]]:!opacity-100 dark:[&_[data-slate-placeholder]]:text-zinc-400',
    '[&_[data-slate-placeholder]]:top-[auto_!important]',
    '[&_strong]:font-bold',
  ),
  {
    variants: {
      variant: {
        outline: 'border border-zinc-200 dark:border-zinc-800',
        ghost: '',
      },
      focused: {
        true: 'ring-2 ring-zinc-950 ring-offset-2 dark:ring-zinc-300',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
      },
      focusRing: {
        true: 'focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-300',
        false: '',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'outline',
      focusRing: false,
      size: 'md',
    },
  },
);

export type EditorProps = Omit<PlateContentProps, 'onBlur'> &
  VariantProps<typeof editorVariants>;

const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
  (
    {
      className,
      disabled,
      focused,
      focusRing,
      readOnly,
      size,
      variant,
      ...props
    },
    ref,
  ) => (
    <div ref={ref} className="relative w-full">
      <PlateContent
        className={cn(
          editorVariants({
            disabled,
            focused,
            focusRing,
            size,
            variant,
          }),
          className,
        )}
        disableDefaultStyles
        readOnly={disabled ?? readOnly}
        aria-disabled={disabled}
        {...props}
      />
    </div>
  ),
);
Editor.displayName = 'Editor';

export { Editor };
