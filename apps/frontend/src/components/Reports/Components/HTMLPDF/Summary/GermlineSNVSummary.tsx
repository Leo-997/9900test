import {
  JSX, useEffect, useMemo, useState,
} from 'react';
import { getCommentPrefix, getGermlineAdditionalComments } from '@/components/Reports/Common/HelperFunctions/getGermlineAdditionalComments';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { VariantType } from '@/types/misc.types';
import { IReportTableCommentOptions } from '@/types/Reports/Table.types';
import { germlineSNVSummaryWidths } from '../../../../../constants/Reports/tableWidths';
import { useReport } from '../../../../../contexts/Reports/CurrentReportContext';
import { ICurationComment } from '../../../../../types/Comments/CurationComments.types';
import { IReportableGermlineSNV } from '../../../../../types/SNV.types';
import { formatInterpretationRTE } from '../../../Common/HelperFunctions/formatInterpretation';
import getReportComments from '../../../Common/HelperFunctions/getReportComments';
import sortByGene from '../../../Common/HelperFunctions/sortByGene';
import { formatGermlineSNV } from '../../../Common/TableFormatters/GermlineSNV';
import { Table } from '../Table/Table';

interface IGermlineSNVSummaryProps {
  snvs: IReportableGermlineSNV[];
  showInterpretation?: boolean;
  legend?: string;
  commentOptions?: IReportTableCommentOptions;
  canManage?: boolean;
}

export function GermlineSNVSummary({
  snvs,
  showInterpretation = true,
  legend,
  commentOptions,
  canManage,
}: IGermlineSNVSummaryProps): JSX.Element {
  const {
    reportAnalysisSet, curationCommentThreads, reportableVariants, errorLoadingItems,
  } = useReportData();
  const {
    reportType, prevGermlineReport, reportMetadata, demographics,
  } = useReport();

  const entityType: VariantType = 'GERMLINE_SNV';
  const snvReportables = reportableVariants.filter((r) => (
    r.variantType === entityType
    && r.reportType === reportType
  ));

  const [comments, setComments] = useState<Record<string, ICurationComment[]>>();

  const commentPrefix = useMemo(() => (
    getCommentPrefix(
      demographics?.category2Consent,
    )
  ), [demographics?.category2Consent]);

  const additionalGermComments = useMemo(() => (
    getGermlineAdditionalComments(
      reportType,
      prevGermlineReport,
      demographics?.category2Consent,
    )
  ), [demographics?.category2Consent, prevGermlineReport, reportType]);

  useEffect(() => {
    if (snvs.length > 0 && curationCommentThreads?.length && showInterpretation) {
      const commentsMap = getReportComments(
        curationCommentThreads,
        'GERMLINE_SNV',
        snvs.map((snv) => snv.variantId),
        reportType === 'GERMLINE_REPORT'
          ? (c): boolean => c.type === 'VARIANT_INTERPRETATION'
          : undefined,
        reportType === 'GERMLINE_REPORT',
      );
      setComments(commentsMap);
    }
  }, [curationCommentThreads, reportType, showInterpretation, snvs]);

  const getNoRowsMessage = (): string => {
    if (demographics?.category1Consent === false) {
      return '**Germline results withheld** as consent for the return of genetic cancer risk results was declined at the time the report was issued.';
    }

    if (demographics?.category2Consent === false) {
      return 'No clinically reportable Category 1 single nucleotide and short indel variants identified.\n\n**Category 2 results withheld** as consent was declined at the time the report was issued.';
    }

    if (reportType === 'GERMLINE_REPORT') {
      return 'No clinically reportable single nucleotide and short indel variants identified.';
    }

    const message = 'No high priority clinically reportable single nucleotide and short indel variants identified.';
    const highPriority = '\nNOTE: variants that may be associated with the development of this cancer and/or have implications for the treatment of this cancer are considered high priority.';
    const cnsLine = '\n\nThere are no clinically reportable variants in genes NF1, PTCH1, SMARCB1, SMARCA4, SUFU, TP53 and the CMMRD genes (MLH1, MSH2, MSH6 and PMS2) identified.';
    const referToMethodsLine = '\n\nA separate FINAL comprehensive germline report will be issued based on the expanded germline analysis (please refer to Methods section of this report for further details).';
    const previousReportMessage = '\n**NOTE**: Please refer to the previously-issued ZERO2 Germline Findings Report for this patient.';

    if (prevGermlineReport) {
      return `${message}${previousReportMessage}`;
    }

    if (reportAnalysisSet.genePanel === 'CNS') {
      return `${message}${highPriority}${cnsLine}${referToMethodsLine}`;
    }
    return `${message}${highPriority}${referToMethodsLine}`;
  };

  return (
    <Table
      key={`${JSON.stringify({
        snvs,
        comments,
        reportMetadata,
        commentPrefix,
        additionalGermComments,
      })}`}
      title="Germline single nucleotide and short indel variants"
      variantType="GERMLINE_SNV"
      header={[{
        columns: [
          { width: germlineSNVSummaryWidths[0], content: 'Gene' },
          { width: germlineSNVSummaryWidths[1], content: 'Variant' },
          { width: germlineSNVSummaryWidths[2], content: 'Protein Change' },
          { width: germlineSNVSummaryWidths[3], content: 'Class' },
          { width: germlineSNVSummaryWidths[4], content: 'Germline Zygosity' },
          {
            width: germlineSNVSummaryWidths[5],
            content: (
              <span style={{ whiteSpace: 'nowrap' }}>Tumour Zygosity</span>
            ),
          },
        ],
      }]}
      rows={snvs
        .sort((a, b) => {
          const aOrder = snvReportables.find((snv) => snv.variantId === a.variantId)?.order ?? null;
          const bOrder = snvReportables.find((snv) => snv.variantId === b.variantId)?.order ?? null;
          if (aOrder === null || bOrder === null) return sortByGene(a, b);
          return aOrder - bOrder;
        })
        .map((snv) => ({
          columns: (
            formatGermlineSNV(
              snv,
              germlineSNVSummaryWidths,
            )
          ),
          interpretation: showInterpretation && comments && comments[snv.variantId]?.length
            ? formatInterpretationRTE([
              ...commentPrefix,
              ...comments[snv.variantId],
              ...additionalGermComments,
            ])
            : undefined,
          entityType,
          entityId: snv.variantId,
        }))}
      noRowsMessage={getNoRowsMessage()}
      legend={legend}
      commentOptions={commentOptions}
      canManage={canManage}
      showErrorMsg={errorLoadingItems.some((e) => ['germlineSNV', 'reportableVariants', 'curationCommentThreads'].includes(e))}
    />
  );
}
