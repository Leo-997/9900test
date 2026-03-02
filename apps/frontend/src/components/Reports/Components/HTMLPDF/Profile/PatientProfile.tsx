import type { JSX } from 'react';
import { Box, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { useReport } from '../../../../../contexts/Reports/CurrentReportContext';
import { IPatient, IPatientDemographics } from '../../../../../types/Patient/Patient.types';
import { getAgeFromDob } from '../../../../../utils/functions/getAgeFromDob';
import mapEvent from '../../../../../utils/functions/mapEvent';
import LoadingAnimation from '../../../../Animations/LoadingAnimation';
import CustomTypography from '../../../../Common/Typography';
import { getPatientEvents } from '../../../Common/HelperFunctions/getPatientEvents';

const useStyles = makeStyles(() => ({
  title: {
    marginBottom: '8px',
  },
  row: {
    columnGap: '16px',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiBox-root': {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '& *': {
        fontSize: '13px !important',
      },
    },
  },
  headerRow: {
    columnGap: '16px',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiBox-root': {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '& > *': {
        fontSize: '10px !important',
      },
    },
  },
}));

interface IPatientProfileProps {
  patient: IPatient;
  analysisSet: IAnalysisSet;
  demographics?: IPatientDemographics | null;
  isMTB?: boolean;
  mtbDate?: string;
  isRedacted?: boolean;
}

export function PatientProfile({
  patient,
  analysisSet,
  demographics,
  isMTB,
  mtbDate,
  isRedacted,
}: IPatientProfileProps): JSX.Element {
  const classes = useStyles();
  const { patientId } = useReport();

  const getMTBDate = (): string => {
    if (mtbDate) return dayjs(mtbDate).format('DD MMM YYYY');

    return 'N/A';
  };

  return (
    <Grid container direction="column">
      <Grid container direction="row" className={classes.title} justifyContent="space-between">
        <Box width="250px">
          <CustomTypography variant="bodyRegular" fontWeight="bold">
            Patient details
          </CustomTypography>
        </Box>
      </Grid>
      {demographics !== undefined ? (
        <Grid container direction="row" style={{ flexWrap: 'wrap', columnGap: '16px', rowGap: '8px' }}>
          <Box display="flex" flexDirection="column" width="250px">
            <CustomTypography variant="label" style={{ fontSize: '10px' }}>
              Patient Name
            </CustomTypography>
            <CustomTypography variant="bodyRegular" style={{ fontSize: '14px' }} fontWeight="bold">
              {!isRedacted && (
              <span style={{ textTransform: 'capitalize' }}>
                { demographics?.firstName }
                {' '}
                { demographics?.lastName?.toUpperCase() }
              </span>
              )}
            </CustomTypography>
          </Box>
          <Box display="flex" flexDirection="column" width="90px">
            <CustomTypography variant="label" style={{ fontSize: '10px' }}>
              Zero ID
            </CustomTypography>
            <CustomTypography variant="bodyRegular" style={{ fontSize: '14px' }}>
              {patientId}
            </CustomTypography>
          </Box>
          <Box display="flex" flexDirection="column" width="110px">
            <CustomTypography variant="label" style={{ fontSize: '10px' }}>
              Date of Birth
            </CustomTypography>
            <CustomTypography variant="bodyRegular" style={{ fontSize: '14px' }}>
              { demographics?.dateOfBirth
                ? dayjs(demographics.dateOfBirth.replaceAll('-', ' '))
                  .format(
                    isRedacted ? 'YYYY' : 'DD MMM YYYY',
                  )
                : ''}
            </CustomTypography>
          </Box>
          <Box display="flex" flexDirection="column" width="70px">
            <CustomTypography variant="label" style={{ fontSize: '10px' }}>
              Sex
            </CustomTypography>
            <CustomTypography variant="bodyRegular" style={{ fontSize: '14px' }}>
              { patient.sex }
            </CustomTypography>
          </Box>
          <Box display="flex" flexDirection="column" width="100px">
            <CustomTypography variant="label" style={{ fontSize: '10px' }}>
              Age (
              {demographics?.dateOfBirth && getAgeFromDob(demographics).units}
              )
            </CustomTypography>
            <CustomTypography variant="bodyRegular" style={{ fontSize: '14px' }}>
              { demographics?.dateOfBirth && (
                getAgeFromDob(demographics).age
              )}
            </CustomTypography>
          </Box>
          <Box display="flex" flexDirection="column" width="250px">
            <CustomTypography variant="label" style={{ fontSize: '10px' }}>
              Oncologist
            </CustomTypography>
            <CustomTypography variant="bodyRegular" style={{ fontSize: '14px' }}>
              { demographics?.treatingOncologist }
            </CustomTypography>
          </Box>
          <Box display="flex" flexDirection="column" width="302px">
            <CustomTypography variant="label" style={{ fontSize: '10px' }}>
              Site
            </CustomTypography>
            <CustomTypography variant="bodyRegular" style={{ fontSize: '14px' }}>
              { demographics?.site }
            </CustomTypography>
          </Box>
          <Box display="flex" flexDirection="column" width="250px">
            <CustomTypography variant="label" style={{ fontSize: '10px' }}>
              Pathologist
            </CustomTypography>
            <CustomTypography variant="bodyRegular" style={{ fontSize: '14px' }}>
              {
                demographics?.pathologist
                  ? demographics?.pathologist
                  : ''
              }
            </CustomTypography>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            minHeight="41px"
            minWidth="302px"
            maxWidth={isMTB ? '302px' : '402px'}
          >
            <CustomTypography variant="label" style={{ fontSize: '10px' }}>
              Histological diagnosis
            </CustomTypography>
            <CustomTypography variant="bodyRegular" style={{ fontSize: '14px' }}>
              { demographics?.histologicalDiagnosis || '' }
            </CustomTypography>
          </Box>
          {isMTB && (
          <Box display="flex" flexDirection="column" width="100px">
            <CustomTypography variant="label" style={{ fontSize: '10px' }}>
              MTB Date
            </CustomTypography>
            <CustomTypography variant="bodyRegular" style={{ fontSize: '14px' }}>
              {getMTBDate()}
            </CustomTypography>
          </Box>
          )}
          <Box display="flex" flexDirection="column" width="250px">
            <CustomTypography variant="label" style={{ fontSize: '10px' }}>
              Cohort
            </CustomTypography>
            <CustomTypography variant="bodyRegular" style={{ fontSize: '14px' }}>
              { analysisSet.cohort || '' }
            </CustomTypography>
          </Box>
          <Box display="flex" flexDirection="column" width="402px">
            <CustomTypography variant="label" style={{ fontSize: '10px' }}>
              Events
            </CustomTypography>
            <CustomTypography variant="bodyRegular" style={{ fontSize: '14px' }}>
              { demographics?.events ? (
                getPatientEvents(demographics.events)
              ) : (
                <>
                  {mapEvent(analysisSet.sequencedEvent || '')}
                  {' '}
                  {
                        analysisSet.sequencedEvent
                        && analysisSet.sequencedEvent[analysisSet.sequencedEvent.length - 1]
                      }
                </>
              )}
            </CustomTypography>
          </Box>
        </Grid>
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="150px"
        >
          <Box width="fit-content" height="fit-content">
            <LoadingAnimation msg="Loading the data from Clinical One..." />
          </Box>
        </Box>
      )}
    </Grid>
  );
}
