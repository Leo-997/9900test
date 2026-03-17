import { TElement, TextApi } from '@udecode/plate';
import { ParagraphPlugin } from '@udecode/plate-core/react';
import { parseText } from './parser';

export const trimRTEValue = (textValue: string): string => {
  const { value, comments } = parseText(textValue);
  const newValue = [...value];
  const isEmptyNode = (node: TElement): boolean => (
    node.type === ParagraphPlugin.key
      && node.children.length === 1
      && TextApi.isText(node.children[0])
      && node.children[0].text === ''
  );
  while (newValue.length > 0 && isEmptyNode(newValue[newValue.length - 1])) {
    newValue.pop();
  }
  return JSON.stringify({ value: newValue, comments });
};
