import { cn, withRef } from '@udecode/cn';
import { PlateElement, useElement } from '@udecode/plate/react';
import { TLinkElement } from '@udecode/plate-link';
import { useLink } from '@udecode/plate-link/react';

export const LinkElement = withRef<typeof PlateElement>(
  ({ className, children, ...props }, ref) => {
    const element = useElement<TLinkElement>();
    const { props: linkProps } = useLink({ element });

    return (
      <PlateElement
        ref={ref}
        asChild
        className={cn(
          'font-medium text-zinc-900 underline decoration-primary underline-offset-4 dark:text-zinc-50',
          className,
        )}
        {...(linkProps as any)}
        {...props}
      >
        <a>{children}</a>
      </PlateElement>
    );
  },
);
