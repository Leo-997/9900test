import { Box, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  JSX,
  useCallback, useMemo, useState,
} from 'react';
import CustomButton from '@/components/Common/Button';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { usePatient } from '@/contexts/PatientContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { defaultPatientDiagnosisColumnSettings } from '../../../../../constants/Clinical/patient';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { IPatientDiagnosisColumn } from '../../../../../types/MTB/MTB.types';
import { IPatientDiagnosisSettings } from '../../../../../types/MTB/Settings.types';
import CustomTypography from '../../../../Common/Typography';
import DiagnosisData from './DiagnosisData';
import { DiagnosisManageModal } from './DiagnosisManageModal';

const useStyles = makeStyles(() => ({
  parentBox: {
    minWidth: '882px',
    padding: '1.2% 32px',
  },
  heading: {
    fontFamily: 'Roboto',
    fontWeight: 700,
    fontSize: '16px',
    lineHeight: '24px',
    color: '#022034',
  },
  buttonText: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '20px',
    paddingRight: '12.5px',
  },
  dataContainer: {
    height: '100%',
    maxWidth: '90%',
  },
  dataWrapper: {
    paddingBottom: '1.1%',
    paddingRight: '0.4%',
  },
}));

interface IProps {
  isPresentationMode: boolean;
}

export function DiagnosisDetailsCard({
  isPresentationMode,
}: IProps): JSX.Element {
  const classes = useStyles();
  const {
    clinicalVersion,
    isReadOnly,
    isAssignedCurator,
    isAssignedClinician,
    updateSlideTableVisibilitySettings,
  } = useClinical();
  const {
    analysisSet,
    immunoprofile,
    demographics,
    purity,
    metrics,
    tumourBiosample,
  } = useAnalysisSet();
  const { patient } = usePatient();

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const canEditDiagnosisData = useIsUserAuthorised(
    'clinical.sample.assigned.write',
    isAssignedCurator,
    isAssignedClinician,
  ) && !isReadOnly;

  const { patientDiagnosisSettings } = clinicalVersion.slideTableSettings;

  const patientDiagnosisColumnSettings = useMemo<IPatientDiagnosisColumn[]>(
    () => defaultPatientDiagnosisColumnSettings.map((columnSetting) => ({
      ...columnSetting,
      visible: patientDiagnosisSettings?.[columnSetting.settingKey] ?? columnSetting.visible,
    })),
    [patientDiagnosisSettings],
  );

  const onModalSave = useCallback(
    async (settings: IPatientDiagnosisSettings): Promise<void> => {
      await updateSlideTableVisibilitySettings(
        'patientDiagnosisSettings',
        settings,
      );
      setModalOpen(false);
    },
    [updateSlideTableVisibilitySettings],
  );

  const values = {
    ipass: {
      ipassValue: immunoprofile?.ipassValue,
      ipassStatus: immunoprofile?.ipassStatus,
    },
    tumourMutationBurden: {
      snvMissense: analysisSet.somMissenseSnvs,
      mutationBurden: analysisSet.mutBurdenMb,
    },
    contamination: metrics
      ?.find((metric) => metric.biosampleId === tumourBiosample?.biosampleId)
      ?.qcStatus,
    mtbMeetingDate: clinicalVersion.meetings.find((r) => r.type === 'MTB')?.date,
    ...purity,
    ...patient,
    ...clinicalVersion,
    ...analysisSet,
    ...demographics,
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        rowGap="8px"
        className={classes.parentBox}
      >
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap="8px"
        >
          <CustomTypography
            variant={isPresentationMode ? 'titleRegular' : 'bodyRegular'}
            fontWeight="bold"
          >
            Patient Details
          </CustomTypography>
          {!isPresentationMode && (
            <CustomButton
              label="Manage"
              variant="text"
              size="small"
              disabled={!canEditDiagnosisData}
              onClick={(): void => setModalOpen(true)}
            />
          )}
        </Box>

        {patientDiagnosisColumnSettings.length > 0 && (
          <Box className={classes.dataContainer}>
            <Grid
              container
              columnSpacing={3}
              rowSpacing={2}
            >
              {patientDiagnosisColumnSettings?.map(
                ({
                  label,
                  key,
                  visible,
                  displayTransform,
                }) => visible && (
                  <Grid
                    key={key}
                    size={{ xs: 3 }}
                  >
                    <DiagnosisData
                      label={label}
                      value={values[key]}
                      patient={patient}
                      displayTransform={displayTransform}
                    />
                  </Grid>
                ),
              )}
            </Grid>
          </Box>
        )}
      </Box>
      <DiagnosisManageModal
        columnSettings={patientDiagnosisColumnSettings}
        onModalCancel={(): void => setModalOpen(false)}
        onModalSave={onModalSave}
        open={modalOpen}
      />
    </>
  );
}
