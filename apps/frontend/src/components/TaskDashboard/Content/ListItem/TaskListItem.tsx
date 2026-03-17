import {
  Box,
  IconButton,
  TableCell as MuiTableCell,
  styled,
  TableRow,
  Tooltip,
} from '@mui/material';
import dayjs from 'dayjs';
import {
  ClockAlertIcon, EllipsisVerticalIcon,
} from 'lucide-react';
import {
  JSX,
  useEffect, useMemo, useRef, useState,
} from 'react';
import Markdown from 'react-markdown';
import { Link } from 'react-router-dom';
import CustomChip from '@/components/Common/Chip';
import CustomTypography from '@/components/Common/Typography';
import { RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { reportOptions } from '@/constants/Reports/reports';
import { highRiskCohorts } from '@/constants/sample';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { corePalette } from '@/themes/colours';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { ICurationComment } from '@/types/Comments/CurationComments.types';
import { IReportOption } from '@/types/misc.types';
import { IReport, ITaskDashboardReport, ReportType } from '@/types/Reports/Reports.types';
import { Cohorts } from '@/types/Samples/Sample.types';
import {
  CaseStatus,
  ITaskDashboardFilters,
} from '@/types/TaskDashboard/TaskDashboard.types';
import { getReport } from '@/utils/components/taskdashboard/getReport';
import { mapReportStatus } from '@/utils/components/taskdashboard/mapReportStatus';
import { parseText } from '@/utils/editor/parser';
import plateToMarkdown from '@/utils/editor/plateToMarkdown';
import getPrimaryBiosample from '@/utils/functions/biosamples/getPrimaryBiosample';
import mapEvent from '@/utils/functions/mapEvent';
import CurationCell from './Cells/CurationCell';
import { MTBSlidesCell } from './Cells/MTBSlidesCell';
import ReportCell from './Cells/ReportCell';
import TaskStageCell from './Cells/TaskStageCell';
import { TaskListItemMenu } from './TaskListItemMenu';

interface IStyleProps {
  type?: 'main' | 'related' | 'readOnly';
  expedited?: boolean;
}

export const TableCell = styled(MuiTableCell)<IStyleProps>(({ type, theme }) => ({
  backgroundColor: type !== 'related' ? theme.colours.core.white : theme.colours.core.grey30,
  border: 'none',
  padding: '16px 16px 16px 0px',
}));

const TableCellLeft = styled(TableCell)(({ expedited }) => ({
  position: 'sticky',
  left: 0,
  paddingLeft: expedited ? '14px' : '16px', // style for aligning ClockIcon with PatiendID
  // Styles related to the "expedited" orange left border
  zIndex: 2,
  overflow: 'visible', // important to allow pseudo-element outside
  '&::before': expedited
    ? {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '4px',
      height: '100%',
      backgroundColor: corePalette.orange100,
    }
    : {},
}));

const StyledWrapper = styled('div')({
  // this style actually applies to RichTextEditor
  '.editor-added-class': {
    maxWidth: '350px',
  },
});

const TableCellRight = styled(TableCell)({
  paddingLeft: '20px',
  position: 'sticky',
  zIndex: 1,
  right: '0px',
});

const TruncatingTypography = styled(CustomTypography)({
  display: '-webkit-box',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  WebkitLineClamp: 2,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  '& .editor-added-class': {
    display: '-webkit-box',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    WebkitLineClamp: 2,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
});

interface IProps {
  curationData: IAnalysisSet;
  updateCurationData?: (newSet: IAnalysisSet) => void;
  toggled: ITaskDashboardFilters;
  type?: 'main' | 'related' | 'readOnly';
  prevGermReport: ITaskDashboardReport | null;
}

export default function TaskListItem({
  curationData,
  updateCurationData,
  toggled,
  type = 'main',
  prevGermReport,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();

  const molecularReport = useMemo(() => getReport(
    curationData.analysisSetId,
    'MOLECULAR_REPORT',
    curationData.reports || [],
  ), [curationData.analysisSetId, curationData.reports]);
  const germlineReport = useMemo(() => (
    getReport(
      curationData.analysisSetId,
      'GERMLINE_REPORT',
      curationData.reports || [],
    ) || prevGermReport
  ), [curationData.analysisSetId, curationData.reports, prevGermReport]);
  const clinicalData = useMemo(() => (
    curationData.clinicalData || null
  ), [curationData.clinicalData]);
  const mtbReport = useMemo(() => getReport(
    curationData.analysisSetId,
    'MTB_REPORT',
    curationData.reports || [],
  ), [curationData.analysisSetId, curationData.reports]);

  const [notes, setNotes] = useState<ICurationComment | null>(null);
  const [taskMenuAnchorEl, setTaskMenuAnchorEl] = useState<HTMLElement | null>(null);

  const notesRef = useRef<HTMLElement | null>(null);
  const cohortRef = useRef<HTMLElement | null>(null);

  const isTSO = getPrimaryBiosample(curationData.biosamples || [])?.sampleType === 'panel';
  const isGermlineOnly = curationData.cohort === 'Cohort 13: Germline only';
  const isHighRisk = Boolean(
    curationData.cohort
    && (highRiskCohorts as readonly Cohorts[]).includes(curationData.cohort),
  );

  const sampleCollectionDate = getPrimaryBiosample(curationData.biosamples || [])?.collectionDate;

  const getCaseStatus = (): CaseStatus => {
    // Case closed
    if (curationData.caseFinalisedAt) return 'Done';

    // Any column status "On Hold"
    if (
      [
        curationData.pseudoStatus,
        clinicalData?.pseudoStatus,
        molecularReport?.pseudoStatus,
        germlineReport?.pseudoStatus,
        mtbReport?.pseudoStatus,
      ].includes('On Hold')
    ) return 'On Hold';

    if (curationData.curationStatus && curationData.curationStatus !== 'Done') return curationData.curationStatus as CaseStatus;

    return 'In Progress';
  };

  const updateReport = (newReport: IReport): void => {
    if (updateCurationData) {
      updateCurationData({
        ...curationData,
        reports: curationData.reports?.map((r) => (
          r.id === newReport.id
            ? newReport
            : r
        )),
      });
    }
  };

  useEffect(() => {
    const fetchNotes = async (): Promise<void> => {
      try {
        const resp = await zeroDashSdk.curationComments.getComments({
          analysisSetIds: [curationData.analysisSetId],
          type: ['NOTES'],
        });
        setNotes(resp[0]);
      } catch {
        setNotes(null);
      }
    };

    fetchNotes();
  }, [curationData.analysisSetId, zeroDashSdk.curationComments]);

  return (
    <>
      <TableRow>
        {/* EVENT */}
        <TableCellLeft
          expedited={curationData.expedite}
          type={type}
          sx={{ minWidth: '150px', width: '10vw' }}
        >
          <Box
            display="flex"
            gap="8px"
            alignItems="center"
          >
            {curationData.expedite && (
              <Tooltip
                title="This case is expedited"
                placement="right"
              >
                <ClockAlertIcon color={corePalette.orange100} />
              </Tooltip>
            )}

            <Box
              display="flex"
              flexDirection="column"
              gap="8px"
            >
              <Tooltip
                slotProps={{
                  tooltip: {
                    sx: {
                      maxWidth: 'none',
                      padding: '10px',
                    },
                  },
                }}
                title={(
                  <Box display="flex" flexDirection="column">
                    <Box display="flex">
                      <CustomTypography fontWeight="bold" minWidth="90px">
                        Study:
                      </CustomTypography>
                      <CustomTypography variant="bodyRegular">
                        {curationData.study || 'No data available'}
                      </CustomTypography>
                    </Box>
                    <Box display="flex">
                      <CustomTypography fontWeight="bold" minWidth="90px">
                        Collection:
                      </CustomTypography>
                      <CustomTypography variant="bodyRegular">
                        {sampleCollectionDate
                          ? dayjs(sampleCollectionDate).format('DD/MM/YYYY')
                          : 'No data available'}
                      </CustomTypography>
                    </Box>
                    <Box display="flex">
                      <CustomTypography fontWeight="bold" minWidth="90px">
                        Purity:
                      </CustomTypography>
                      <CustomTypography variant="bodyRegular">
                        {curationData.purity
                          ? `${curationData.purity * 100}%`
                          : 'No data available'}
                      </CustomTypography>
                    </Box>
                    <Box display="flex">
                      <CustomTypography fontWeight="bold" minWidth="90px">
                        Ploidy:
                      </CustomTypography>
                      <CustomTypography variant="bodyRegular">
                        {curationData.ploidy
                          ? curationData.ploidy.toFixed(2)
                          : 'No data available'}
                      </CustomTypography>
                    </Box>
                  </Box>
                )}
              >
                <Link
                  to={`/${curationData.patientId}/${curationData.analysisSetId}/curation`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <CustomTypography
                    variant="bodyRegular"
                    fontWeight="bold"
                  >
                    {mapEvent(curationData.sequencedEvent, true)}
                  </CustomTypography>
                </Link>
              </Tooltip>
              {(isTSO || isGermlineOnly) && (
                <Box
                  display="flex"
                  gap="8px"
                >
                  {isTSO && (
                    <CustomChip
                      label="TSO500"
                      backgroundColour={corePalette.magenta10}
                      colour={corePalette.magenta200}
                    />
                  )}
                  {isGermlineOnly && (
                    <CustomChip
                      label="Germline Only"
                      backgroundColour={corePalette.orange10}
                      colour={corePalette.orange200}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </TableCellLeft>
        {/* COHORT */}
        <TableCell
          type={type}
          sx={{ minWidth: '180px', width: '10vw' }}
          ref={cohortRef}
        >
          <TruncatingTypography variant="bodyRegular" tooltipText={curationData.cohort}>
            {curationData.cohort}
          </TruncatingTypography>
        </TableCell>
        {/* ZERO2 FINAL DIAGNOSIS */}
        <TableCell
          type={type}
          sx={{ minWidth: '200px', width: '12vw' }}
        >
          <TruncatingTypography variant="bodyRegular" tooltipText={curationData.zero2FinalDiagnosis}>
            {curationData.zero2FinalDiagnosis}
          </TruncatingTypography>
        </TableCell>
        {/* CURATION */}
        <CurationCell
          data={curationData}
          type={type}
          updateData={updateCurationData}
        />
        {/* MOLECULAR REPORT */}
        <ReportCell
          stage={reportOptions.find((o) => o.value === 'MOLECULAR_REPORT') as IReportOption<ReportType>}
          report={molecularReport}
          status={mapReportStatus(
            'MOLECULAR_REPORT',
            molecularReport?.pseudoStatus || molecularReport?.status,
            isGermlineOnly,
            isHighRisk,
            molecularReport,
          )}
          curationData={curationData}
          toggled={toggled}
          type={type}
          columnWidths={{
            minWidth: '165px',
            width: '10vw',
          }}
          averageDays={{
            belowAvgDays: 2,
            aboveAvgDays: 3,
          }}
          updateReport={updateReport}
        />
        {/* GERMLINE REPORT */}
        <ReportCell
          stage={reportOptions.find((o) => o.value === 'GERMLINE_REPORT') as IReportOption<ReportType>}
          report={germlineReport}
          status={mapReportStatus(
            'GERMLINE_REPORT',
            germlineReport?.pseudoStatus || germlineReport?.status,
            isGermlineOnly,
            isHighRisk,
            molecularReport,
          )}
          curationData={curationData}
          toggled={toggled}
          type={type}
          columnWidths={{
            minWidth: '165px',
            width: '10vw',
          }}
          averageDays={{
            belowAvgDays: 25,
            aboveAvgDays: 30,
          }}
          updateReport={updateReport}
        />
        {/* MTB SLIDES */}
        <MTBSlidesCell
          curationData={curationData}
          clinicalData={clinicalData}
          updateClinicalData={(newClinicalData): void => {
            if (updateCurationData) {
              updateCurationData({
                ...curationData,
                clinicalData: newClinicalData,
              });
            }
          }}
          type={type}
          toggled={toggled}
        />
        {/* MTB REPORT */}
        <ReportCell
          stage={reportOptions.find((o) => o.value === 'MTB_REPORT') as IReportOption<ReportType>}
          report={mtbReport}
          curationData={curationData}
          status={mapReportStatus(
            'MTB_REPORT',
            mtbReport?.pseudoStatus || mtbReport?.status,
            isGermlineOnly,
            isHighRisk,
            molecularReport,
          )}
          toggled={toggled}
          columnWidths={{
            minWidth: '165px',
            width: '10vw',
          }}
          averageDays={{
            belowAvgDays: 25,
            aboveAvgDays: 30,
          }}
          type={type}
          updateReport={updateReport}
        />
        {/* CASE STATUS */}
        <TaskStageCell
          stageName="Case Status"
          data={curationData}
          disabled={['Upcoming', 'In Pipeline'].includes(curationData.curationStatus)}
          type={type}
          columnWidths={{
            minWidth: '110px',
            width: '8vw',
          }}
          status={getCaseStatus()}
          startAt={curationData.curationStartedAt}
          finalisedAt={curationData.caseFinalisedAt}
          averageDays={{
            belowAvgDays: isHighRisk ? 35 : 8,
            aboveAvgDays: isHighRisk ? 40 : 10,
          }}
          isHighRiskCohort={isHighRisk}
        />
        {/* NOTES */}
        <TableCellRight
          type={type}
          sx={{ minWidth: '200px', width: '10vw' }}
          ref={notesRef}
        >
          <Box display="flex" justifyContent="space-between">
            <TruncatingTypography
              variant="bodyRegular"
              tooltipText={(
                <Markdown>
                  {plateToMarkdown(parseText(notes?.versions?.[0]?.comment || '').value)}
                </Markdown>
              )}
            >
              <StyledWrapper>
                <RichTextEditor
                  key={notes?.versions?.[0]?.comment}
                  classNames={{ editor: 'editor-added-class' }}
                  mode="readOnly"
                  initialText={notes?.versions?.[0]?.comment}
                  condensed
                  hideEmptyEditor
                  disablePlugins={['table', 'evidence', 'inline-citation', 'comment']}
                />
              </StyledWrapper>
              {/* <Truncate
                lines={2}
                width={notesTruncateWidth - 80}
              >
              </Truncate> */}
            </TruncatingTypography>
            <IconButton
              sx={{ padding: '6px' }}
              onClick={(e): void => setTaskMenuAnchorEl(e.currentTarget)}
            >
              <EllipsisVerticalIcon />
            </IconButton>
          </Box>
        </TableCellRight>
      </TableRow>
      {/* TASK MENU OPTIONS */}
      <TaskListItemMenu
        anchorEl={taskMenuAnchorEl}
        setAnchorEl={setTaskMenuAnchorEl}
        curationData={curationData}
        updateCurationData={updateCurationData}
        updateReport={updateReport}
        clinicalData={clinicalData}
        molecularReport={molecularReport}
        germlineReport={germlineReport}
        mtbReport={mtbReport}
        currentNotes={notes}
        setNotes={setNotes}
        canCloseCase={getCaseStatus() === 'In Progress'
          && curationData.curationStatus === 'Done'
          && germlineReport?.status === 'approved'
          && (curationData.cohort === 'Cohort 13: Germline only' || molecularReport?.status === 'approved')}
      />
    </>
  );
}
