import { IReportTableCell } from '../../../../types/Reports/Table.types';
import { IReportableGermlineSNV } from '../../../../types/SNV.types';
import { getGermlineZygosity } from '../../../../utils/functions/getGermlineZygosity';
import { getProteinChangeFromHgvs } from '../../../../utils/functions/getProteinChangeFromHgvs';
import { getVariantFromHgvs } from '../../../../utils/functions/getVariantFromHgvs';

export function formatGermlineSNV(
  snv: IReportableGermlineSNV,
  widths: string[],
): IReportTableCell[] {
  return [
    { width: widths[0], content: snv.gene },
    { width: widths[1], content: getVariantFromHgvs(snv.hgvs) },
    { width: widths[2], content: getProteinChangeFromHgvs(snv.hgvs) },
    { width: widths[3], content: snv.pathclass ? snv.pathclass.split(':')[1].trim() : '-' },
    { width: widths[4], content: getGermlineZygosity(snv) },
    { width: widths[5], content: snv.somaticSnvZygosity || 'Not present' },
  ];
}
