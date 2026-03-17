import { Tooltip } from '@mui/material';
import { DiffOperation } from '@udecode/plate-diff';
import { PlateLeaf, PlateLeafProps } from '@udecode/plate/react';
import { describeDiffUpdate, diffOperationColors } from './Plugins/diff-plugin';

import type { JSX } from "react";

export function DiffLeaf({ children, ...props }: PlateLeafProps): JSX.Element {
  const diffOperation = props.leaf.diffOperation as DiffOperation;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const Component = (
    {
      delete: 'del',
      insert: 'ins',
      update: 'span',
    } as Record<DiffOperation['type'], keyof JSX.IntrinsicElements>
  )[diffOperation.type];

  return (
    <PlateLeaf {...props} asChild>
      <Tooltip
        title={
          diffOperation.type === 'update'
            ? describeDiffUpdate(diffOperation)
            : undefined
        }
      >
        <Component
          style={{
            backgroundColor: diffOperationColors[diffOperation.type],
          }}
        >
          {children}
        </Component>
      </Tooltip>
    </PlateLeaf>
  );
}
