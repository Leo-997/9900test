import { PlateElementProps } from '@udecode/plate/react';
import { PlateElement } from './plate-element';

import type { JSX } from "react";

export function InlinePlateElement({ children, ...props }: PlateElementProps): JSX.Element {
  return (
    <PlateElement
      {...props}
      as="span"
      className="rounded-sm bg-slate-200/50 p-1"
    >
      {children}
    </PlateElement>
  );
}
