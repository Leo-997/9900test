/* eslint-disable @typescript-eslint/naming-convention */
import { createSlatePlugin, TElement } from '@udecode/plate';
import { toPlatePlugin } from '@udecode/plate/react';

export interface IInlineCitationOptions {
  evidenceId: string;
  citation: string;
}

export interface IInlineCitationElement extends TElement, IInlineCitationOptions {}

export interface IInlineCitation extends TElement {
  element: IInlineCitationOptions;
}

export const BaseInlineCitationPlugin = createSlatePlugin({
  key: 'inline-citation',
  node: {
    isElement: true,
    isInline: true,
    isVoid: true,
    isMarkableVoid: true,
    isSelectable: true,
  },
});

export const InlineCitationPlugin = toPlatePlugin(BaseInlineCitationPlugin);
