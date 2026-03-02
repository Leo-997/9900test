import { methClassifierPrefix } from '@/constants/Reports/reports';
import { methylationTableWidths } from '../../../../../constants/Reports/tableWidths';
import { useReport } from '../../../../../contexts/Reports/CurrentReportContext';
import { IMethylationData } from '../../../../../types/Methylation.types';
import { isClassified } from '../../../../../utils/functions/reportable/isClassified';
import { formatClassifier } from '../../../Common/TableFormatters/MethylationClassifiers';
import { Table } from '../Table/Table';

import type { JSX } from "react";

interface IMethylationTableProps {
  classifiers: IMethylationData[];
  canManage?: boolean;
}

export function MethylationTable({
  classifiers,
  canManage,
}: IMethylationTableProps): JSX.Element {
  const { reportType } = useReport();
  const shouldDisplayInterpretation = (classifier: IMethylationData): boolean => {
    if (reportType === 'MTB_REPORT') {
      return false;
    }

    return !!classifier.description && classifier.description !== 'N/A' && (classifier.interpretation === 'MATCH' || isClassified(classifier));
  };

  return (
    <Table
      title="DNA methylation classification"
      variantType="METHYLATION"
      header={[{
        columns: [
          { width: methylationTableWidths[0], content: 'Classifier Version' },
          { width: methylationTableWidths[1], content: 'Tumour Subtype' },
          { width: methylationTableWidths[2], content: 'Score' },
        ],
      }]}
      rows={
        !classifiers || classifiers.some((c) => c.classification === 'Not Applicable')
          ? []
          : classifiers?.map((classifier) => ({
            columns: formatClassifier(
              classifier,
              methylationTableWidths,
            ),
            interpretation: shouldDisplayInterpretation(classifier)
              ? JSON.stringify([{ type: 'p', children: [{ text: methClassifierPrefix }, { text: '\n' }, { text: '\n' }, { text: classifier.description }] }])
              : undefined,
            expandInterpretation: true,
            entityType: 'METHYLATION',
            entityId: classifier.groupId,
          }))
      }
      noRowsMessage={
        classifiers.some((c) => c.classification === 'Not Applicable')
          ? 'Not applicable as non CNS/sarcoma tumour.'
          : 'Methylation not performed.'
      }
      canManage={canManage}
    />
  );
}
