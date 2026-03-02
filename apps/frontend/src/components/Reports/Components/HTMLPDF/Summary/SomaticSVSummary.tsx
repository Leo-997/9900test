import { Box } from '@mui/material';
import { JSX, useEffect, useState } from 'react';
import { sortSvByGene } from '@/components/Reports/Common/HelperFunctions/sortByGene';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { VariantType } from '@/types/misc.types';
import { disruptionSVsWidths, tumourStructuralVariantsWidths } from '../../../../../constants/Reports/tableWidths';
import { ICurationComment } from '../../../../../types/Comments/CurationComments.types';
import { ISomaticSV } from '../../../../../types/SV.types';
import { formatInterpretationRTE } from '../../../Common/HelperFunctions/formatInterpretation';
import getReportComments from '../../../Common/HelperFunctions/getReportComments';
import { getDisruptionSVs, getFusionSVs } from '../../../Common/HelperFunctions/svTypeFilters';
import { formatSomaticSvFusions, getDisruptionSVRows } from '../../../Common/TableFormatters/SomaticSV';
import { Table } from '../Table/Table';

interface ISomaticSVSummaryProps {
  svs: ISomaticSV[];
  showInterpretation?: boolean;
  canManage?: boolean;
}

export function SomaticSVSummary({
  svs,
  showInterpretation = true,
  canManage,
}: ISomaticSVSummaryProps): JSX.Element {
  const { curationCommentThreads, reportableVariants, errorLoadingItems } = useReportData();
  const { reportType, reportMetadata } = useReport();

  const [comments, setComments] = useState<Record<string, ICurationComment[]>>();

  const entityType: VariantType = 'SV';
  const svReportables = reportableVariants.filter((r) => (
    r.variantType === entityType
    && r.reportType === reportType
  ));

  useEffect(() => {
    if (svs.length > 0 && curationCommentThreads?.length && showInterpretation) {
      const commentsMap = getReportComments(
        curationCommentThreads,
        'SV',
        svs.map((sv) => sv.variantId.toString()),
      );
      setComments(commentsMap);
    }
  }, [curationCommentThreads, showInterpretation, svs]);

  return (
    <>
      <Table
        key={`${JSON.stringify({ fusions: getFusionSVs(svs), comments, reportMetadata })}`}
        title="Tumour structural variants"
        variantType="FUSION"
        header={[{
          columns: [
            { width: tumourStructuralVariantsWidths[0], content: 'Fusion' },
            { width: tumourStructuralVariantsWidths[1], content: 'Breakpoint 1' },
            { width: tumourStructuralVariantsWidths[2], content: 'Breakpoint 2' },
            { width: tumourStructuralVariantsWidths[3], content: 'Reading Frame' },
          ],
        }]}
        rows={getFusionSVs(svs)
          .sort((a, b) => {
            const aOrder = svReportables
              .find((sv) => sv.variantId === a.variantId.toString())?.order ?? null;
            const bOrder = svReportables
              .find((sv) => sv.variantId === b.variantId.toString())?.order ?? null;
            if (aOrder === null || bOrder === null) return sortSvByGene(a, b);
            return aOrder - bOrder;
          })
          .map((sv) => ({
            columns: (
              formatSomaticSvFusions(
                sv,
                tumourStructuralVariantsWidths,
              )
            ),
            interpretation: showInterpretation
              && comments
              && comments[sv.variantId.toString()]?.length
              ? formatInterpretationRTE(comments[sv.variantId.toString()])
              : undefined,
            entityType: 'FUSION',
            entityId: sv.variantId.toString(),
          }))}
        noRowsMessage="No clinically reportable fusions identified."
        canManage={canManage}
      />
      <Box padding="5px" />
      <Table
        key={`${JSON.stringify({ disruptions: getDisruptionSVs(svs), comments })}`}
        title=""
        variantType="DISRUPTION"
        header={[
          {
            columns: [
              { width: disruptionSVsWidths[0], content: 'Disruption' },
              { width: disruptionSVsWidths[1], content: 'Breakpoint 1' },
              { width: disruptionSVsWidths[2], content: 'Breakpoint 2' },
            ],
          },
        ]}
        rows={getDisruptionSVRows(
          getDisruptionSVs(svs),
          [
            disruptionSVsWidths[0],
            disruptionSVsWidths[1],
            disruptionSVsWidths[2],
          ],
          showInterpretation ? comments : undefined,
        ).map((row) => ({
          ...row,
          entityType: 'DISRUPTION',
        }))}
        noRowsMessage="No clinically reportable disruptions identified."
        legend={'‡ This structural variant has been orthogonally validated by DNA and RNA sequencing.\n^ This structural variant was observed in RNA sequencing only.'}
        canManage={canManage}
        showErrorMsg={errorLoadingItems.some((e) => ['sv', 'reportableVariants', 'curationCommentThreads'].includes(e))}
      />
    </>
  );
}
