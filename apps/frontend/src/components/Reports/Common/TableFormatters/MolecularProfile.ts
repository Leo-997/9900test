import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IPurity } from '@/types/Precuration/Purity.types';
import { IReportTableRow } from '../../../../types/Reports/Table.types';
import { toFixed } from '../../../../utils/math/toFixed';

export function formatMolecularProfile(
  analysisSet: IAnalysisSet,
  widths: string[],
  purity?: IPurity,
  isPanel?: boolean,
): IReportTableRow[] {
  const getSNVsExome = (): string => {
    if (isPanel) {
      return 'N/A';
    }

    if (analysisSet.somMissenseSnvs !== null && analysisSet.somMissenseSnvs !== undefined) {
      return toFixed(analysisSet.somMissenseSnvs, 0);
    }

    return '';
  };

  const getPurity = (): string => {
    if (isPanel) {
      return purity?.purity !== null && purity?.purity !== undefined
        ? `${toFixed(purity.purity * 100, 0)}%`
        : '';
    }

    return `${
      purity?.purity !== null && purity?.purity !== undefined
        ? toFixed(purity.purity * 100, 0)
        : '-'
    }% (${
      purity?.minPurity !== null && purity?.minPurity !== undefined
        ? toFixed(purity.minPurity * 100, 0)
        : '-'
    } - ${
      purity?.maxPurity !== null && purity?.maxPurity !== undefined
        ? toFixed(purity.maxPurity * 100, 0)
        : '-'
    }%)`;
  };

  return [{
    columns: [
      {
        width: widths[0],
        content: analysisSet.mutBurdenMb !== null && analysisSet.mutBurdenMb !== undefined
          ? toFixed(analysisSet.mutBurdenMb, 2)
          : '',
      },
      {
        width: widths[1],
        content: getSNVsExome(),
      },
      {
        width: widths[2],
        content: !isPanel
          ? `${
            purity?.ploidy !== null && purity?.ploidy !== undefined ? toFixed(purity.ploidy, 2) : '-'
          } (${
            purity?.minPloidy !== null && purity?.minPloidy !== undefined ? toFixed(purity.minPloidy, 2) : '-'
          } - ${
            purity?.maxPloidy !== null && purity?.maxPloidy !== undefined ? toFixed(purity.maxPloidy, 2) : '-'
          })` : 'N/A',
      },
      {
        width: widths[3],
        content: getPurity(),
      },
    ],
  }];
}
