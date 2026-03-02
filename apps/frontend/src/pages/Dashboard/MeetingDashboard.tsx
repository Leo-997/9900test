import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import { ClinicalMeetingType } from '@/types/Meetings/Meetings.types';
import {
    Box, Grid,
    Menu,
    MenuItem,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { ChevronDown, PlusIcon } from 'lucide-react';
import { ReactNode, useMemo, useState, type JSX } from 'react';
import LoadingAnimation from '../../components/Animations/LoadingAnimation';
import CustomButton from '../../components/Common/Button';
import CustomTypography from '../../components/Common/Typography';
import ClinicalMeetingDashboardTabContent from '../../components/Dashboard/Clinical/MeetingDashboardTabContent';
import AssignSamplePopup from '../../components/Dashboard/Components/CommentModal/AssignSamplePopup';
import DatePickerPopup from '../../components/Dashboard/Components/CommentModal/DatePickerPopup';
import CurationMeetingDashboardTabContent from '../../components/Dashboard/Curation/MeetingDashboardTabContent';
import { useUser } from '../../contexts/UserContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { DashboardMeetingType } from '../../types/Dashboard.types';

const WELCOME_MESSAGE_BAR_HEIGHT = 40;

const useStyles = makeStyles(() => ({
  page: {
    marginTop: 80,
    paddingTop: 20,
    paddingRight: 24,
    paddingLeft: 24,
    backgroundColor: '#FAFBFC',
    height: 'calc(100vh - 80px)',
    width: '100vw',
    overflow: 'hidden',
    display: 'flex',
    borderRadius: '22px 0 0 0',
  },
  pageBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    backgroundColor: corePalette.offBlack200,
    zIndex: -1,
  },
  welcomeMsgBar: {
    height: `${WELCOME_MESSAGE_BAR_HEIGHT}px`,
  },
  content: {
    flexGrow: 1,
    paddingLeft: 24,
    paddingRight: 24,
    marginBottom: 24,
    maxHeight: '100%',
    width: '100%',
  },
  dateButton: {
    backgroundColor: '#6F60E4',
    color: '#ffffff',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      color: '#000000',
      backgroundColor: '#D0D9E2',
    },
    marginLeft: 28,
    height: 44,
    width: 147.99,
    radius: 4,
  },
  dateText: {
    fontSize: '15px',
    fontFamily: 'Roboto',
    paddingRight: '15px',
    textTransform: 'none',
  },
  sampleSection: {
    marginTop: 24,
    maxHeight: `calc(100% - ${WELCOME_MESSAGE_BAR_HEIGHT}px)`,
    width: '100%',
    maxWidth: '100%',
  },
}));

interface IMeetingDashboardPageProps {
  type: DashboardMeetingType;
  date?: string;
}

export default function MeetingDashboardPage({
  type,
  date,
}: IMeetingDashboardPageProps): JSX.Element {
  const { loading } = useUser();
  const classes = useStyles();

  const zeroDashSdk = useZeroDashSdk();

  const [meetingDate, setMeetingDate] = useState(dayjs(date));
  const [changeDateOpen, setChangeDateOpen] = useState<boolean>(false);
  const [isAssignSampleOpen, setIsAssignSampleOpen] = useState<boolean>(false);
  const [
    anchorElClinicalMeetingTypes,
    setAnchorElClinicalMeetingTypes,
  ] = useState<HTMLElement | null>(null);
  const [clinicalMeetingType, setClinicalMeetingType] = useState<ClinicalMeetingType>('MTB');

  const canUpdateCurationDate = useIsUserAuthorised('curation.sample.write');
  const canUpdateMTBDate = useIsUserAuthorised('clinical.sample.write');

  const assignSamples = useMemo((): ((samples: string[]) => Promise<void>) => {
    const assignedDate = meetingDate.format('YYYY-MM-DD');
    if (type === 'Curation') {
      // Curation meeting update function
      return async (analysisSets: string[]) => {
        await zeroDashSdk.meetings.assignCurationMeeting({
          analysisSets,
          date: assignedDate,
        });
      };
    }
    // MTB meeting update function
    return async (clinicalVersions: string[]) => {
      await zeroDashSdk.meetings.assignMultipleClinicalMeetings({
        clinicalVersions,
        date: assignedDate,
        type: clinicalMeetingType,
      });
    };
  }, [clinicalMeetingType, meetingDate, type, zeroDashSdk.meetings]);

  const dashboard = useMemo((): ReactNode => (
    type === 'Curation' ? (
      <CurationMeetingDashboardTabContent
        isAssignSampleOpen={isAssignSampleOpen}
        currentDate={dayjs(meetingDate).format('YYYY-MM-DD')}
      />
    ) : (
      <ClinicalMeetingDashboardTabContent
        currentDate={dayjs(meetingDate).format('YYYY-MM-DD')}
        isAssignSampleOpen={isAssignSampleOpen}
      />
    )
  ), [isAssignSampleOpen, meetingDate, type]);

  return (
    <div className={classes.page}>
      <div className={classes.pageBg} />
      <main className={classes.content}>
        <Grid container direction="row" alignItems="center" justifyContent="space-between">
          <Box
            className={classes.welcomeMsgBar}
            display="flex"
            alignItems="center"
            gap="16px"
          >
            <CustomTypography variant="h3" fontWeight="bold">
              {`${type} Meeting Agenda`}
            </CustomTypography>
            <CustomButton
              variant="outline"
              label={dayjs(meetingDate).format('ddd, DD MMM')}
              endIcon={<ChevronDown />}
              onClick={(): void => {
                setChangeDateOpen(!changeDateOpen);
              }}
            />
          </Box>
          <Box display="flex" gap="16px" alignItems="center">
            <CustomButton
              onClick={
                (e): void => (
                  type === 'Curation'
                    ? setIsAssignSampleOpen(true)
                    : setAnchorElClinicalMeetingTypes(e.currentTarget))
                }
              startIcon={<PlusIcon />}
              label="Add cases"
              variant="bold"
              disabled={
                (type === 'Clinical' && !canUpdateMTBDate)
                || (type === 'Curation' && !canUpdateCurationDate)
              }
            />
          </Box>
        </Grid>
        <Grid className={classes.sampleSection}>
          {loading ? (
            <LoadingAnimation />
          ) : (
            dashboard
          )}
        </Grid>
      </main>
      {changeDateOpen && (
        <DatePickerPopup
          type={type}
          date={meetingDate}
          open={changeDateOpen}
          setOpen={setChangeDateOpen}
          handleUpdate={(newDate): void => setMeetingDate(dayjs(newDate))}
        />
      )}
      {isAssignSampleOpen && (
        <AssignSamplePopup
          date={dayjs(meetingDate).format('YYYY-MM-DD')}
          type={type}
          clinicalMeetingType={clinicalMeetingType}
          assignSamples={assignSamples}
          isUpdateStatusOpen={isAssignSampleOpen}
          setUpdateStatusOpen={setIsAssignSampleOpen}
        />
      )}
      {type === 'Clinical' && (
        <Menu
          anchorEl={anchorElClinicalMeetingTypes}
          open={Boolean(anchorElClinicalMeetingTypes)}
          onClose={(): void => setAnchorElClinicalMeetingTypes(null)}
          anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
        >
          <MenuItem
            onClick={(): void => {
              setClinicalMeetingType('MTB');
              setIsAssignSampleOpen(true);
              setAnchorElClinicalMeetingTypes(null);
            }}
          >
            MTB
          </MenuItem>
          <MenuItem
            onClick={(): void => {
              setClinicalMeetingType('HTS');
              setIsAssignSampleOpen(true);
              setAnchorElClinicalMeetingTypes(null);
            }}
          >
            HTS
          </MenuItem>
        </Menu>
      )}
    </div>
  );
}
