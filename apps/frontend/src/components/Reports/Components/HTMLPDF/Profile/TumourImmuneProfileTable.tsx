import { formatTumourImmuneProfile } from '@/components/Reports/Common/TableFormatters/TumourImmuneProfile';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { tumourImmuneProfileTableWidths } from '../../../../../constants/Reports/tableWidths';
import { IImmunoprofile } from '../../../../../types/Precuration/QCMetrics.types';
import { Table } from '../Table/Table';

import type { JSX } from "react";

interface IProps {
  immunoprofile?: IImmunoprofile;
  isRnaPerformed?: boolean;
}

export function TumourImmuneProfileTable({
  immunoprofile,
  isRnaPerformed,
}: IProps): JSX.Element {
  const { reportAnalysisSet } = useReportData();

  const getNoRowsMsg = (): string => {
    if (!isRnaPerformed) return 'Not performed.';
    if (reportAnalysisSet.zero2Category === 'HM') return 'Not applicable.';
    return 'No tumour immune profile data found.';
  };

  return (
    <Table
      title="Tumour immune profile"
      header={[{
        columns: [
          {
            width: tumourImmuneProfileTableWidths[0],
            content: 'IPASS Status; score (percentile)',
          },
          { width: tumourImmuneProfileTableWidths[1], content: 'M1M2 score (percentile)' },
          { width: tumourImmuneProfileTableWidths[2], content: 'CD8+ score (percentile)' },
        ],
      }]}
      rows={immunoprofile ? (
        formatTumourImmuneProfile(
          tumourImmuneProfileTableWidths,
          immunoprofile,
        )
      ) : []}
      noRowsMessage={getNoRowsMsg()}
    />
  );
}
