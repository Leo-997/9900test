import { corePalette } from '@/themes/colours';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { DashboardMeetingType } from '@/types/Dashboard.types';
import CustomTypography from '../../../../Common/Typography';
import EmptyMeetingDashboard from '../../../../CustomIcons/EmptyMeetingDashboard';

import type { JSX } from "react";

interface IProps {
  type: DashboardMeetingType;
  meetingDate?: string;
}

export default function MeetingEmpty({
  type,
  meetingDate,
}: IProps): JSX.Element {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <EmptyMeetingDashboard />
      <CustomTypography
        variant="bodyRegular"
        style={{
          fontSize: '14px',
          fontFamily: 'Roboto',
          color: corePalette.grey100,
        }}
      >
        {type}
        {' '}
        meeting hasn&apos;t been set for this date.
      </CustomTypography>

      <CustomTypography
        variant="bodyRegular"
        style={{
          fontSize: '14px',
          fontFamily: 'Roboto',
          color: corePalette.grey100,
        }}
      >
        To start a
        {' '}
        {type}
        {' '}
        meeting for&nbsp;
        {dayjs(meetingDate).format('dddd Do of MMMM')}
        , add cases to
        be reviewed
      </CustomTypography>
    </Box>
  );
}
