import { IReportTableCell } from '../../../../types/Reports/Table.types';
import { ISomaticSnv } from '../../../../types/SNV.types';
import { getProteinChangeFromHgvs } from '../../../../utils/functions/getProteinChangeFromHgvs';
import { getVariantFromHgvs } from '../../../../utils/functions/getVariantFromHgvs';
import { toFixed } from '../../../../utils/math/toFixed';

export function formatSomaticSnv(snv: ISomaticSnv, widths: string[]): IReportTableCell[] {
  return [
    { width: widths[0], content: snv.gene },
    { width: widths[1], content: snv.chr },
    { width: widths[2], content: getVariantFromHgvs(snv.hgvs) },
    { width: widths[3], content: getProteinChangeFromHgvs(snv.hgvs) },
    { width: widths[4], content: snv.altad && snv.depth ? toFixed(snv.altad / snv.depth, 2) : '-' },
    {
      width: widths[5],
      content: !(snv.rnaVafNo === undefined || snv.rnaVafNo === null)
        ? toFixed(snv.rnaVafNo, 2)
        : '-',
    },
    {
      width: widths[6],
      content: snv.zygosity !== 'Subclonal' && snv.loh && snv.loh.toLowerCase() !== 'no'
        ? snv.loh.replaceAll('(WT-LOST)', '')
        : '-',
    },
    { width: widths[7], content: snv.pathclass ? snv.pathclass.split(':')[1]?.trim() : '' },
  ];
}
