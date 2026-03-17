import { createPlatePlugin } from '@udecode/plate-core/react';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const InlineVoidPlugin = createPlatePlugin({
  key: 'inline-void',
  node: { isElement: true, isInline: true, isVoid: true },
});
