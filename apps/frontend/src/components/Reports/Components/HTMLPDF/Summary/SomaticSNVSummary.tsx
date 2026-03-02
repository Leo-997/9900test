import { JSX, useEffect, useState } from 'react';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { VariantType } from '@/types/misc.types';
import { somaticSNVSummaryWidths } from '../../../../../constants/Reports/tableWidths';
import { ICurationComment } from '../../../../../types/Comments/CurationComments.types';
import { ISomaticSnv } from '../../../../../types/SNV.types';
import { formatInterpretationRTE } from '../../../Common/HelperFunctions/formatInterpretation';
import getReportComments from '../../../Common/HelperFunctions/getReportComments';
import sortByGene from '../../../Common/HelperFunctions/sortByGene';
import { formatSomaticSnv } from '../../../Common/TableFormatters/SomaticSNV';
import { Table } from '../Table/Table';

interface ISomaticSNVSummaryProps {
  snvs: ISomaticSnv[];
  showInterpretation?: boolean;
  canManage?: boolean;
}

export function SomaticSNVSummary({
  snvs,
  showInterpretation = true,
  canManage,
}: ISomaticSNVSummaryProps): JSX.Element {
  const { curationCommentThreads, reportableVariants, errorLoadingItems } = useReportData();
  const { reportType, reportMetadata } = useReport();

  const [comments, setComments] = useState<Record<string, ICurationComment[]>>();

  const entityType: VariantType = 'SNV';
  const snvReportables = reportableVariants.filter((r) => (
    r.variantType === entityType
    && r.reportType === reportType
  ));

  useEffect(() => {
    if (snvs.length > 0 && curationCommentThreads?.length && showInterpretation) {
      const commentsMap = getReportComments(
        curationCommentThreads,
        'SNV',
        snvs.map((snv) => snv.variantId),
      );
      setComments(commentsMap);
    }
  }, [curationCommentThreads, showInterpretation, snvs]);

  return (
    <Table
      key={`${JSON.stringify({ snvs, comments, reportMetadata })}`}
      title="Tumour single nucleotide and short indel variants"
      variantType="SNV"
      header={[{
        columns: [
          { width: somaticSNVSummaryWidths[0], content: 'Gene' },
          { width: somaticSNVSummaryWidths[1], content: 'Location' },
          { width: somaticSNVSummaryWidths[2], content: 'Variant' },
          { width: somaticSNVSummaryWidths[3], content: 'Protein Change' },
          { width: somaticSNVSummaryWidths[4], content: 'DNA VAF' },
          { width: somaticSNVSummaryWidths[5], content: 'RNA VAF' },
          { width: somaticSNVSummaryWidths[6], content: 'LOH' },
          { width: somaticSNVSummaryWidths[7], content: 'CLASS' },
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
            formatSomaticSnv(
              snv,
              somaticSNVSummaryWidths,
            )
          ),
          interpretation: showInterpretation && comments && comments[snv.variantId]?.length
            ? formatInterpretationRTE(comments[snv.variantId])
            : undefined,
          entityType,
          entityId: snv.variantId,
        }))}
      noRowsMessage="No clinically reportable single nucleotide and short indel variants identified."
      canManage={canManage}
      showErrorMsg={errorLoadingItems.some((e) => ['snv', 'reportableVariants', 'curationCommentThreads'].includes(e))}
    />
  );
}
