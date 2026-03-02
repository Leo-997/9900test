import { Box } from '@mui/material';
import {
  JSX, useEffect, useMemo, useState,
} from 'react';
import { getCommentPrefix, getGermlineAdditionalComments } from '@/components/Reports/Common/HelperFunctions/getGermlineAdditionalComments';
import { sortSvByGene } from '@/components/Reports/Common/HelperFunctions/sortByGene';
import { formatGermlineSvFusions, getDisruptionSVRows } from '@/components/Reports/Common/TableFormatters/GermlineSV';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { VariantType } from '@/types/misc.types';
import { disruptionSVsWidths, tumourStructuralVariantsWidths } from '../../../../../constants/Reports/tableWidths';
import { ICurationComment } from '../../../../../types/Comments/CurationComments.types';
import { IGermlineSV } from '../../../../../types/SV.types';
import { formatInterpretationRTE } from '../../../Common/HelperFunctions/formatInterpretation';
import getReportComments from '../../../Common/HelperFunctions/getReportComments';
import { getDisruptionSVs, getFusionSVs } from '../../../Common/HelperFunctions/svTypeFilters';
import { Table } from '../Table/Table';

interface IGermlineSVSummaryProps {
  svs: IGermlineSV[];
  showInterpretation?: boolean;
  canManage?: boolean;
}

export function GermlineSVSummary({
  svs,
  showInterpretation = true,
  canManage,
}: IGermlineSVSummaryProps): JSX.Element {
  const { curationCommentThreads, reportableVariants, errorLoadingItems } = useReportData();
  const {
    reportType, reportMetadata, prevGermlineReport, demographics,
  } = useReport();

  const entityType: VariantType = 'GERMLINE_SV';
  const svReportables = reportableVariants.filter((r) => (
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
    if (svs.length > 0 && curationCommentThreads?.length && showInterpretation) {
      const commentsMap = getReportComments(
        curationCommentThreads,
        'GERMLINE_SV',
        svs.map((sv) => sv.variantId.toString()),
        reportType === 'GERMLINE_REPORT'
          ? (c): boolean => c.type === 'VARIANT_INTERPRETATION'
          : undefined,
        reportType === 'GERMLINE_REPORT',
      );
      setComments(commentsMap);
    }
  }, [curationCommentThreads, reportType, showInterpretation, svs]);

  return (
    <>
      {getFusionSVs(svs).length > 0 && (
      <>
        <Table
          key={`${JSON.stringify({
            fusions: getFusionSVs(svs),
            comments,
            reportMetadata,
            commentPrefix,
            additionalGermComments,
          })}`}
          title="Germline structural variants"
          variantType="GERMLINE_FUSION"
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
                formatGermlineSvFusions(
                  sv,
                  tumourStructuralVariantsWidths,
                )
              ),
              interpretation: showInterpretation
              && comments
              && comments[sv.variantId.toString()]?.length
                ? formatInterpretationRTE([
                  ...commentPrefix,
                  ...comments[sv.variantId.toString()],
                  ...additionalGermComments,
                ])
                : undefined,
              entityType,
              entityId: sv.variantId.toString(),
            }))}
          noRowsMessage="No clinically reportable fusions identified."
          legend={getDisruptionSVs(svs).length ? '' : '‡ This structural variant has been orthogonally validated by DNA and RNA sequencing.\n^ This structural variant was observed in RNA sequencing only.'}
          canManage={canManage}
        />
        <Box padding="5px" />
      </>
      )}
      {getDisruptionSVs(svs).length > 0 && (
        <Table
          key={`${JSON.stringify({
            disruptions: getDisruptionSVs(svs), comments, commentPrefix, additionalGermComments,
          })}`}
          title={getFusionSVs(svs).length ? '' : 'Germline structural variants'}
          variantType="GERMLINE_DISRUPTION"
          header={[{
            columns: [
              { width: disruptionSVsWidths[0], content: 'Disruption' },
              { width: disruptionSVsWidths[1], content: 'Breakpoint 1' },
              { width: disruptionSVsWidths[2], content: 'Breakpoint 2' },
            ],
          }]}
          rows={getDisruptionSVRows(
            getDisruptionSVs(svs),
            [
              disruptionSVsWidths[0],
              disruptionSVsWidths[1],
              disruptionSVsWidths[2],
            ],
            showInterpretation ? comments : undefined,
            commentPrefix,
            additionalGermComments,
          )}
          noRowsMessage="No clinically reportable disruptions identified."
          legend={'‡ This structural variant has been orthogonally validated by DNA and RNA sequencing.\n^ This structural variant was observed in RNA sequencing only.'}
          canManage={canManage}
          showErrorMsg={errorLoadingItems.some((e) => ['germlineSV', 'reportableVariants', 'curationCommentThreads'].includes(e))}

        />
      )}
    </>
  );
}
