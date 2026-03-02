import {
  Box, Dialog, IconButton,
  Switch,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { XIcon } from 'lucide-react';
import { JSX, useMemo, useState } from 'react';
import { usePatient } from '@/contexts/PatientContext';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import CustomButton from '@/components/Common/Button';
import { defaultPatientDiagnosisColumnSettings } from '@/constants/Clinical/patient';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { IPatientDiagnosisColumn } from '../../../../../types/MTB/MTB.types';
import { IPatientDiagnosisSettings } from '../../../../../types/MTB/Settings.types';
import CustomTypography from '../../../../Common/Typography';
import { ScrollableSection } from '../../../../ScrollableSection/ScrollableSection';
import DiagnosisData from './DiagnosisData';

const useStyles = makeStyles(() => ({
  dialogRoot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '0px',
    position: 'absolute',
    width: '428px',
    background: '#FFFFFF',
    boxShadow: '0px 16px 32px rgba(18, 47, 92, 0.16)',
    borderRadius: '8px',
    overflowY: 'visible',
  },
  dialogHeader: {
    padding: '24px',
    gap: '8px',
    width: '428px',
    height: '76px',
    background: '#F3F5F7',
    borderRadius: '8px 8px 0px 0px',
  },
  dialogContent: {
    width: '428px',
    border: '1px solid #ECF0F3',
  },
  dialogAction: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '16px',
    gap: '208px',
    width: '428px',
    background: '#FFFFFF',
    borderRadius: '0px 0px 8px 8px',
  },
  headerText: {
    color: '#022034',
    justifyContent: 'left',
  },
  contentHeader: {
    color: '#022034',
  },
  gridData: {
    margin: '16px 0',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '0px',
    gap: '16px',
    width: '428px',
    height: '48px',
  },
}));

export interface IDiagnosisManageModalProps {
  columnSettings: IPatientDiagnosisColumn[];
  open: boolean;
  onModalSave: (settings: IPatientDiagnosisSettings) => Promise<void>;
  onModalCancel: () => void;
}

export function DiagnosisManageModal({
  columnSettings,
  open,
  onModalCancel,
  onModalSave,
}: IDiagnosisManageModalProps): JSX.Element {
  const classes = useStyles();
  const { clinicalVersion } = useClinical();
  const {
    analysisSet,
    immunoprofile,
    demographics,
    purity,
    metrics,
    tumourBiosample,
  } = useAnalysisSet();
  const { patient } = usePatient();
  const {
    patientDiagnosisSettings,
  } = useMemo(() => clinicalVersion.slideTableSettings, [clinicalVersion.slideTableSettings]);

  const [modalSettings, setModalSettings] = useState<IPatientDiagnosisSettings>(
    patientDiagnosisSettings
    ?? Object.fromEntries(
      defaultPatientDiagnosisColumnSettings
        .map((s) => [s.settingKey, s.visible]),
    ),
  );

  const onToggleChange = (settingKey: keyof IPatientDiagnosisSettings, checked: boolean): void => {
    setModalSettings((prev) => ({
      ...prev,
      [settingKey]: checked,
    }));
  };

  const onInternalModalCancel = (): void => {
    onModalCancel();
    setModalSettings(patientDiagnosisSettings
    ?? Object.fromEntries(
      defaultPatientDiagnosisColumnSettings
        .map((s) => [s.settingKey, s.visible]),
    ));
  };

  const onInternalModalSave = async (): Promise<void> => {
    await onModalSave(modalSettings);
  };

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
    ...purity,
    ...patient,
    ...clinicalVersion,
    ...analysisSet,
    ...demographics,
  };

  return (
    <Dialog open={open} PaperProps={{ className: classes.dialogRoot }}>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        className={classes.dialogHeader}
      >
        <CustomTypography
          className={classes.headerText}
          fontWeight="medium"
          variant="h5"
        >
          Patient Diagnosis
        </CustomTypography>
        <IconButton
          onClick={onInternalModalCancel}
        >
          <XIcon />
        </IconButton>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        className={classes.dialogContent}
      >
        {columnSettings.length > 0 && (
          <ScrollableSection
            style={{
              maxHeight: 'calc(100vh - 250px)',
              width: '100%',
            }}
          >
            <Box
              width="100%"
              padding="6px 12px 6px 24px"
            >
              <CustomTypography className={classes.contentHeader} variant="label">
                Add patient data
              </CustomTypography>
              {columnSettings?.map(({
                label,
                key,
                settingKey,
                displayTransform,
              }) => (
                <Box key={settingKey} className={classes.gridData}>
                  <DiagnosisData
                    label={label}
                    value={values[key]}
                    patient={patient}
                    analysisSet={analysisSet}
                    displayTransform={displayTransform}
                  />
                  <Switch
                    style={{ padding: 0 }}
                    checked={modalSettings[settingKey] ?? false}
                    onChange={(e): void => onToggleChange(
                      settingKey,
                      e.target.checked,
                    )}
                    name={settingKey}
                  />
                </Box>
              ))}
            </Box>
          </ScrollableSection>
        )}
      </Box>
      <Box className={classes.dialogAction}>
        <Box className={classes.btnBox}>
          <CustomButton
            variant="subtle"
            label="Cancel"
            onClick={onInternalModalCancel}
          />
          <CustomButton
            variant="bold"
            label="Save"
            onClick={onInternalModalSave}
          />
        </Box>
      </Box>
    </Dialog>
  );
}
