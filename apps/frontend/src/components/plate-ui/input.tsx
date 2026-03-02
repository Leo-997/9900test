import { withVariants } from '@udecode/cn';
import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'h-auto resize-none flex w-full rounded-md bg-transparent text-sm file:border-0 file:bg-white file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:file:bg-zinc-950 dark:placeholder:text-zinc-400',
  {
    variants: {
      variant: {
        default:
          'border border-zinc-200 ring-offset-white focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300',
        ghost: 'border-none focus-visible:ring-transparent',
      },
      h: {
        sm: 'h-9 px-3 py-2',
        md: 'h-10 px-3 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      h: 'md',
    },
  },
);

export const Input = withVariants('input', inputVariants, ['variant', 'h']);
