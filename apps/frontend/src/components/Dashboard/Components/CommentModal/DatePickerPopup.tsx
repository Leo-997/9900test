import CustomButton from '@/components/Common/Button';
import { corePalette } from '@/themes/colours';
import {
  DialogActions,
  DialogContent,
  Dialog as MuiDialog,
  styled,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay/PickersDay';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Dispatch, SetStateAction, useCallback, useEffect, useState, type JSX } from 'react';
import { useZeroDashSdk } from '../../../../contexts/ZeroDashSdkContext';
import { DashboardMeetingType } from '../../../../types/Dashboard.types';

const Dialog = styled(MuiDialog)(() => ({
  '& .MuiPaper-root': {
    borderRadius: 16,
    overflowY: 'visible',
    maxWidth: 'fit-content',
    padding: '20px',
  },
}));

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: 16,
    overflowY: 'visible',
    maxWidth: 'fit-content',
  },
}));

interface IProps {
  type: DashboardMeetingType;
  date: Dayjs;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  handleUpdate: (date: Dayjs | null) => void;
}

export default function DatePickerPopup({
  type,
  date,
  open,
  setOpen,
  handleUpdate,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();

  const [assignedDates, setAssignedDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs(date));

  const getCurationMeetingsInAMonth = useCallback(
    async (meetingDate: string): Promise<string[]> => {
      const meetings = await zeroDashSdk.meetings.getCurationMeetings({
        date: meetingDate,
        window: 'month',
        includeAnalysisSets: true,
      });

      return meetings
        .flatMap((meeting) => (meeting.analysisSets || [])
          .filter((a) => a.meetingDate)
          .map((a) => a.meetingDate as string));
    },
    [zeroDashSdk.meetings],
  );

  const getMeetingOnMonth = useCallback(async (month: Dayjs) => {
    const fetchFunction = type === 'Curation'
      ? getCurationMeetingsInAMonth
      : zeroDashSdk.meetings.getClinicalMeetingsInAMonth;
    const onMonthMeeting = await fetchFunction(
      dayjs(month).format('YYYY-MM-DD'),
    );
    setAssignedDates(onMonthMeeting);
  }, [zeroDashSdk.meetings, type, getCurationMeetingsInAMonth]);

  useEffect(() => {
    getMeetingOnMonth(date);
  }, [getMeetingOnMonth, date]);

  const renderDay = ({
    day,
    selected,
    outsideCurrentMonth,
    ...props
  }: PickersDayProps<Dayjs>): JSX.Element => (
    <div style={{ position: 'relative' }}>
      <PickersDay
        day={day}
        selected={selected}
        outsideCurrentMonth={outsideCurrentMonth}
        {...props}
      />
      { !outsideCurrentMonth && assignedDates.some((d) => dayjs(d).isSame(day), 'day') && (
        <div
          style={{
            height: '4px',
            width: '4px',
            borderRadius: '50%',
            background: selected ? corePalette.white : corePalette.green150,
            position: 'absolute',
            bottom: '4px',
            left: 'calc(50% - 2px)',
          }}
        />
      )}
    </div>
  );

  const emptyComponent = (): JSX.Element => <div />;

  return (
    <Dialog
      open={open}
      fullWidth
      classes={{ paper: classes.root }}
    >
      <DialogContent sx={{ margin: 0 }}>
        <StaticDatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          onMonthChange={(d: Dayjs): Promise<void> => getMeetingOnMonth(d)}
          slots={{
            actionBar: emptyComponent,
            toolbar: emptyComponent,
            day: renderDay,
          }}
        />
      </DialogContent>
      <DialogActions sx={{ padding: '0px' }}>
        <CustomButton
          variant="subtle"
          label="Cancel"
          onClick={(): void => setOpen(false)}
        />
        <CustomButton
          variant="bold"
          label="Submit"
          onClick={(): void => {
            handleUpdate(selectedDate);
            setOpen(false);
          }}
        />
      </DialogActions>
    </Dialog>
  );
}
