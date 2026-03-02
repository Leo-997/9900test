import { htsCombinationWidths } from '@/constants/Reports/tableWidths';
import { IDetailedHTSDrugCombination } from '@/types/HTS.types';
import { IReportTableRow } from '@/types/Reports/Table.types';
import { toFixed } from '@/utils/math/toFixed';

export function formatHTSCombination(
  combination: IDetailedHTSDrugCombination,
  widths = htsCombinationWidths,
): IReportTableRow {
  const getFirstNotNull = (first?: number | null, second?: number | null): number | null => (
    first ?? second ?? null
  );

  return {
    columns: [
      { width: widths[0], content: combination.screen1Data?.drugName },
      { width: widths[1], content: combination.screen2Data?.drugName },
      { width: widths[2], content: combination.combinationEffect },
      {
        width: widths[3],
        content: getFirstNotNull(
          combination.effectCssScreen1,
          combination.effectCmaxScreen1,
        ) !== null
          ? toFixed(
            getFirstNotNull(combination.effectCssScreen1, combination.effectCmaxScreen1) as number,
            1,
          )
          : '-',
      },
      {
        width: widths[4],
        content: getFirstNotNull(
          combination.effectCssScreen2,
          combination.effectCmaxScreen2,
        ) !== null
          ? toFixed(
            getFirstNotNull(combination.effectCssScreen2, combination.effectCmaxScreen2) as number,
            1,
          )
          : '-',
      },
      {
        width: widths[5],
        content: getFirstNotNull(combination.effectCssCombo, combination.effectCmaxCombo) !== null
          ? toFixed(
            getFirstNotNull(combination.effectCssCombo, combination.effectCmaxCombo) as number,
            1,
          )
          : '-',
      },
    ],
  };
}
