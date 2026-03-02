import { ISomaticRna } from '../../../../types/RNAseq.types';
import { ReportType } from '../../../../types/Reports/Reports.types';
import { IReportTableCell } from '../../../../types/Reports/Table.types';
import { toFixed } from '../../../../utils/math/toFixed';

interface IOptions {
  reportables?: boolean;
  fpkm?: boolean;
  tpm?: boolean;
}

function getRnaContent(
  rna: ISomaticRna,
  {
    reportables,
    fpkm,
    tpm,
  }: IOptions,
): string {
  const foldChange = toFixed(parseFloat(rna.foldChange || '0'), 2);
  const zScore = toFixed(parseFloat(rna.meanZScore || '0'), 2);
  const strings: string[] = [];
  if (fpkm) {
    strings.push(`${rna.patientFPKM} FPKM (threshold 3.0)`);
  }
  if (tpm) {
    strings.push(`${rna.patientTPM} TPM (threshold 2.0)`);
  }
  if (reportables) {
    strings.push(
      `${foldChange} (fold-change)`,
      `${zScore} (z-score)`,
    );
  }
  return strings.join('; ');
}

export function formatRna(
  rna: ISomaticRna,
  widths: string[],
  options: IOptions,
): IReportTableCell[] {
  return [
    { width: widths[0], content: rna.gene },
    {
      width: widths[1],
      content: getRnaContent(rna, options),
    },
  ];
}

export function getNoRowsMessage(
  reportType: ReportType,
  hidePanel?: boolean,
  isPanel?: boolean,
  isRnaNoPerformed?: boolean,
): string {
  if (isPanel) {
    return 'N/A for panel.';
  }

  if (isRnaNoPerformed) {
    return 'RNA-Seq not performed.';
  }

  if (reportType === 'MTB_REPORT' || hidePanel) {
    return 'No reportable gene expression.';
  }

  return 'RNA expression analysis is not routinely included in this molecular report.';
}
