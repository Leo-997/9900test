import { JSX } from 'react';
import { formatClassifier, formatPromoter, formatRnaClassifier } from '@/components/Reports/Common/TableFormatters/MolecularClassifiers';
import { methClassifierPrefix } from '@/constants/Reports/reports';
import { molecularClassifiersTableWidths } from '@/constants/Reports/tableWidths';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { IMethylationData, IMethylationGeneData } from '@/types/Methylation.types';
import { IRNAClassifierTable } from '@/types/RNAseq.types';
import { isClassified } from '@/utils/functions/reportable/isClassified';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { Table } from '../Table/Table';

interface IProps {
  methPromoters: IMethylationGeneData[];
  methClassifiers: IMethylationData[];
  rnaClassifiers: IRNAClassifierTable[];
}

export function MolecularClassifiersTable({
  methPromoters,
  methClassifiers,
  rnaClassifiers,
}: IProps): JSX.Element {
  const { reportType } = useReport();
  const { errorLoadingItems } = useReportData();

  const shouldDisplayInterpretation = (classifier: IMethylationData): boolean => {
    if (reportType === 'MTB_REPORT') {
      return false;
    }

    return !!classifier.description && classifier.description !== 'N/A' && (classifier.interpretation === 'MATCH' || isClassified(classifier));
  };

  return (
    <Table
      title="Molecular classifiers"
      header={[{
        columns: [
          { width: molecularClassifiersTableWidths[0], content: 'Assay' },
          { width: molecularClassifiersTableWidths[1], content: 'Classifier Applied' },
          { width: molecularClassifiersTableWidths[2], content: 'Classification Subtype' },
          { width: molecularClassifiersTableWidths[3], content: 'Score' },
        ],
      }]}
      rows={[
        ...(methClassifiers.length && !methClassifiers.some((c) => c.classification === 'Not Applicable')
          ? methClassifiers.map((classifier) => ({
            columns: formatClassifier(classifier, molecularClassifiersTableWidths),
            interpretation: shouldDisplayInterpretation(classifier)
              ? JSON.stringify([
                {
                  type: 'p',
                  children: [
                    { text: methClassifierPrefix },
                    { text: '\n' },
                    { text: '\n' },
                    { text: classifier.description },
                  ],
                },
              ])
              : undefined,
            expandInterpretation: true,
            entityType: 'METHYLATION' as const,
            entityId: classifier.groupId,
          }))
          : []),
        ...(methClassifiers.length && !methClassifiers.some((c) => c.classification === 'Not Applicable')
          ? methPromoters.map((promoter) => (
            {
              columns: formatPromoter(promoter, molecularClassifiersTableWidths),
            }
          ))
          : []),
        ...(rnaClassifiers.length
          ? rnaClassifiers.map((classifier) => (
            {
              columns: formatRnaClassifier(classifier, molecularClassifiersTableWidths),
            }
          ))
          : []
        ),
      ]}
      noRowsMessage="Molecular classification not applicable for this tumour type and/or not performed for this sample."
      legend="*Refer to Methods for further details on Molecular Classifiers."
      showErrorMsg={errorLoadingItems.some((e) => ['classifiers', 'methGenes', 'rnaClassifiers'].includes(e))}
    />
  );
}
