import { corePalette } from '@/themes/colours';
import {
  Box,
  Divider,
  Dialog as MuiDialog,
  DialogContent as MuiDialogContent,
  styled,
} from '@mui/material';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay/PickersDay';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Dispatch, SetStateAction, useCallback, useEffect, useState, type JSX } from 'react';
import CustomButton from '../../../Common/Button';
import CustomTypography from '../../../Common/Typography';

const Dialog = styled(MuiDialog)(() => ({
  '& .MuiPaper-root': {
    borderRadius: 16,
    margin: 0,
    fontSize: '14px',
    width: 'auto',
    padding: '20px',
  },
}));

const DialogContent = styled(MuiDialogContent)(() => ({
  width: '100%',
  margin: '0px',
}));

interface IProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  updateSamples: (newDate: Dayjs | null) => Promise<void>;
  fetchMeetingsInMonth: (date: string) => Promise<string[]>;
  date?: string | null;
}

export default function AssignMeetingDate({
  open,
  setOpen,
  date,
  fetchMeetingsInMonth,
  updateSamples,
}: IProps): JSX.Element {
  const [assignedDates, setAssignedDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

  const getMeetingOnMonth = useCallback(async (month: Dayjs) => {
    const onMonthMeeting = await fetchMeetingsInMonth(
      dayjs(month).format('YYYY-MM-DD'),
    );
    setAssignedDates(onMonthMeeting);
  }, [fetchMeetingsInMonth]);

  useEffect(() => {
    getMeetingOnMonth(dayjs());
  }, [getMeetingOnMonth]);

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
    >
      <DialogContent>
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
        <Divider />
        <Box display="flex" flexDirection="column" gap="16px">
          { date && (
            <Box
              display="flex"
              flexDirection="row"
              marginTop="20px"
            >
              <CustomTypography variant="bodyRegular" fontWeight="medium">
                Change from&nbsp;
              </CustomTypography>
              <CustomTypography variant="bodyRegular" color="primary" fontWeight="medium">
                {` ${dayjs(date).format('ddd')}`}
                {`, ${dayjs(date).format('MMM')} ${dayjs(
                  date,
                ).format('DD')}`}
              </CustomTypography>
              <CustomTypography variant="bodyRegular" fontWeight="medium">
                <div>&nbsp;to</div>
              </CustomTypography>
            </Box>
          )}
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            bgcolor={corePalette.grey10}
            border={`1px solid ${corePalette.grey30}`}
            borderRadius="8px"
            marginTop={date ? 0 : '16px'}
            alignItems="center"
            padding="8px"
          >
            <CustomTypography
              variant="bodyRegular"
              fontWeight="medium"
              color={corePalette.green150}
            >
              {
                dayjs(selectedDate).isSame(dayjs(), 'day')
                  ? 'Today'
                  : dayjs(selectedDate).format('ddd')
              }
              {dayjs(selectedDate).format(', MMM DD')}
            </CustomTypography>
            <CustomTypography
              variant="label"
              sx={{ padding: '4px 8px', backgroundColor: corePalette.grey30, borderRadius: '24px' }}
            >
              {
                assignedDates.filter((d) => selectedDate?.isSame(dayjs(d), 'day')).length
              }
              &nbsp;
              {
                assignedDates.filter((d) => selectedDate?.isSame(dayjs(d), 'day')).length === 1
                  ? 'CASE'
                  : 'CASES'
              }
            </CustomTypography>
          </Box>
          <Box
            display="flex"
            flexDirection="row-reverse"
            justifyContent="space-between"
          >
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="flex-end"
            >
              <CustomButton
                style={{ width: '84px' }}
                variant="subtle"
                size="medium"
                label="Cancel"
                onClick={(): void => setOpen(false)}
              />
              <CustomButton
                style={{ width: '84px', marginLeft: 8 }}
                variant="bold"
                size="medium"
                label="Assign"
                onClick={(): Promise<void> => updateSamples(selectedDate)}
              />
            </Box>
            {date && (
              <CustomButton
                variant="warning"
                size="medium"
                label="Remove"
                onClick={(): Promise<void> => updateSamples(null)}
              />
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
