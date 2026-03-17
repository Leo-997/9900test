import CustomTypography from '@/components/Common/Typography';
import { defaultPatientDiagnosisColumnSettings } from '@/constants/Clinical/patient';
import { AnalysisSetContext, AnalysisSetProvider, IAnalysisSetContext } from '@/contexts/AnalysisSetContext';
import { Box, Grid } from '@mui/material';
import { useEffect, useMemo, useState, type JSX } from 'react';
import { useMTBArchive } from '../../../../../contexts/MTBArchiveContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { IClinicalVersionRaw, IPatientDiagnosisColumn } from '../../../../../types/MTB/MTB.types';
import { IPatient } from '../../../../../types/Patient/Patient.types';
import CustomDialog from '../../../../Common/CustomDialog';
import { ScrollableSection } from '../../../../ScrollableSection/ScrollableSection';
import ClinicalHistory from '../ClinicalHistory/ClinicalHistory';
import DiagnosisData from '../Diagnosis/DiagnosisData';

interface IProps {
  open: boolean;
  onClose: () => void;
  clinicalVersion: IClinicalVersionRaw;
}

export default function ArchiveClinicalInformationModal({
  open,
  onClose,
  clinicalVersion,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { selectedSample } = useMTBArchive();

  const [clinicalHistory, setClinicalHistory] = useState<string>();
  const [patient, setPatient] = useState<IPatient>();

  const { patientDiagnosisSettings } = clinicalVersion.slideTableSettings;

  const patientDiagnosisColumnSettings = useMemo<IPatientDiagnosisColumn[]>(
    () => defaultPatientDiagnosisColumnSettings.map((columnSetting) => ({
      ...columnSetting,
      visible: patientDiagnosisSettings?.[columnSetting.settingKey] ?? columnSetting.visible,
    })),
    [patientDiagnosisSettings],
  );

  useEffect(() => {
    if (selectedSample?.clinicalVersionId) {
      zeroDashSdk.mtb.clinical.getClinicalVersionById(selectedSample.clinicalVersionId)
        .then((resp) => setClinicalHistory(resp.clinicalHistory));
    }
  });

  useEffect(() => {
    if (selectedSample?.patientId) {
      zeroDashSdk.patient.getPatientById(
        selectedSample.patientId,
      ).then((resp) => setPatient(resp));
    }
  }, [selectedSample?.patientId, zeroDashSdk.patient]);

  const getValues = ({
    analysisSet,
    demographics,
    immunoprofile,
    purity,
    metrics,
    tumourBiosample,
  }: IAnalysisSetContext): Record<string, unknown> => {
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
    return values;
  };

  if (!selectedSample) {
    return <div />;
  }

  return (
    <AnalysisSetProvider analysisSetId={selectedSample.analysisSetId}>
      <AnalysisSetContext.Consumer>
        {(context): JSX.Element => (
          context ? (
            <CustomDialog
              open={open}
              onClose={onClose}
              title="Clinical Information"
              content={(
                <ScrollableSection style={{ maxHeight: '100%', padding: '0px 16px' }}>
                  <Box display="flex" flexDirection="column" gap="16px" paddingBottom="16px">
                    <CustomTypography variant="h5">
                      Patient Profile
                    </CustomTypography>
                    {patientDiagnosisColumnSettings.length > 0 && (
                      <Grid container spacing={2}>
                        <Grid
                          key="name"
                          size={{ xs: 3 }}
                        >
                          <DiagnosisData
                            label="Name"
                            value={`${context.demographics?.firstName ? context.demographics.firstName : ''} ${context.demographics?.lastName ? context.demographics.lastName.toUpperCase() : ''}`}
                            patient={patient}
                          />
                        </Grid>
                        <Grid
                          key="age"
                          size={{ xs: 3 }}
                        >
                          <DiagnosisData
                            label="Age"
                            value={context.demographics?.age}
                            patient={patient}
                          />
                        </Grid>
                        <Grid
                          key="sex"
                          size={{ xs: 3 }}
                        >
                          <DiagnosisData
                            label="Sex"
                            value={patient?.sex}
                            patient={patient}
                          />
                        </Grid>
                        {patientDiagnosisColumnSettings.map(
                          ({
                            label,
                            key,
                            visible,
                            displayTransform,
                          }) => visible && (
                            <Grid
                              key={key}
                              size={{ xs: label.toLowerCase() === 'hospital' ? 6 : 3 }}
                            >
                              <DiagnosisData
                                label={label}
                                value={getValues(context)[key]}
                                patient={patient}
                                displayTransform={displayTransform}
                              />
                            </Grid>
                          ),
                        )}
                      </Grid>
                    )}
                    <ClinicalHistory
                      clinicalHistory={clinicalHistory}
                      readonly
                      isArchive
                    />
                  </Box>
                </ScrollableSection>
              )}
            />
          ) : (
            <div />
          ))}
      </AnalysisSetContext.Consumer>
    </AnalysisSetProvider>
  );
}
