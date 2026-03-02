import { Box } from '@mui/material';
import clsx from 'clsx';
import { ReactNode, type JSX } from 'react';
import { makeStyles } from '@mui/styles';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IPatient } from '@/types/Patient/Patient.types';
import CustomTypography from '../../../../Common/Typography';

const useStyles = makeStyles(() => ({
  patientDataHeader: {
    fontSize: '12px',
    marginBottom: '5px',
  },
  patientDataText: {
    color: '#022034',
    display: 'flex',
  },
}));

export interface IPatientDataProps {
  label: string;
  value?: any; // TODO - typecast - https://childrenscancerinstitute.atlassian.net/browse/ZDP2-383
  truncate?: boolean;
  className?: string;
  patient?: IPatient;
  analysisSet?: IAnalysisSet;
  displayTransform?: (value: any, patient?: IPatient, analysisSet?: IAnalysisSet) => ReactNode;
}

export default function DiagnosisData({
  label,
  value,
  truncate = false,
  className = '',
  patient,
  analysisSet,
  displayTransform,
}: IPatientDataProps): JSX.Element {
  const classes = useStyles();

  const getContent = (): ReactNode => {
    const displayValue = value ?? '-';
    return displayTransform
      ? displayTransform(displayValue, patient, analysisSet)
      : displayValue;
  };

  return (
    <Box className={clsx(className)}>
      <CustomTypography variant="label" className={classes.patientDataHeader}>
        {label}
      </CustomTypography>
      <CustomTypography variant="bodyRegular" truncate={truncate} className={classes.patientDataText}>
        {getContent()}
      </CustomTypography>
    </Box>
  );
}
