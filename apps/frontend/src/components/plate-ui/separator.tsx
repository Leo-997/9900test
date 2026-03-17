import { corePalette } from '@/themes/colours';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { withProps, withVariants } from '@udecode/cn';
import { cva } from 'class-variance-authority';

const separatorVariants = cva(`shrink-0 border-[${corePalette.grey30}] border-solid border-[1px]`, {
  defaultVariants: {
    orientation: 'horizontal',
  },
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'h-full w-px',
    },
  },
});

export const Separator = withVariants(
  withProps(SeparatorPrimitive.Root, {
    decorative: true,
    orientation: 'vertical',
  }),
  separatorVariants,
);
