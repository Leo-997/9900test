import { cn } from '@udecode/cn';
import { PlateElementProps, useSelected } from '@udecode/plate/react';
import type { JSX } from 'react';
import { PlateElement } from './plate-element';

export function InlineVoidPlateElement({ children, ...props }: PlateElementProps): JSX.Element {
  const selected = useSelected();

  return (
    <PlateElement {...props} as="span">
      <span
        className={cn(
          'rounded-sm bg-slate-200/50 p-1',
          selected && 'bg-blue-500 text-white',
        )}
        contentEditable={false}
      >
        Inline void
      </span>
      {children}
    </PlateElement>
  );
}
