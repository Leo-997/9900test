import { htsWidths } from '@/constants/Reports/tableWidths';
import { IDetailedHTSResult } from '@/types/HTS.types';
import { IReportTableRow } from '@/types/Reports/Table.types';
import { toFixed } from '@/utils/math/toFixed';
import { SxProps } from '@mui/material';

export function formatHTSDrug(drug: IDetailedHTSResult, widths = htsWidths): IReportTableRow {
  const getFirstNotNull = (first?: number | null, second?: number | null): number | null => (
    first ?? second ?? null
  );

  const styleOverrides: SxProps = {
    wordBreak: 'normal',
    overflowWrap: 'normal !important',
  };

  return {
    columns: [
      { width: widths[0], content: drug.drugName, styleOverrides },
      {
        width: widths[1],
        content: drug.reportTargets || drug.targets?.map((t) => t.name).sort().join('; ') || '-',
        styleOverrides,
      },
      { width: widths[2], content: drug.reportingRationale === 'HIT' ? 'Yes' : 'No', styleOverrides },
      {
        width: widths[3],
        content: drug.aucZScore !== null && drug.aucZScore !== undefined
          ? toFixed(drug.aucZScore, 1)
          : '-',
        styleOverrides,
      },
      {
        width: widths[4],
        content: drug.ic50Log2ZScore !== null && drug.ic50Log2ZScore !== undefined
          ? toFixed(drug.ic50Log2ZScore, 1)
          : '-',
        styleOverrides,
      },
      {
        width: widths[5],
        content: drug.ic50Patient !== null && drug.ic50Patient !== undefined
          ? toFixed(drug.ic50Patient / 1000, 1)
          : '-',
        styleOverrides,
      },
      {
        width: widths[6],
        content: drug.lc50Log2ZScore !== null && drug.lc50Log2ZScore !== undefined
          ? toFixed(drug.lc50Log2ZScore, 1)
          : '-',
        styleOverrides,
      },
      {
        width: widths[7],
        content: drug.lc50 !== null && drug.lc50 !== undefined
          ? toFixed(drug.lc50 / 1000, 1)
          : '-',
        styleOverrides,
      },
      {
        width: widths[8],
        content: getFirstNotNull(drug.css, drug.cmax) !== null
          ? toFixed(getFirstNotNull(drug.css, drug.cmax) as number / 1000, 1)
          : '-',
        styleOverrides,
      },
      {
        width: widths[9],
        content: getFirstNotNull(drug.effectCss, drug.effectCmax) !== null
          ? toFixed(getFirstNotNull(drug.effectCss, drug.effectCmax) as number, 1)
          : '-',
        styleOverrides,
      },
      {
        width: widths[10],
        content: drug.changeRatio !== null && drug.changeRatio !== undefined
          ? toFixed(drug.changeRatio, 1)
          : '-',
        styleOverrides,
      },
    ],
  };
}
