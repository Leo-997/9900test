import { cnvCNTypeOptions } from '../../../../constants/options';
import { ISomaticCNV } from '../../../../types/CNV.types';
import { IReportTableCell } from '../../../../types/Reports/Table.types';
import getCNVCopyNumber from '../../../../utils/functions/getCNVCopyNumber';
import { toFixed } from '../../../../utils/math/toFixed';

export function formatSomaticCnv(cnv: ISomaticCNV, widths: string[]): IReportTableCell[] {
  const getCNType = (): string => {
    const matchingOption = cnvCNTypeOptions.find((option) => option.value === cnv.cnType);
    if (matchingOption && matchingOption.value === 'NEU') {
      return '';
    }
    return matchingOption?.name ?? '-';
  };

  return [
    { width: widths[0], content: `${cnv.gene} (${cnv.chromosome.replace('chr', '')}${cnv.cytoband})` },
    {
      width: widths[1],
      content: toFixed(getCNVCopyNumber(cnv), 2),
    },
    { width: widths[2], content: getCNType() },
  ];
}
