import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn, withRef } from '@udecode/cn';
import { type VariantProps, cva } from 'class-variance-authority';

export const Popover = PopoverPrimitive.Root;

export const PopoverTrigger = PopoverPrimitive.Trigger;

export const PopoverAnchor = PopoverPrimitive.Anchor;

export const popoverVariants = cva(
  'z-50 w-72 rounded-md border bg-white p-4 text-popover-foreground shadow-md outline-hidden print:hidden',
  {
    defaultVariants: {
      animate: true,
    },
    variants: {
      animate: {
        true: 'z-50 bg-white data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:zoom-in-95', // Ensures no opacity
      },
    },
  },
);

export const PopoverContent = withRef<
  typeof PopoverPrimitive.Content,
  VariantProps<typeof popoverVariants>
>(({
  align = 'center', animate, className, sideOffset = 4, ...props
}, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      className={cn(popoverVariants({ animate }), className)}
      align={align}
      sideOffset={sideOffset}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
