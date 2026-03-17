import { IMethylationGeneData } from '../../../../types/Methylation.types';
import { IReportTableCell } from '../../../../types/Reports/Table.types';

export function formatPromoter(
  promoter: IMethylationGeneData,
  widths: string[],
): IReportTableCell[] {
  const { gene, status } = promoter;

  return [
    { width: widths[0], content: 'DNA Methylation' },
    { width: widths[1], content: `${gene} promoter status` },
    { width: widths[2], content: status ? `${status[0].toUpperCase()}${status.slice(1)}` : '-' },
    { width: widths[3], content: 'N/A' },
  ];
}
