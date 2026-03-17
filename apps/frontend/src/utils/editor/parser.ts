import { htmlToSlate } from '@slate-serializers/html';
import { config as defaultHtmlToSlateConfig } from '@slate-serializers/html/src/lib/serializers/htmlToSlate/config/default';
import {
  ElementApi, NodeApi, TElement, Value,
} from '@udecode/plate';
import { TComment } from '@udecode/plate-comments';
import draftToHTML from 'draftjs-to-html';
import { Converter } from 'showdown';

export interface IRTEContent {
  value: Value;
  comments: Record<string, TComment>;
}

const getInlineComments = (value: TElement[]): Record<string, TComment> => {
  const comments: Record<string, TComment> = {};
  for (const node of value) {
    const elements = NodeApi.elements(node);
    for (const [element] of elements) {
      if (ElementApi.isElement(element) && element.type === 'inline-comment') {
        try {
          const comment: TComment = JSON.parse(element.commentContent as string);
          comments[comment.id] = comment;
        } catch { /* Ignore this comment */ }
      }
    }
  }

  return comments;
};

const normalizeHeadingNodes = (value: Value): Value => value.map((node) => {
  if ('type' in node && typeof node.type === 'string' && node.type.match(/^h[1-6]$/)) {
    return { ...node, type: 'p' };
  }
  return node;
});

/**
  *  This fn will support the old DraftJS editor state, which is saved
  *  across numerous fields in the database. These are the steps we take
  *  to ensure old text is supported along with the new SlateJS state:
  *    1. Convert raw JSON to ContentState (internal state from DraftJS)
  *    2. Convert ContentState to raw JS
  *    3. Convert to HTML
  *    4. Finally, convert HTML to SlateJS editor state
  *
  *  https://github.com/dictybase-playground/draftjs-to-slatejs/blob/develop/nodejs/src/convert.js
  *  https://github.com/thompsonsj/slate-serializers
*/
export const parseContent = (content: string): IRTEContent => {
  const parsedJSON = JSON.parse(content);

  if (Object.keys(parsedJSON).includes('blocks')) {
    // This is the old DraftJS editor state
    const htmlState = draftToHTML(parsedJSON);
    const slateState = htmlToSlate(htmlState);

    return {
      value: slateState as Value,
      comments: {},
    };
  }

  if (parsedJSON.value && parsedJSON.comments) {
    return {
      value: normalizeHeadingNodes(parsedJSON.value),
      comments: parsedJSON.comments,
    };
  }

  return {
    value: normalizeHeadingNodes(parsedJSON),
    comments: getInlineComments(parsedJSON),
  };
};

export const parseText = (initialText: string): IRTEContent => {
  try {
    if (initialText === '[]') throw new Error('Invalid JSON');
    return parseContent(initialText);
  } catch {
    // If we can't parse into JSON, just add the text to a paragraph
    // block so something still gets rendered. Useful for database
    // values that are plain strings instead of JSON
    const converter = new Converter({
      simpleLineBreaks: true,
    });
    const html = converter.makeHtml(initialText);
    const children = normalizeHeadingNodes(htmlToSlate(
      html || '',
      {
        ...defaultHtmlToSlateConfig,
        elementTags: {
          ...defaultHtmlToSlateConfig.elementTags,
          a: (el) => ({
            type: 'a',
            newTab: el?.attribs?.target || '_blank',
            url: el?.attribs?.href || '',
          }),
        },
        textTags: {
          ...defaultHtmlToSlateConfig.textTags,
          b: () => ({ bold: true }),
        },
      },
    ) as TElement[]);
    return {
      value: [
        ...children,
        ...(
          children.length === 0
            ? [{
              id: '1',
              type: 'p',
              children: [
                { text: '' },
              ],
            }] : []
        ),
      ],
      comments: {},
    };
  }
};
