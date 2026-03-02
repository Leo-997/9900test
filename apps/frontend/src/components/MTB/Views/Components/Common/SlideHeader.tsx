import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { usePatient } from '@/contexts/PatientContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import Gender from '@/components/VitalStatus/Gender';
import { getAgeFromDob } from '../../../../../utils/functions/getAgeFromDob';
import CustomTypography from '../../../../Common/Typography';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  parentBox: {
    padding: '0.9% 32px',
    width: '100%',
    minWidth: '936px',
    position: 'sticky',
    top: 0,
    backgroundColor: corePalette.white,
    borderRadius: '8px',
    zIndex: 500,
  },
  iconBox: {
    height: '32px',
    width: '32px',
    borderRadius: '4px',
    paddingLeft: '8px',
  },
}));

interface IProps {
  isPresentationMode: boolean;
}

export default function SlideHeader({
  isPresentationMode,
}: IProps): JSX.Element {
  const classes = useStyles();
  const { patient } = usePatient();
  const { demographics, analysisSet } = useAnalysisSet();

  const canViewPatientInfo = useIsUserAuthorised('report.read');

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="flex-start"
      justifyContent="flex-start"
      // slide-header class used for MTB export
      className={clsx(classes.parentBox, 'slide-header')}
    >
      <Box
        display="flex"
        flexDirection="column"
        minWidth="fit-content"
        marginRight="auto"
        alignItems="space-between"
      >
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap="16px"
        >
          <CustomTypography
            variant="h5"
            tooltipText={
              !canViewPatientInfo
              && `You don't have permission to view the name and age of patient ${patient.patientId}`
            }
          >
            {!canViewPatientInfo ? (
              'REDACTED'
            ) : (
              <>
                {demographics?.firstName}
                {' '}
                {demographics?.lastName?.toUpperCase()}
                ,
                {' '}
                {demographics && (
                  `${getAgeFromDob(demographics).age} ${getAgeFromDob(demographics).units.toLowerCase()}`
                )}
              </>
            )}
          </CustomTypography>
          {patient.vitalStatus && patient.sex && (
            <Gender vitalStatus={patient.vitalStatus} gender={patient.sex} />
          )}
        </Box>
        <CustomTypography
          variant="bodyRegular"
          color={corePalette.grey100}
        >
          {analysisSet?.zero2FinalDiagnosis}
        </CustomTypography>
      </Box>
      {isPresentationMode && (
        <CustomTypography variant="h5" color={corePalette.grey100}>
          {patient.patientId}
        </CustomTypography>
      )}
    </Box>
  );
}
