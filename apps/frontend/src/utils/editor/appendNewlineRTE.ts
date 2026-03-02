import { ParagraphPlugin } from '@udecode/plate-core/react';
import { parseText } from './parser';

export const appendNewlineRTE = (initialValue: string): string => {
  const { value, comments } = parseText(initialValue);
  const newValue = [...value, { type: ParagraphPlugin.key, children: [{ text: '' }] }];
  return JSON.stringify({ value: newValue, comments });
};
