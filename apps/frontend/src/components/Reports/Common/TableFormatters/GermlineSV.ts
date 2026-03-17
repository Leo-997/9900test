import { ICurationComment, ReportCurationComment } from '@/types/Comments/CurationComments.types';
import { VariantType } from '@/types/misc.types';
import { IReportTableCell, IReportTableRow } from '@/types/Reports/Table.types';
import { IGermlineSV } from '@/types/SV.types';
import { getCurationSVGenes } from '@/utils/functions/getSVGenes';
import { mapToReadingFrame } from '@/utils/functions/inframeUtils';
import { formatInterpretationRTE } from '../HelperFunctions/formatInterpretation';

export function getPlatformSymbol(sv: IGermlineSV): string {
  if (
    sv.platforms === 'WR'
    || sv.platforms === 'RP'
    || sv.platforms === 'WPR'
  ) {
    return '‡';
  }

  if (sv.platforms === 'R') return '^';

  return '';
}

export function formatGermlineSvFusions(sv: IGermlineSV, widths: string[]): IReportTableCell[] {
  return [
    { width: widths[0], content: `${getCurationSVGenes(sv)} ${getPlatformSymbol(sv)}`.trim() },
    { width: widths[1], content: `${sv.chrBkpt1.replace('chr', '')}:${sv.posBkpt1}` },
    { width: widths[2], content: `${sv.chrBkpt2.replace('chr', '')}:${sv.posBkpt2}` },
    { width: widths[3], content: mapToReadingFrame(sv.inframe) },
  ];
}

export function formatGermlineSvDisruptions(sv: IGermlineSV, widths: string[]): IReportTableCell[] {
  return [
    { width: widths[0], content: `${sv.startGene.gene} ${getPlatformSymbol(sv)}`.trim() },
    { width: widths[1], content: `${sv.chrBkpt1.replace('chr', '')}:${sv.posBkpt1}` },
    { width: widths[2], content: `${sv.chrBkpt2.replace('chr', '')}:${sv.posBkpt2}` },
  ];
}

export function getDisruptionRow(
  sv: IGermlineSV,
  widths: string[],
  showComments: boolean,
  comments: Record<string, ICurationComment[]> = {},
  commentPrefix: ReportCurationComment[] = [],
  additionalGermComments: ReportCurationComment[] = [],
): IReportTableRow {
  const entityType: VariantType = 'GERMLINE_SV';
  return {
    columns: formatGermlineSvDisruptions(sv, widths),
    styleOverrides: !showComments ? { borderBottom: 'none' } : undefined,
    noBottomBorder: !showComments,
    interpretation: showComments && comments && comments[sv.variantId.toString()]?.length
      ? formatInterpretationRTE([
        ...commentPrefix,
        ...comments[sv.variantId.toString()],
        ...additionalGermComments,
      ])
      : undefined,
    entityType,
    // a single SV record can become 2 disruption rows
    // we can't only use the variant id as identifier for the row (cause it's the same SV)
    // and we can't only use gene (cause there might be the same gene from a different SV)
    entityId: `${sv.startGene.gene}-${sv.variantId.toString()}`,
  };
}

export function getDisruptionSVRows(
  svs: IGermlineSV[],
  widths: string[],
  comments: Record<string, ICurationComment[]> = {},
  commentPrefix: ReportCurationComment[] = [],
  additionalGermComments: ReportCurationComment[] = [],
): IReportTableRow[] {
  const rows: IReportTableRow[] = [];
  for (const sv of svs) {
    if (sv.markDisrupted === 'Start' || sv.svType.toLowerCase() === 'disruption' || sv.markDisrupted === 'Yes') {
      rows.push(getDisruptionRow(
        sv,
        widths,
        true,
        comments,
        commentPrefix,
        additionalGermComments,
      ));
    }

    if (sv.markDisrupted === 'End' && sv.svType.toLowerCase() !== 'disruption') {
      rows.push(getDisruptionRow(
        {
          ...sv,
          startGene: sv.endGene,
        },
        widths,
        true,
        comments,
        commentPrefix,
        additionalGermComments,
      ));
    }

    if (sv.markDisrupted === 'Both' && sv.svType.toLowerCase() !== 'disruption') {
      rows.push(
        getDisruptionRow(
          sv,
          widths,
          false,
          {},
          commentPrefix,
          additionalGermComments,
        ),
        getDisruptionRow(
          {
            ...sv,
            startGene: sv.endGene,
          },
          widths,
          true,
          comments,
          commentPrefix,
          additionalGermComments,
        ),
      );
    }
  }
  return rows
    .sort(
      (a, b) => a.columns[0].content?.toString().toLowerCase().localeCompare(
        b.columns[0].content?.toString() || '',
      ) || 0,
    );
}
