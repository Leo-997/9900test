import { corePalette } from '@/themes/colours';
import { Tooltip } from '@mui/material';
import { createSlatePlugin } from '@udecode/plate-core';
import { toPlatePlugin } from '@udecode/plate-core/react';
import { DiffOperation, DiffUpdate, withGetFragmentExcludeDiff } from '@udecode/plate-diff';
import { DiffLeaf } from '../diff-leaf';

import type { JSX } from "react";

export const diffOperationColors: Record<DiffOperation['type'], string> = {
  delete: corePalette.red30,
  insert: corePalette.green10,
  update: corePalette.blue30,
};

export const describeDiffUpdate = ({ newProperties, properties }: DiffUpdate): string => {
  const addedProps: string[] = [];
  const removedProps: string[] = [];
  const updatedProps: string[] = [];

  Object.keys(newProperties).forEach((key) => {
    const oldValue = properties[key];
    const newValue = newProperties[key];

    if (oldValue === undefined) {
      addedProps.push(key);

      return;
    }
    if (newValue === undefined) {
      removedProps.push(key);

      return;
    }

    updatedProps.push(key);
  });

  const descriptionParts: string[] = [];

  if (addedProps.length > 0) {
    descriptionParts.push(`Added ${addedProps.join(', ')}`);
  }
  if (removedProps.length > 0) {
    descriptionParts.push(`Removed ${removedProps.join(', ')}`);
  }
  if (updatedProps.length > 0) {
    updatedProps.forEach((key) => {
      descriptionParts.push(
        `Updated ${key} from ${properties[key]} to ${newProperties[key]}`,
      );
    });
  }

  return descriptionParts.join('\n');
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const DiffPlugin = toPlatePlugin(
  createSlatePlugin({
    key: 'diff',
    node: { isLeaf: true },
  }).overrideEditor(withGetFragmentExcludeDiff),
  {
    render: {
      node: DiffLeaf,
      aboveNodes:
        () => ({ children, editor, element }): JSX.Element => {
          if (!element.diff) return children;

          const diffOperation = element.diffOperation as DiffOperation;

          const label = (
            {
              delete: 'deletion',
              insert: 'insertion',
              update: 'update',
            } as Record<DiffOperation['type'], string>
          )[diffOperation.type];

          // eslint-disable-next-line @typescript-eslint/naming-convention
          const Component = editor.api.isInline(element) ? 'span' : 'div';

          return (
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
                aria-label={label}
              >
                {children}
              </Component>
            </Tooltip>
          );
        },
    },
  },
);
