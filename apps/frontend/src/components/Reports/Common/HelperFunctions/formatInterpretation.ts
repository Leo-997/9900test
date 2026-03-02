import {
  Descendant, Value,
} from '@udecode/plate';
import { TComment } from '@udecode/plate-comments';
import { ParagraphPlugin } from '@udecode/plate-core/react';
import { parseText } from '@/utils/editor/parser';
import { ICommentVersion } from '@/types/Comments/CurationComments.types';

interface IComment {
  versions?: ICommentVersion[];
  reportOrder?: number | null;
  reportLineBreak?: boolean;
}

export default function formatInterpretation(
  comments?: IComment[],
): string {
  return (comments || [])
    .sort((a, b) => (a.reportOrder && b.reportOrder ? a.reportOrder - b.reportOrder : 0))
    .map((c) => `${c.versions?.[0]?.comment.trim().replace(/\.$/, '')}.`)
    .join(' ');
}

export function formatInterpretationRTE(comments?: IComment[], separator = ' '): string {
  const sortedComments = (comments || [])
    .sort((a, b) => (a.reportOrder && b.reportOrder ? a.reportOrder - b.reportOrder : 0));

  const values: Value = [];
  let inlineComments: Record<string, TComment> = {};

  const getCommentSeparator = (
    reportLineBreak: boolean,
    isLastComment: boolean,
  ): string => {
    if (isLastComment) return '';
    if (reportLineBreak) return '\n\n';
    return separator;
  };

  for (const [index, comment] of sortedComments.entries()) {
    const { value, comments: inline } = parseText(comment?.versions?.[0]?.comment || '');
    const lastElement = values[values.length - 1];
    const firstElement = value[0];
    // Conctenate the last sentence of the previous comment
    // with the fist sentence of the next comment
    if (
      lastElement
      && firstElement
      && lastElement.type === ParagraphPlugin.key
    ) {
      const newLastElement = {
        type: 'p',
        children: [
          ...lastElement.children,
          {
            text: getCommentSeparator(
              sortedComments[index - 1].reportLineBreak || false,
              false,
            ),
          },
          ...(firstElement.type === ParagraphPlugin.key
            ? firstElement.children
            : [firstElement]
          ),
        ],
      };
      values[values.length - 1] = newLastElement;
      value.shift();
    }
    values.push(...value);
    inlineComments = { ...inlineComments, ...inline };
  }

  const children = values.reduce<Descendant[]>(
    (prev, current) => [...prev, current],
    [],
  );

  return JSON.stringify({
    value: [
      {
        id: '1',
        type: 'p',
        children: children.length === 0
          ? [
            {
              text: '',
            },
          ] : children,
      },
    ],
    comments: inlineComments,
  });
}
