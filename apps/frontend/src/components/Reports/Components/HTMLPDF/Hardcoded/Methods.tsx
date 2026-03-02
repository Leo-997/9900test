import { JSX } from 'react';
import { IGeneList } from '@/types/Reports/GeneLists.types';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { useReport } from '../../../../../contexts/Reports/CurrentReportContext';
import { IMethodsText } from '../../../../../types/Reports/Reports.types';
import { formatMethodsCommon } from '../../../Common/TableFormatters/Methods';
import { Table } from '../Table/Table';

interface IMethodsProps {
  somaticGenes?: IGeneList;
  germlineGenes?: IGeneList;
  reference?: boolean;
  wgs?: boolean;
  rna?: boolean;
  panel?: boolean;
  meth?: boolean;
  somatic?: boolean;
  germline?: boolean;
  vaf?: boolean;
  rnaExpression?: boolean;
  ipass?: boolean;
  htsSingle?: boolean;
  htsCombo?: boolean;
  aSNP?: boolean;
  str?: boolean;
  ihc?: boolean;
  listGenes?: boolean;
  methodsText: IMethodsText;
}

export function Methods({
  methodsText,
  ...props
}: IMethodsProps): JSX.Element {
  const { reportType } = useReport();
  const { errorLoadingItems } = useReportData();

  return (
    <Table
      key={`${JSON.stringify(methodsText)}-${JSON.stringify(props)}`}
      title="Methods"
      header={[{
        columns: [
          { width: '100px', content: 'Method' },
          { width: 'auto', content: 'Information' },
        ],
      }]}
      rows={formatMethodsCommon(
        {
          ...props,
          reportType,
        },
        methodsText,
        ['88px', 'auto'],
      )}
      noRowsMessage="No method data found."
      textSize="small"
      showErrorMsg={errorLoadingItems.some((e) => e === 'somaticGeneList' || e === 'germlineGeneList')}
    />
  );
}
