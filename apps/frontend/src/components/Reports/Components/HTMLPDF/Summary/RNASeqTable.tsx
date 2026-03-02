import { JSX, useEffect, useState } from 'react';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { VariantType } from '@/types/misc.types';
import { rnaSeqTableWidths } from '../../../../../constants/Reports/tableWidths';
import { useReport } from '../../../../../contexts/Reports/CurrentReportContext';
import { ICurationComment } from '../../../../../types/Comments/CurationComments.types';
import { IRNASeqReportData } from '../../../../../types/RNAseq.types';
import { isClassified } from '../../../../../utils/functions/reportable/isClassified';
import { formatInterpretationRTE } from '../../../Common/HelperFunctions/formatInterpretation';
import getReportComments from '../../../Common/HelperFunctions/getReportComments';
import sortByGene from '../../../Common/HelperFunctions/sortByGene';
import { formatRna, getNoRowsMessage } from '../../../Common/TableFormatters/RNASeq';
import { Table } from '../Table/Table';

interface IProps {
  rna: IRNASeqReportData[];
  showReportables?: boolean;
  showEzhip?: boolean;
  hideGenePanel?: boolean;
  isPanel?: boolean;
  showInterpretation?: boolean;
  isRnaNotPerformed?: boolean;
  canManage?: boolean;
}

export function RNASeqTable({
  rna,
  showReportables,
  showEzhip,
  hideGenePanel,
  isPanel,
  showInterpretation = true,
  isRnaNotPerformed,
  canManage,
}: IProps): JSX.Element {
  const { reportType, reportMetadata } = useReport();
  const {
    curationCommentThreads,
    reportableVariants,
    errorLoadingItems,
  } = useReportData();

  const [comments, setComments] = useState<Record<string, ICurationComment[]>>();

  const entityType: VariantType = 'RNA_SEQ';
  const rnaReportables = reportableVariants.filter((r) => (
    r.variantType === entityType
    && r.reportType === reportType
  ));

  const getDisplayReportable = (result: IRNASeqReportData): boolean => (
    Boolean(
      (
        showReportables
          && result.type.includes('reportable')
      ) || (
        isClassified(result)
      ) || (
        showEzhip
        && result.type.includes('ezhip')
        && parseFloat(result.patientTPM) > 2.0
      ),
    )
  );

  useEffect(() => {
    if (
      rna.filter((r) => r.type.includes('reportable') || isClassified(r)).length > 0
      && curationCommentThreads?.length
      && showInterpretation
    ) {
      const commentsMap = getReportComments(
        curationCommentThreads,
        'RNA_SEQ',
        rna
          .filter((r) => r.type.includes('reportable') || isClassified(r))
          .map((r) => r.geneId.toString()),
      );
      setComments(commentsMap);
    }
  }, [curationCommentThreads, rna, showInterpretation]);

  return (
    <Table
      key={`${JSON.stringify({ rna, comments, reportMetadata })}`}
      title="RNA expression"
      variantType="RNA_SEQ"
      header={[{
        columns: [
          {
            width: rnaSeqTableWidths[0],
            content: 'Gene',
          },
          { width: rnaSeqTableWidths[1], content: 'RNA Expression' },
        ],
      }]}
      rows={
        rna
          .sort((a, b) => {
            if (a.type.includes('reportable') && b.type.includes('reportable')) {
              const aOrder = rnaReportables
                .find((r) => r.variantId === a.geneId.toString())?.order ?? null;
              const bOrder = rnaReportables
                .find((r) => r.variantId === b.geneId.toString())?.order ?? null;
              if (aOrder === null || bOrder === null) return sortByGene(a, b);
              return aOrder - bOrder;
            }
            if (a.type.includes('reportable')) {
              return -1;
            }
            if (b.type.includes('reportable')) {
              return 1;
            }
            return 1;
          })
          .filter((r) => (showReportables && r.type.includes('reportable'))
            || (showEzhip && r.type.includes('ezhip')))
          .map((r) => ({
            columns:
              formatRna(
                r,
                [rnaSeqTableWidths[0], rnaSeqTableWidths[1]],
                {
                  reportables: getDisplayReportable(r),
                  tpm: showEzhip && r.type.includes('ezhip'),
                },
              ),
            interpretation: showInterpretation
              && r.reportable
              && comments
              && comments[r.geneId.toString()]?.length
              ? formatInterpretationRTE(comments[r.geneId.toString()])
              : undefined,
            entityType: r.type.includes('reportable') ? entityType : undefined,
            entityId: r.type.includes('reportable') ? r.geneId.toString() : undefined,
          }))
      }
      noRowsMessage={getNoRowsMessage(reportType, hideGenePanel, isPanel, isRnaNotPerformed)}
      canManage={canManage}
      showErrorMsg={errorLoadingItems.some((e) => ['reportableRNA', 'ezhipReportableRNA', 'reportableVariants', 'curationCommentThreads'].includes(e))}
    />
  );
}
