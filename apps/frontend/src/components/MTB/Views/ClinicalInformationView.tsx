import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import CustomTypography from '@/components/Common/Typography';
import SlideHeader from './Components/Common/SlideHeader';
import { DiagnosisDetailsCard } from './Components/Diagnosis/DiagnosisDetailsCard';
import { useClinical } from '../../../contexts/ClinicalContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import ClinicalHistory from './Components/ClinicalHistory/ClinicalHistory';
import SlideBase from './Components/Common/SlideBase';

import type { JSX } from "react";

interface IProps {
  isPresentationMode: boolean;
  className?: string;
}

export default function ClinicalInformationView({
  isPresentationMode,
  className,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    clinicalVersion,
    isReadOnly,
    isAssignedCurator,
    isAssignedClinician,
    updateClinicalHistory,
  } = useClinical();

  const canViewPatientInfo = useIsUserAuthorised('report.read');
  const canEditClinicalHistory = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician);

  const handleManualSave = (text: string): void => {
    try {
      zeroDashSdk.mtb.clinical.updateClinicalVersionData(
        clinicalVersion.id,
        { clinicalHistory: text },
      );
      if (updateClinicalHistory) updateClinicalHistory(text);
    } catch (err) {
      enqueueSnackbar('Could not update clinical history, please try again', { variant: 'error' });
    }
  };

  return (
    <SlideBase className={className}>
      <SlideHeader isPresentationMode={isPresentationMode} />
      {canViewPatientInfo ? (
        <>
          <DiagnosisDetailsCard isPresentationMode={isPresentationMode} />
          <Box
            width="100%"
            height="100%"
            minHeight="390px"
            padding="1.2% 32px"
          >
            <ClinicalHistory
              clinicalHistory={clinicalVersion.clinicalHistory}
              readonly={isReadOnly || isPresentationMode || !canEditClinicalHistory}
              onUpdate={handleManualSave}
              isPresentationMode={isPresentationMode}
            />
          </Box>
        </>
      ) : (
        <CustomTypography
          sx={{
            margin: 'auto',
          }}
        >
          You don&apos;t have permission to view the clinical information for patient
          {' '}
          {clinicalVersion.patientId}
        </CustomTypography>
      )}
    </SlideBase>
  );
}
