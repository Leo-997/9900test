import CustomTypography from '@/components/Common/Typography';
import {
  Box, Card, Divider, Popover,
  Tooltip,
} from '@mui/material';
import { useState } from 'react';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useSnackbar } from 'notistack';
import dayjs, { Dayjs } from 'dayjs';
import { corePalette } from '@/themes/colours';
import UsersSectionListItem from '@/components/TaskDashboard/Content/ListItem/StageProgressModal/UsersSection/UsersSectionListItem';
import CustomButton from '@/components/Common/Button';
import { CalendarIcon } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { IUser } from '@/types/Auth/User.types';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { ClinicalMeetingType, IClinicalMeeting } from '@/types/Meetings/Meetings.types';
import AssignMeetingDate from '../../CommentModal/AssignMeetingDate';

interface IProps {
  anchorEl: HTMLElement | null,
  onClose: () => void,
  clinicalMeetings: IClinicalMeeting[];
  updateClinicalMeetingChair: (
    type: ClinicalMeetingType,
    newUser: IUser | null,
  ) => Promise<void>;
  updateClinicalMeetingDate: (
    type: ClinicalMeetingType,
    newDate: Dayjs | null,
  ) => Promise<void>;
}

export function ClinicalMeetingModal({
  anchorEl,
  onClose,
  clinicalMeetings,
  updateClinicalMeetingChair,
  updateClinicalMeetingDate,
}: IProps): React.JSX.Element {
  const { users } = useUser();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();

  const [isAssignDateOpen, setAssignDateOpen] = useState<boolean>(false);
  const [meetingType, setMeetingType] = useState<ClinicalMeetingType>('MTB');

  const canAssignUser = useIsUserAuthorised('clinical.sample.write');

  const handleAssignMeetingDate = async (newDate: Dayjs | null): Promise<void> => {
    try {
      await updateClinicalMeetingDate(meetingType, newDate);
      setAssignDateOpen(false);
      enqueueSnackbar('Meeting assigned successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Unable to update the date', { variant: 'error' });
    }
  };

  const htsMeeting = clinicalMeetings.find((r) => r.type === 'HTS');
  const mtbMeeting = clinicalMeetings.find((r) => r.type === 'MTB');

  return (
    <>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Card>
          <Box
            display="flex"
            flexDirection="column"
            padding="16px"
            gap="8px"
          >
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <CustomTypography variant="bodyRegular">
                <span>
                  {'MTB meeting: '}
                </span>
                <span style={{ fontWeight: 'bold' }}>
                  {mtbMeeting?.date ? dayjs(mtbMeeting?.date).format('DD/MM/YYYY') : '-'}
                </span>
              </CustomTypography>
              <CustomButton
                label="Update"
                variant="text"
                startIcon={<CalendarIcon />}
                disableElevation
                sx={{ height: '32px' }}
                onClick={():void => {
                  setMeetingType('MTB');
                  setAssignDateOpen(true);
                }}
              />
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <CustomTypography variant="bodyRegular">
                <span>
                  {'HTS meeting: '}
                </span>
                <span style={{ fontWeight: 'bold' }}>
                  {htsMeeting?.date ? dayjs(htsMeeting?.date).format('DD/MM/YYYY') : '-'}
                </span>
              </CustomTypography>
              <CustomButton
                label="Update"
                variant="text"
                startIcon={<CalendarIcon />}
                disableElevation
                sx={{ height: '32px' }}
                onClick={():void => {
                  setMeetingType('HTS');
                  setAssignDateOpen(true);
                }}
              />
            </Box>
          </Box>
          <Divider />
          <Box
            display="flex"
            flexDirection="column"
            gap="8px"
            sx={{ padding: '16px' }}
          >
            <CustomTypography
              sx={{
                color: corePalette.grey100,
                fontWeight: '500',
              }}
            >
              Assignees
            </CustomTypography>
            <Tooltip
              title="Add a meeting date before assigning a chair"
              disableHoverListener={Boolean(mtbMeeting)}
              placement="top"
            >
              <span>
                <UsersSectionListItem
                  group="MTBChairs"
                  assignedUser={{
                    key: `$MTB-Chair-${mtbMeeting?.chairId}`,
                    user: users.find((u) => u.id === mtbMeeting?.chairId),
                    title: 'MTB Chair',
                  }}
                  disabled={!canAssignUser || !mtbMeeting}
                  onUpdate={(user): void => {
                    updateClinicalMeetingChair('MTB', user);
                  }}
                />
              </span>
            </Tooltip>
            <Tooltip
              title="Add a meeting date before assigning a chair"
              disableHoverListener={Boolean(htsMeeting)}
              placement="top"
            >
              <span>
                <UsersSectionListItem
                  group="MTBChairs"
                  assignedUser={{
                    key: `HTS-Chair-${htsMeeting?.chairId}`,
                    user: users.find((u) => u.id === htsMeeting?.chairId),
                    title: 'HTS MTB Chair',
                  }}
                  disabled={!canAssignUser || !htsMeeting}
                  onUpdate={(user): void => {
                    updateClinicalMeetingChair('HTS', user);
                  }}
                />
              </span>
            </Tooltip>
          </Box>
        </Card>
      </Popover>
      {isAssignDateOpen && (
        <AssignMeetingDate
          date={clinicalMeetings.find(({ type }) => type === meetingType)?.date}
          fetchMeetingsInMonth={zeroDashSdk.meetings.getClinicalMeetingsInAMonth}
          open={isAssignDateOpen}
          setOpen={setAssignDateOpen}
          updateSamples={handleAssignMeetingDate}
        />
      )}
    </>
  );
}
