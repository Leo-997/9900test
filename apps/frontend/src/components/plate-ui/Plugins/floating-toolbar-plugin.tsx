import { createPlatePlugin } from '@udecode/plate/react';
import { FloatingToolbar } from '../floating-toolbar';
import { FloatingToolbarButtons } from '../floating-toolbar-buttons';

export const FloatingToolbarPlugin = createPlatePlugin({
  key: 'floating-toolbar',
  render: {
    beforeEditable: () => (
      <FloatingToolbar state={{ showWhenReadOnly: true }}>
        <FloatingToolbarButtons />
      </FloatingToolbar>
    ),
  },
});
