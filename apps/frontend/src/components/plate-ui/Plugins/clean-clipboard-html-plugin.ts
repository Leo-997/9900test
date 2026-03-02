import { createPlatePlugin, PlateEditor } from '@udecode/plate/react';

type EditorWithInsert = PlateEditor & { insertData: (data: DataTransfer) => void };

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CleanClipboardHtmlPlugin = createPlatePlugin({
  key: 'cleanClipboardHtml',
  extendEditor: ({ editor }) => {
    const e = editor as EditorWithInsert; // typecast editor so it knows it has insertData property
    const { insertData } = e;

    e.insertData = (data: DataTransfer): void => {
      const dataTypes = Array.from(data.types);
      const dataTransfer = new DataTransfer();

      for (const type of dataTypes) {
        const content = data.getData(type);
        if (type === 'text/html') {
          const cleaned = content
            // Drop "Apple interchange marker" break line added by Google Doc
            .replace(/<br class="Apple-interchange-newline"\s*>/gi, '')
            // Turn a <br> between paragraphs into a single empty paragraph
            // as <br> is displayed as two empty lines inside the editor instead of one
            .replace(
              /<\/p>\s*<br\s*\/?>\s*<p/gi,
              '</p><p><span></span></p><p',
            );
          dataTransfer.setData(type, cleaned);
        } else {
          dataTransfer.setData(type, content);
        }
      }
      insertData(dataTransfer);
    };

    return e;
  },
});
