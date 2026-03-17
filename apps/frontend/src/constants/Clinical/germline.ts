import { GermlineSectionType, ISlide } from '@/types/MTB/Slide.types';

export const getGermlineSectionInitialContent = (
  type: GermlineSectionType,
  slide?: ISlide,
): string => {
  const emptyInitialText = JSON.stringify([{
    id: '1',
    type: 'p',
    children: [
      {
        text: '',
      },
    ],
  }]);

  if (slide && slide.alterations) {
    const hgvs = slide.alterations.map((a) => a.additionalData?.hgvs).join(', ');
    const pathogenicity = slide.alterations.map((a) => a.additionalData?.pathogenicity).join(', ');
    const zygosity = slide.alterations.map((a) => a.additionalData?.zygosity).join(', ');
    const germlineAlterations = slide.alterations.filter((a) => a.mutationType.includes('GERMLINE')).map((a) => a.gene);

    switch (type) {
      case 'Molecular findings':
        return JSON.stringify(
          [
            {
              id: 0,
              type: 'p',
              children: [
                {
                  text: `Germline: ${hgvs}`,
                },
              ],
            },
            {
              id: 1,
              type: 'p',
              children: [
                {
                  text: `Zygosity: ${zygosity}`,
                },
              ],
              indent: 1,
              listStyleType: 'disc',
            },
            {
              id: 2,
              type: 'p',
              children: [
                {
                  text: `Variant classification: ${pathogenicity}`,
                },
              ],
              indent: 1,
              listStyleType: 'disc',
              listStart: 2,
            },
            {
              id: 3,
              type: 'p',
              children: [
                {
                  text: 'Somatic: ',
                },
              ],
            },
            {
              id: 4,
              type: 'p',
              children: [
                {
                  text: '',
                },
              ],
              indent: 1,
              listStyleType: 'disc',
            },
          ],
        );
      case 'Interpretation':
        return JSON.stringify(
          [
            {
              id: 0,
              type: 'p',
              children: [
                {
                  text: 'Tumorigenesis/The malignancy is driven by the germline ',
                },
                {
                  text: `${germlineAlterations.join(', ')}`,
                  italic: true,
                },
                {
                  text: ` variant${germlineAlterations.length > 1 ? 's' : ''}.`,
                },
              ],
              indent: 1,
              listStyleType: 'disc',
            },
            {
              id: 1,
              type: 'p',
              indent: 1,
              listStyleType: 'disc',
              children: [
                {
                  text: `The risk of additional tumours/cancers is increased/unlikely to be increased in carriers of ${germlineAlterations.length > 1 ? 'these germline variants' : 'this germline variant'}.`,
                },
              ],
              listStart: 2,
            },
          ],
        );
      default:
        return emptyInitialText;
    }
  }

  return emptyInitialText;
};
