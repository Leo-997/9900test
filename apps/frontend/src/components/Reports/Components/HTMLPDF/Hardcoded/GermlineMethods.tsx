import { germlineReportMethods } from '@/constants/Reports/reports';
import { germlineNFMethodsWidths } from '../../../../../constants/Reports/tableWidths';
import { IReportTableRow } from '../../../../../types/Reports/Table.types';
import { Table } from '../Table/Table';

import type { JSX } from "react";

export function GermlineMethods(): JSX.Element {
  const getRow = (title: string, content = ''): IReportTableRow => ({
    columns: [
      { width: germlineNFMethodsWidths[0], content: title },
      { width: germlineNFMethodsWidths[1], content },
    ],
  });

  return (
    <Table
      title="Methods"
      header={[{
        columns: [
          { width: germlineNFMethodsWidths[0], content: 'Method' },
          { width: germlineNFMethodsWidths[1], content: 'Information' },
        ],
      }]}
      rows={[
        getRow('Genome Reference', 'GRCh38/hg38'),
        getRow('WGS', germlineReportMethods.wgs),
        getRow('RNA Sequencing', germlineReportMethods.rna),
        getRow('Targeted sequencing', germlineReportMethods.panel),
        getRow('VAF (RNA and DNA)', germlineReportMethods.vaf),
      ]}
      noRowsMessage="No method data found."
      textSize="small"
    />
  );
}
