import CustomTypography from '@/components/Common/Typography';
import Gender from '@/components/VitalStatus/Gender';
import { activeCurationStatuses } from '@/constants/Curation/status';
import { IAnalysisPatient, IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
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
import { CurationListItem } from './CurationListItem';

const TableCell = styled(MuiTableCell)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  border: 'none',
  padding: '16px',
  paddingBottom: '0px',
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

interface IProps {
  analysisPatient: IAnalysisPatient;
  updateAnalysisPatient?: (analysisPatient: IAnalysisPatient) => void;
}

export default function CurationPatientBlock({
  analysisPatient,
  updateAnalysisPatient,
}: IProps): JSX.Element {
  const [fakeLoading, setFakeLoading] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);

  const getActiveSets = (): IAnalysisSet[] => (
    analysisPatient.analysisSets
      .filter(
        (a) => activeCurationStatuses.some((s) => a.curationStatus === s),
      )
  );

  const getInactiveSets = (): IAnalysisSet[] => (
    analysisPatient.analysisSets
      .filter(
        (a) => !activeCurationStatuses.some((s) => a.curationStatus === s),
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

  useEffect(() => {
    // Fake loading is used to make the accordion animation look better
    // Otherwise the data will load as the accordion is expanding
    if (fakeLoading) {
      setTimeout(() => setFakeLoading(false), 300);
    }
  }, [fakeLoading]);

  return (
    <TableBody style={{ paddingBottom: '16px' }}>
      <TableRow>
        <TableCell colSpan={100} sx={{ paddingBottom: getActiveSets().length === 0 ? '16px' : '0px' }}>
          <Box display="flex" gap="8px" sx={{ position: 'sticky', left: '16px', width: 'fit-content' }}>
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
          </Box>
        </TableCell>
      </TableRow>
      {getActiveSets().map((aset) => (
        <CurationListItem
          key={aset.analysisSetId}
          analysisSet={aset}
          updateAnalysisSet={updateAnalysisSet}
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
                    <CurationListItem
                      analysisSet={a}
                      type="related"
                      updateAnalysisSet={updateAnalysisSet}
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
