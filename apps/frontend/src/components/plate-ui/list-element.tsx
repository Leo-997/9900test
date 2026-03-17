import { withRef, withVariants } from '@udecode/cn';
import {
  PlateElement,
} from '@udecode/plate/react';
import { cva } from 'class-variance-authority';

const listVariants = cva('m-0 ps-6', {
  variants: {
    variant: {
      ul: 'list-disc [&_ul]:list-[circle] [&_ul_ul]:list-[square]',
      ol: 'list-decimal',
    },
  },
});

const ListElementVariants = withVariants(PlateElement, listVariants, [
  'variant',
]);

export const ListElement = withRef<typeof ListElementVariants>(
  ({
    children, variant = 'ul', ...props
  }, ref) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Component = variant ?? 'ul';

    return (
      <ListElementVariants ref={ref} asChild {...props} className="typography-bodyDefault">
        <Component>{children}</Component>
      </ListElementVariants>
    );
  },
);
