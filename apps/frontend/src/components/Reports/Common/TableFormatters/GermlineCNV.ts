import { cnvCNTypeOptions } from '@/constants/options';
import { IGermlineCNV } from '../../../../types/CNV.types';
import { IReportTableCell } from '../../../../types/Reports/Table.types';
import { toFixed } from '../../../../utils/math/toFixed';

export function formatGermlineCNV(cnv: IGermlineCNV, widths: string[]): IReportTableCell[] {
  return [
    { width: widths[0], content: `${cnv.gene} (${cnv.chromosome.replace('chr', '')}${cnv.cytoband})` },
    {
      width: widths[1],
      content: toFixed(cnv.averageCN, 2),
    },
    { width: widths[2], content: cnvCNTypeOptions.find((option) => option.value === cnv.cnType)?.name || '-' },
  ];
}
