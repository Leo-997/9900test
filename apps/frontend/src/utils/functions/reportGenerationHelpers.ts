/* eslint-disable @typescript-eslint/naming-convention */
import { drawDOM, exportPDF, type Group } from '@progress/kendo-drawing';
import { defineFont } from '@progress/kendo-drawing/pdf';
import arialBold from '../../fonts/Arial-Bold.ttf';
import arialBoldItalic from '../../fonts/Arial-BoldItalic.ttf';
import arialItalic from '../../fonts/Arial-Italic.ttf';
import arial from '../../fonts/Arial.ttf';
import helveticaBold from '../../fonts/Helvetica-Bold.ttf';
import helveticaBoldItalic from '../../fonts/Helvetica-BoldItalic.ttf';
import helveticaItalic from '../../fonts/Helvetica-Italic.ttf';
import helvetica from '../../fonts/Helvetica.ttf';
import robotoBold from '../../fonts/Roboto-Bold.ttf';
import robotoBoldItalic from '../../fonts/Roboto-BoldItalic.ttf';
import robotoItalic from '../../fonts/Roboto-Italic.ttf';
import roboto from '../../fonts/Roboto.ttf';
import { IReportContext } from '../../types/Reports/Reports.types';

export function dataURItoBlob(dataURI: string): Blob {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  const ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  const blob = new Blob([ab], { type: mimeString });
  return blob;
}

interface IGenerateReportOptions {
  element: HTMLElement;
  keepTogether?: string;
  forcePageBreak?: string;
  template?: string | ((context: IReportContext) => string);
}

export async function generateReportPDF({
  element,
  keepTogether,
  forcePageBreak,
  template,
}: IGenerateReportOptions): Promise<Blob | null> {
  if (element) {
    defineFont({
      Roboto: roboto,
      'Roboto|bold': robotoBold,
      'Roboto|italic': robotoItalic,
      'Roboto|bold|italic': robotoBoldItalic,
      Helvetica: helvetica,
      'Helvetica|bold': helveticaBold,
      'Helvetica|italic': helveticaItalic,
      'Helvetica|bold|italic': helveticaBoldItalic,
      Arial: arial,
      'Arial|bold': arialBold,
      'Arial|italic': arialItalic,
      'Arial|bold|italic': arialBoldItalic,
    });

    const getGroup = async (): Promise<Group> => (
      drawDOM(element, {
        paperSize: 'A4',
        keepTogether,
        forcePageBreak,
        scale: 0.75,
        template: (props) => {
          if (typeof template === 'string') {
            return template;
          }
          return template ? template(props) : '';
        },
        repeatHeaders: true,
      })
    );

    return getGroup()
      // For some reason, sometime the getGroup step will generate too many pages
      // But if you do it twice, the second time is alway correct 🤷
      // I have narrowed it down to the template being the cause, but not sure why
      .then(() => getGroup())
      .then((group) => exportPDF(group))
      .then((dataUri) => {
        const data = dataURItoBlob(dataUri);
        return data;
      });
  }
  return null;
}
