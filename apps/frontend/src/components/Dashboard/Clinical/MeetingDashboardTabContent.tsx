import CustomChip from '@/components/Common/Chip';
import { corePalette } from '@/themes/colours';
import {
  Box,
  IconButton, Table,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';
import { useUser } from '../../../contexts/UserContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { IUser } from '../../../types/Auth/User.types';
import { IClinicalDashboardSample } from '../../../types/Dashboard.types';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import CustomTypography from '../../Common/Typography';
import { AvatarWithBadge } from '../../CustomIcons/AvatarWithBadge';
import TabContentWrapper from '../../PreCurationTabs/TabContentWrapper';
import UsersMenu from '../../UsersMenu/UsersMenu';
import ClinicalDashboardHeader from '../Components/Clinical/ClinicalDashboardHeader';
import ClinicalDashboardRow from '../Components/Clinical/ListItem/ClinicalDashboardRow';
import MeetingEmpty from '../Components/Common/Static/MeetingEmpty';

const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
    width: '100%',
    maxWidth: '100%',
  },
  listWrapper: {
    height: 'calc(100vh - 210px)',
    width: '100%',
  },
  avatarButton: {
    padding: '0px',
    height: 'fit-content',
  },
  chair: {
    display: 'flex',
    gridGap: '16px',
    alignItems: 'center',
    paddingLeft: '32px',
    height: '48px',
  },
}));

interface IProps {
  currentDate?: string;
  isAssignSampleOpen?: boolean;
}

function MeetingDashboardTabContent({
  currentDate,
  isAssignSampleOpen,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { currentUser, loading } = useUser();
  const [usersMenuAnchor, setUsersMenuAnchor] = useState<HTMLElement | null>(null);
  const [chair, setChair] = useState<IUser | null>();

  const fetchDashboardData = useCallback(
    async (page: number, limit: number) => {
      async function fetchDashboardDataFn(
        newPage: number,
        newLimit: number,
      ): Promise<IClinicalDashboardSample[]> {
        const samples = await zeroDashSdk.meetings.getClinicalMeetingSamples(
          currentDate || dayjs(new Date()).format('YYYY-MM-DD'),
          newPage,
          newLimit,
        );

        return samples;
      }

      if (!isAssignSampleOpen && currentUser?.id) {
        const data = await fetchDashboardDataFn(page, limit);
        return data;
      }
      return [];
    },
    [isAssignSampleOpen, currentUser?.id, zeroDashSdk.meetings, currentDate],
  );

  const mapping = useCallback((
    dashboardItem: IClinicalDashboardSample,
    key: number,
    updateSamples?: (sample: IClinicalDashboardSample) => void,
  ): ReactNode => (
    <ClinicalDashboardRow
      key={`${dashboardItem.analysisSetId}_${dashboardItem.patientId}_${dashboardItem.zero2FinalDiagnosis}`}
      data={dashboardItem}
      updateSamples={updateSamples}
      currentDate={currentDate}
    />
  ), [currentDate]);

  const handleAvatarClick = useCallback((
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    setUsersMenuAnchor(event.currentTarget);
  }, []);

  const handleAssignChair = useCallback(async (user: IUser | null): Promise<void> => {
    await zeroDashSdk.meetings.updateClinicalMeetingDashboardChair({
      date: dayjs(currentDate).format('YYYY-MM-DD'),
      chairId: user?.id || null,
    });
    setChair(user);
    setUsersMenuAnchor(null);
  }, [currentDate, zeroDashSdk.meetings]);

  useEffect(() => {
    async function fetchClinicalMeetingChair(): Promise<void> {
      const chairId = currentDate
        ? await zeroDashSdk.meetings.getClinicalMeetingChair(currentDate)
        : null;
      setChair(chairId ? await zeroDashSdk.services.auth.getUserById(chairId) : null);
    }

    fetchClinicalMeetingChair();
  }, [currentDate, fetchDashboardData, zeroDashSdk.meetings, zeroDashSdk.services.auth]);

  return (
    <div className={classes.root}>
      {!currentUser || loading ? (
        <LoadingAnimation />
      ) : (
        <>
          <Box className={classes.chair}>
            <IconButton
              className={classes.avatarButton}
              onClick={(e): void => handleAvatarClick(e)}
            >
              <AvatarWithBadge
                user={chair}
                badgeText=""
                borderStyle={chair ? 'solid' : 'dashed'}
              />
            </IconButton>
            {chair && (
              <CustomTypography fontWeight="bold">
                {`${chair.givenName} ${chair.familyName}`}
              </CustomTypography>
            )}
            <CustomChip
              label="MTB Chair"
              backgroundColour={corePalette.grey30}
              size="medium"
            />
          </Box>
          <Table stickyHeader>
            <TabContentWrapper
              key={chair?.id}
              className={classes.listWrapper}
              fetch={fetchDashboardData}
              beforeMappingContent={
                <ClinicalDashboardHeader />
              }
              mapping={mapping}
              customEmptyContent={
                <MeetingEmpty type="Clinical" meetingDate={currentDate} />
              }
            />
          </Table>
        </>
      )}
      <UsersMenu
        anchorEl={usersMenuAnchor}
        onClose={(): void => setUsersMenuAnchor(null)}
        group="MTBChairs"
        handleUserSelect={handleAssignChair}
        selectedUserId={chair?.id || null}
      />
    </div>
  );
}

export default MeetingDashboardTabContent;
