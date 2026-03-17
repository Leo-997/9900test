import CustomTypography from '@/components/Common/Typography';
import Gender from '@/components/VitalStatus/Gender';
import { IAnalysisPatient, IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { ITaskDashboardReport } from '@/types/Reports/Reports.types';
import { ITaskDashboardFilters } from '@/types/TaskDashboard/TaskDashboard.types';
import { getReport } from '@/utils/components/taskdashboard/getReport';
import {
  AccordionDetails,
  Box,
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  TableCell as MuiTableCell,
  TableBody,
  TableRow,
  styled,
} from '@mui/material';
import { ChevronDownIcon } from 'lucide-react';
import { useEffect, useState, type JSX } from 'react';
import TaskListItem from './TaskListItem';

const TableCell = styled(MuiTableCell)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  border: 'none',
  padding: '16px 16px 0px 16px',
}));

const Accordion = styled(MuiAccordion)(({ theme }) => ({
  backgroundColor: theme.colours.core.grey30,
  '& *': {
    transitionProperty: 'height, transform, opacity !important',
    transitionTimingFunction: 'cubic-bezier(.19, 1, .22, 1) !important',
    transitionDuration: '0.5s !important',
  },
  '&:first-child': {
    borderRadius: '0px',
  },
  '&:last-child': {
    borderRadius: '0px',
  },
}));

const AccordionSummary = styled(MuiAccordionSummary)({
  minHeight: '0px',
  padding: '0px',
  '&.Mui-expanded': {
    minHeight: '0px',
  },
  '& .MuiAccordionSummary-content': {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '8px 16px',
    '&.Mui-expanded': {
      '& svg': {
        transform: 'rotate(180deg)',
      },
    },
  },
});

const StickyTitle = styled(Box)({
  position: 'sticky',
  left: '16px',
  width: 'fit-content',
});

interface IProps {
  analysisPatient: IAnalysisPatient;
  toggled: ITaskDashboardFilters;
  updateAnalysisPatient?: (analysisPatient: IAnalysisPatient) => void;
}

export default function TaskPatientBlock({
  analysisPatient,
  toggled,
  updateAnalysisPatient,
}: IProps): JSX.Element {
  const [fakeLoading, setFakeLoading] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);

  const getActiveSets = (): IAnalysisSet[] => (
    analysisPatient.analysisSets
      .filter(
        (a) => a.caseFinalisedAt === null,
      )
  );

  const getInactiveSets = (): IAnalysisSet[] => (
    analysisPatient.analysisSets
      .filter(
        (a) => a.caseFinalisedAt?.length,
      )
  );

  const updateAnalysisSet = (analysisSet: IAnalysisSet): void => {
    if (updateAnalysisPatient) {
      updateAnalysisPatient({
        ...analysisPatient,
        analysisSets: analysisPatient.analysisSets.map((a) => (
          a.analysisSetId === analysisSet.analysisSetId
            ? analysisSet
            : a
        )),
      });
    }
  };

  const inactiveSetGermlineReport: ITaskDashboardReport | null | undefined = getInactiveSets()
    .map((set) => {
      const report = getReport(
        set.analysisSetId,
        'GERMLINE_REPORT',
        set.reports || [],
      );

      if (!report) return report;
      return {
        ...report,
        startedAt: set.curationFinalisedAt,
      };
    })
    .find((r) => r?.approvedAt);

  useEffect(() => {
    // Fake loading is used to make the accordion animation look better
    // Otherwise the data will load as the accordion is expanding
    if (fakeLoading) {
      setTimeout(() => setFakeLoading(false), 300);
    }
  }, [fakeLoading]);

  return (
    <TableBody style={{ paddingBottom: '16px', zIndex: 0 }}>
      <TableRow>
        <TableCell
          colSpan={100}
          sx={{ paddingBottom: getActiveSets().length === 0 ? '16px' : '0px' }}
        >
          <StickyTitle
            display="flex"
            gap="8px"
          >
            <CustomTypography variant="titleRegular" fontWeight="bold">
              Patient ID(s):
              {' '}
              {Array.from(
                new Set(
                  analysisPatient.analysisSets.map((a) => a.patientId),
                ),
              ).join(', ')}
            </CustomTypography>
            {analysisPatient.vitalStatus && (
              <Gender vitalStatus={analysisPatient.vitalStatus} gender={analysisPatient.gender} />
            )}
          </StickyTitle>
        </TableCell>
      </TableRow>
      {getActiveSets().map((a) => (
        <TaskListItem
          key={a.analysisSetId}
          curationData={a}
          updateCurationData={updateAnalysisSet}
          toggled={toggled}
          prevGermReport={inactiveSetGermlineReport || null}
        />
      ))}
      {getInactiveSets().length > 0 && (
        <TableRow>
          <TableCell colSpan={100} style={{ padding: 0, border: 'none' }}>
            <Accordion
              elevation={0}
              onChange={(e, newExpanded): void => {
                setExpanded(newExpanded);
                setFakeLoading(true);
              }}
            >
              <AccordionSummary>
                <Box display="flex" alignItems="center" position="sticky" left={16}>
                  <CustomTypography
                    variant="label"
                    fontWeight="bold"
                  >
                    Curated cases
                  </CustomTypography>
                  <ChevronDownIcon width="18px" height="15px" style={{ marginLeft: '8px' }} />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: '0px' }}>
                <Box
                  sx={{
                    opacity: fakeLoading || !expanded ? 0 : 1,
                    transition: expanded ? 'opacity 0.1s cubic-bezier(.19, 1, .22, 1)' : undefined,
                  }}
                >
                  {getInactiveSets().map((a) => (
                    <TaskListItem
                      key={a.analysisSetId}
                      curationData={a}
                      updateCurationData={updateAnalysisSet}
                      type="related"
                      toggled={toggled}
                      prevGermReport={inactiveSetGermlineReport || null}
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
