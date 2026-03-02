import { slateToHtml, slateToHtmlConfig } from '@slate-serializers/html';
import { Value } from '@udecode/plate';
import { UnderlinePlugin } from '@udecode/plate-basic-marks/react';
import { Converter } from 'showdown';

export default function plateToMarkdown(value: Value): string {
  const converter = new Converter();
  const markdown = converter.makeMarkdown(
    slateToHtml(
      value,
      {
        ...slateToHtmlConfig,
        markMap: {
          ...slateToHtmlConfig.markMap,
          [UnderlinePlugin.key]: [],
        },
      },
    ),
  )
    .trim()
    .replaceAll('<!-- -->', '')
    .replaceAll('<s>', '~~')
    .replaceAll('</s>', '~~');
  return markdown;
}
