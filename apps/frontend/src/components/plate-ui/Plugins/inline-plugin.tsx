import { createPlatePlugin } from '@udecode/plate/react';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const InlinePlugin = createPlatePlugin({
  key: 'inline',
  node: { isElement: true, isInline: true },
});
