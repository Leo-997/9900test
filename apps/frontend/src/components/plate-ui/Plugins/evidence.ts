import { createSlatePlugin } from '@udecode/plate-core';
import { toPlatePlugin } from '@udecode/plate/react';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const BaseEvidencePlugin = createSlatePlugin({
  key: 'EVIDENCE',
  node: {
    isElement: true,
    isInline: false,
    isVoid: true,
    isMarkableVoid: true,
    isSelectable: true,
  },
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const EvidencePlugin = toPlatePlugin(BaseEvidencePlugin);
