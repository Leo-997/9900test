import { JSX } from 'react';
import { formatHTSCombination } from '@/components/Reports/Common/TableFormatters/HTSCombinations';
import { htsCombinationWidths } from '@/constants/Reports/tableWidths';
import { IDetailedHTSDrugCombination } from '@/types/HTS.types';
import { VariantType } from '@/types/misc.types';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { Table } from '../Table/Table';

interface IProps {
  combinations: IDetailedHTSDrugCombination[];
  canManage?: boolean;
}

export function HTSCombinationSummary({
  combinations,
  canManage = false,
}: IProps): JSX.Element {
  const { errorLoadingItems } = useReportData();

  const entityType: VariantType = 'HTS_COMBINATION';

  return (
    <Table
      title="Combination drug screen"
      variantType="HTS_COMBINATION"
      header={[
        {
          columns: [
            {
              width: htsCombinationWidths[0],
              content: 'DRUG 1',
              rowSpan: 2,
              colSpan: 1,
            },
            {
              width: htsCombinationWidths[1],
              content: 'DRUG 2',
              rowSpan: 2,
              colSpan: 1,
            },
            {
              width: htsCombinationWidths[2],
              content: 'Combination Effect',
              rowSpan: 2,
              colSpan: 1,
            },
            {
              width: htsCombinationWidths[3],
              content: '% effect at dose equivalent to Cmax/Css‡#',
              colSpan: 3,
              styleOverrides: {
                textAlign: 'center !important',
              },
            },
          ],
        },
        {
          columns: [
            { width: htsCombinationWidths[3], content: 'DRUG 1' },
            { width: htsCombinationWidths[4], content: 'DRUG 2' },
            { width: htsCombinationWidths[5], content: 'Combination' },
          ],
        },
      ]}
      rows={combinations
        .map((d) => ({
          ...formatHTSCombination(d),
          entityType,
          entityId: d.id,
        }))}
      noRowsMessage=""
      legend={'‡ compared with control at end of treatment\n# Approximate percentages only\nSN38, active metabolite of IRN; MITC, active metabolite of TMZ'}
      canManage={canManage}
      showErrorMsg={errorLoadingItems.includes('htsCombination')}
    />
  );
}
