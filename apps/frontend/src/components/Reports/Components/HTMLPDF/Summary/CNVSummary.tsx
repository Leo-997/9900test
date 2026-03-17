import {
  JSX, useEffect, useMemo, useState,
} from 'react';
import { getCommentPrefix, getGermlineAdditionalComments } from '@/components/Reports/Common/HelperFunctions/getGermlineAdditionalComments';
import getReportComments from '@/components/Reports/Common/HelperFunctions/getReportComments';
import { formatGermlineCNV } from '@/components/Reports/Common/TableFormatters/GermlineCNV';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { cnvSummaryWidths } from '@/constants/Reports/tableWidths';
import { CNVVariants, IGermlineCNV, ISomaticCNV } from '@/types/CNV.types';
import { ICurationComment } from '@/types/Comments/CurationComments.types';
import { ICytogeneticsData, ISampleCytoband } from '@/types/Cytogenetics.types';
import { formatInterpretationRTE } from '../../../Common/HelperFunctions/formatInterpretation';
import sortByGene from '../../../Common/HelperFunctions/sortByGene';
import { combineCytobands, getCytogeneticsRows } from '../../../Common/TableFormatters/Cytogenetics';
import { formatSomaticCnv } from '../../../Common/TableFormatters/SomaticCNV';
import { Table } from '../Table/Table';

interface ICNVSummaryProps<T extends CNVVariants> {
  cnvs: T[];
  armCNVs: ICytogeneticsData[];
  cytobands: ISampleCytoband[];
  entityType: 'CNV' | 'GERMLINE_CNV';
  showInterpretation?: boolean;
  canManage?: boolean;
}

export function CNVSummary<T extends CNVVariants>({
  cnvs,
  armCNVs,
  cytobands,
  entityType,
  showInterpretation = true,
  canManage,
}: ICNVSummaryProps<T>): JSX.Element {
  const {
    reportPatient,
    curationCommentThreads,
    reportableVariants,
    reportAnalysisSet,
    errorLoadingItems,
  } = useReportData();
  const {
    reportType,
    reportMetadata,
    prevGermlineReport,
    pendingReport,
    demographics,
  } = useReport();

  const isSomaticCNV = entityType === 'CNV';

  const cnvReportables = reportableVariants.filter((r) => (
    r.variantType === entityType
    && r.reportType === reportType
  ));

  const [
    cnvComments,
    setCNVComments,
  ] = useState<Record<string, ICurationComment[]>>();
  const [
    cytogeneticsComments,
    setCytogeneticsComments,
  ] = useState<Record<string, ICurationComment[]>>();

  const commentPrefix = useMemo(() => (
    isSomaticCNV ? [] : getCommentPrefix(demographics?.category2Consent)
  ), [demographics?.category2Consent, isSomaticCNV]);

  const additionalGermComments = useMemo(() => (
    isSomaticCNV
      ? []
      : getGermlineAdditionalComments(
        reportType,
        prevGermlineReport,
        demographics?.category2Consent,
      )
  ), [demographics?.category2Consent, prevGermlineReport, reportType, isSomaticCNV]);

  useEffect(() => {
    if (cnvs.length > 0 && curationCommentThreads?.length && showInterpretation) {
      const commentsMap = getReportComments(
        curationCommentThreads,
        entityType,
        cnvs.map((cnv) => cnv.geneId.toString()),
        !isSomaticCNV && reportType === 'GERMLINE_REPORT'
          ? (c): boolean => c.type === 'VARIANT_INTERPRETATION'
          : undefined,
        !isSomaticCNV && reportType === 'GERMLINE_REPORT',
      );
      setCNVComments(commentsMap);
    }
  }, [cnvs, curationCommentThreads, entityType, isSomaticCNV, reportType, showInterpretation]);

  useEffect(() => {
    const entity = isSomaticCNV ? 'CYTOGENETICS_ARM' : 'GERMLINE_CYTO_ARM';
    const combinedCytobands = combineCytobands(entity, armCNVs, cytobands);
    if (combinedCytobands.length > 0 && curationCommentThreads?.length && showInterpretation) {
      const commentsMap = getReportComments(
        curationCommentThreads,
        isSomaticCNV ? 'CYTOGENETICS' : 'GERMLINE_CYTO',
        combinedCytobands.map((cnv) => `chr${cnv.chromosome.replace('chr', '')}`),
        !isSomaticCNV && reportType === 'GERMLINE_REPORT'
          ? (c): boolean => c.type === 'VARIANT_INTERPRETATION'
          : undefined,
        !isSomaticCNV && reportType === 'GERMLINE_REPORT',
      );
      setCytogeneticsComments(commentsMap);
    }
  }, [armCNVs, curationCommentThreads, cytobands, isSomaticCNV, reportType, showInterpretation]);

  const getGermlineNoRowsMessage = (): string => {
    if (demographics?.category1Consent === false) {
      return '**Germline results withheld** as consent for the return of genetic cancer risk results was declined at the time the report was issued.';
    }

    if (demographics?.category2Consent === false) {
      return 'No clinically reportable Category 1 copy number variants identified.\n\n**Category 2 results withheld** as consent was declined at the time the report was issued.';
    }

    if (reportType === 'GERMLINE_REPORT') {
      return 'No clinically reportable copy number variants identified.';
    }

    const message = 'No high priority clinically reportable germline copy number variants identified.';
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

  const variantsErrors = entityType === 'CNV'
    ? ['cnv', 'cytogenetics', 'cytobands']
    : ['germlineCNV', 'germlineCytogenetics', 'germlineCytobands'];

  return (
    <Table
      key={`${JSON.stringify({
        cnvs,
        armCNVs,
        cytobands,
        cnvComments,
        cytogeneticsComments,
        reportMetadata,
        additionalGermComments,
        commentPrefix,
      })}`}
      title={`${isSomaticCNV ? 'Tumour' : 'Germline'} copy number variation`}
      variantType={entityType}
      header={[{
        columns: [
          { width: cnvSummaryWidths[0], content: 'Gene (Location) / Chromosome' },
          { width: cnvSummaryWidths[1], content: 'Copy Number' },
          { width: cnvSummaryWidths[2], content: 'Type of aberration' },
        ],
      }]}
      rows={[
        ...cnvs
          .sort((a, b) => {
            const aOrder = cnvReportables.find(
              (cnv) => cnv.variantId === a.geneId.toString(),
            )?.order ?? null;
            const bOrder = cnvReportables.find(
              (cnv) => cnv.variantId === b.geneId.toString(),
            )?.order ?? null;
            if (aOrder === null || bOrder === null) return sortByGene(a, b);
            return aOrder - bOrder;
          })
          .map((cnv) => ({
            entityType,
            entityId: cnv.geneId.toString(),
            columns: (
              isSomaticCNV
                ? formatSomaticCnv(cnv as ISomaticCNV, cnvSummaryWidths)
                : formatGermlineCNV(cnv as IGermlineCNV, cnvSummaryWidths)
            ),
            interpretation: showInterpretation
            && cnvComments
            && cnvComments[cnv.geneId.toString()]?.length
              ? formatInterpretationRTE([
                ...commentPrefix,
                ...cnvComments[cnv.geneId.toString()],
                ...additionalGermComments,
              ])
              : undefined,
          })),
        ...getCytogeneticsRows(
          isSomaticCNV ? 'CYTOGENETICS_ARM' : 'GERMLINE_CYTO_ARM',
          armCNVs,
          cytobands,
          cnvSummaryWidths,
          reportPatient,
          showInterpretation ? cytogeneticsComments : undefined,
          additionalGermComments,
        ),
      ]}
      noRowsMessage={
        isSomaticCNV
          ? 'No clinically reportable copy number variants identified.'
          : getGermlineNoRowsMessage()
      }
      legend={
        isSomaticCNV
          ? 'Copy number variants with no known diagnostic or prognostic relevance are not reported.'
          : undefined
      }
      commentOptions={
        !isSomaticCNV && pendingReport?.id
          ? {
            entityType: 'GERMLINE_CNV',
            disabled: !canManage,
          }
          : undefined
      }
      canManage={canManage}
      showErrorMsg={errorLoadingItems.some((e) => [...variantsErrors, 'reportableVariants', 'curationCommentThreads'].includes(e))}

    />
  );
}
