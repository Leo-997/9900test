import {
  Box, Grid, Link, styled,
} from '@mui/material';
import dayjs from 'dayjs';
import { ArrowUpRightIcon, TimerIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useMemo, type JSX } from 'react';
import { researchCandidateOptions } from '@/constants/options';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import { IUpdateAnalysisSetBody } from '@/types/Analysis/AnalysisSets.types';
import { ResearchCandidateReason } from '@/types/PatientProfile.types';
import { useCuration } from '../../contexts/CurationContext';
import { usePatient } from '../../contexts/PatientContext';
import DataPanel from '../Common/DataPanel';
import CustomTypography from '../Common/Typography';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';
import VitalStatus from '../VitalStatus/VitalStatus';

const InlineTitle = styled(CustomTypography)(() => ({
  color: corePalette.grey100,
}));

export default function PatientDetails(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { isReadOnly, isAssignedCurator } = useCuration();
  const {
    analysisSet,
    setAnalysisSet,
    demographics,
    primaryBiosample,
  } = useAnalysisSet();
  const { patient } = usePatient();

  const canEdit = useIsUserAuthorised('curation.sample.write', isAssignedCurator);

  const histologicalDiagnosis = useMemo(() => {
    if (demographics === undefined) {
      return 'Loading diagnosis from C1...';
    }

    return demographics?.histologicalDiagnosis ?? '-';
  }, [demographics]);

  const handleUpdate = async (
    body: Pick<IUpdateAnalysisSetBody, 'targetable' | 'ctcCandidate' | 'researchCandidate'>,
  ): Promise<void> => {
    try {
      await zeroDashSdk.curation.analysisSets.updateAnalysisSetById(
        analysisSet.analysisSetId,
        body,
      );
      setAnalysisSet((prev) => ({
        ...prev,
        ...body,
      }));
    } catch {
      enqueueSnackbar('Could not update analysis set, please try again', { variant: 'error' });
    }
  };

  const labmatrixBaseUrl = import.meta.env.VITE_LABMATRIX_URL_BASE;

  return (
    <Grid
      container
      direction="row"
      spacing={2}
      size={12}
    >
      <Grid
        container
        direction="column"
        bgcolor={corePalette.white}
        padding="24px"
        borderRadius="8px"
        size={{ md: 12, lg: 5 }}
      >
        <Grid
          size={12}
          container
          direction="row"
          spacing={4}
        >
          <VitalStatus vitalStatus={patient?.vitalStatus} gender={patient?.sex as string} />
          <DataPanel
            label="Age (years)"
            value={(
              <Box
                display="flex"
                gap="4px"
                flexWrap="wrap"
                color={corePalette.grey100}
              >
                <InlineTitle
                  variant="titleSmall"
                  display="inline"
                  tooltipText="Age at diagnosis"
                >
                  DX:&nbsp;
                  <CustomTypography
                    variant="bodyRegular"
                    display="inline"
                  >
                    {patient.ageAtDiagnosis}
                  </CustomTypography>
                </InlineTitle>
                |
                <InlineTitle
                  variant="titleSmall"
                  display="inline"
                  tooltipText="Age at sample acquisition"
                >
                  S:&nbsp;
                  <CustomTypography
                    variant="bodyRegular"
                    display="inline"
                  >
                    {primaryBiosample?.ageAtSample ?? '-'}
                  </CustomTypography>
                </InlineTitle>
                |
                <InlineTitle
                  variant="titleSmall"
                  display="inline"
                  tooltipText="Age at enrolment"
                >
                  E:&nbsp;
                  <CustomTypography
                    variant="bodyRegular"
                    display="inline"
                  >
                    {patient.ageAtEnrolment}
                  </CustomTypography>
                </InlineTitle>
                {patient.ageAtDeath && (
                  <>
                    |
                    <InlineTitle
                      variant="titleSmall"
                      display="inline"
                      tooltipText="Age at death"
                    >
                      D:&nbsp;
                      <CustomTypography
                        variant="bodyRegular"
                        display="inline"
                      >
                        {patient.ageAtDeath}
                      </CustomTypography>
                    </InlineTitle>
                  </>
                )}
              </Box>
            )}
          />
          <DataPanel
            label="Events"
            value={(
              <Box
                display="flex"
                gap="4px"
                flexWrap="wrap"
                color={corePalette.grey100}
              >
                <InlineTitle
                  variant="titleSmall"
                  display="inline"
                  tooltipText="Analysis event"
                >
                  A:&nbsp;
                  <CustomTypography
                    variant="bodyRegular"
                    display="inline"
                  >
                    {analysisSet.analysisEvent}
                  </CustomTypography>
                </InlineTitle>
                |
                <InlineTitle
                  variant="titleSmall"
                  display="inline"
                  tooltipText="Diagnosis event"
                >
                  D:&nbsp;
                  <CustomTypography
                    variant="bodyRegular"
                    display="inline"
                  >
                    {analysisSet.diagnosisEvent}
                  </CustomTypography>
                </InlineTitle>
                |
                <InlineTitle
                  variant="titleSmall"
                  display="inline"
                  tooltipText="Sequenced event"
                >
                  S:&nbsp;
                  <CustomTypography
                    variant="bodyRegular"
                    display="inline"
                  >
                    {analysisSet.sequencedEvent}
                  </CustomTypography>
                </InlineTitle>
              </Box>
            )}
          />
        </Grid>
        <Grid
          size={12}
          bgcolor={corePalette.grey10}
          border={`1px solid ${corePalette.grey30}`}
          borderRadius="8px"
          padding="12px"
        >
          <DataPanel
            label="Zero2 Final Diagnosis"
            value={analysisSet.zero2FinalDiagnosis}
          />
        </Grid>
        <Grid
          size={12}
          container
          direction="row"
        >
          <Grid
            size={6}
            container
            direction="column"
            bgcolor={corePalette.grey10}
            border={`1px solid ${corePalette.grey30}`}
            borderRadius="8px"
            padding="12px"
          >
            <Grid size={12}>
              <DataPanel
                label="Histologic Diagnosis"
                value={histologicalDiagnosis}
              />
            </Grid>
            <Grid size={12}>
              <DataPanel
                label="Subtype or comments"
                value={analysisSet.cancerSubtype}
              />
            </Grid>
          </Grid>
          <Grid
            size={6}
            container
            direction="column"
            bgcolor={corePalette.grey10}
            border={`1px solid ${corePalette.grey30}`}
            borderRadius="8px"
            padding="12px"
          >
            <Grid size={12}>
              <DataPanel label="Cohort" value={analysisSet.cohort} />

            </Grid>
            <Grid size={12}>
              <DataPanel
                label="Cohort Rationale"
                value={analysisSet.cohortRationale}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid
        container
        direction="row"
        bgcolor={corePalette.white}
        padding="24px"
        borderRadius="8px"
        size={{ md: 12, lg: 7 }}
        spacing={3}
      >
        <Grid size={3}>
          <DataPanel
            label="LabMatrix ID"
            value={(
              <Link
                underline="none"
                href={`${labmatrixBaseUrl}/#/subjects/${patient.labmatrixId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap="8px"
                >
                  <CustomTypography
                    fontWeight="bold"
                    color={corePalette.green150}
                  >
                    {patient.labmatrixCode}
                  </CustomTypography>
                  <ArrowUpRightIcon />
                </Box>
              </Link>
              )}
          />
        </Grid>
        <Grid size={3}>
          <DataPanel
            label="Enrolment"
            value={(
              <Box display="flex" gap="8px">
                <TimerIcon size={20} />
                <CustomTypography variant="bodyRegular" truncate>
                  {patient.enrolmentDate
                    ? dayjs(patient.enrolmentDate).fromNow()
                    : 'Date Unknown'}
                </CustomTypography>
              </Box>
            )}
          />
        </Grid>
        <Grid size={3}>
          <DataPanel label="Hospital" value={patient.hospital} />
        </Grid>
        <Grid size={3}>
          <DataPanel
            label="Research candidate"
            value={(
              <AutoWidthSelect
                options={researchCandidateOptions}
                defaultValue={analysisSet.researchCandidate || ''}
                onChange={(e): void => {
                  handleUpdate({ researchCandidate: (e.target.value as ResearchCandidateReason | '') || null });
                }}
                disabled={isReadOnly || !canEdit}
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid size={3}>
          <DataPanel label="Study" value={analysisSet.study} />
        </Grid>
        <Grid size={3}>
          <DataPanel label="Zero2 Category" value={analysisSet.zero2Category} />
        </Grid>
        <Grid size={3}>
          <DataPanel label="Zero2 Subcategory 1" value={analysisSet.zero2Subcategory1} />
        </Grid>
        <Grid size={3}>
          <DataPanel label="Zero2 Subcategory 2" value={analysisSet.zero2Subcategory2} />
        </Grid>
        <Grid size={3}>
          <DataPanel
            label="Primary site"
            value={analysisSet.priSite}
          />
        </Grid>
        <Grid size={3}>
          <DataPanel
            label="Sequenced site"
            value={analysisSet.sampleSite}
          />
        </Grid>
        <Grid size={3}>
          <DataPanel
            label="Metastatic disease"
            value={analysisSet.metDisease}
          />
        </Grid>
        <Grid size={3}>
          <DataPanel
            label="Metastatic site sequenced"
            value={analysisSet.sampleMetSite}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
