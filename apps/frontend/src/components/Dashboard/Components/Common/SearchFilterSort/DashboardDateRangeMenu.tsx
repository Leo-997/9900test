import {
  Box,
  Divider,
  Menu,
  styled,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react';
import { DateRange } from '../../../../../types/Search.types';
import CustomButton from '../../../../Common/Button';
import CustomTypography from '../../../../Common/Typography';
import SelectInput from '../../../../Input/Select';

const Row = styled(Box)(({ theme }) => ({
  minWidth: '350px',
  padding: '16px',
  width: '100%',
  backgroundColor: theme.colours.core.white,
}));

const useStyles = makeStyles(() => ({
  menu: {
    overflowY: 'auto',
  },
  typeSelect: {
    margin: '8px 0px',
    padding: '6px 16px',
    minWidth: '350px',
  },
  dateSelectContainer: {
    width: '100%',
    minWidth: '350px',
  },
  input: {
    height: '36px',
  },
  dateMessageSection: {
    margin: 'auto',
    marginTop: '8px',
    backgroundColor: '#F3F7FF',
    width: 'fit-content',
    padding: '8px 16px',
    borderRadius: '4px',
  },
  buttonSection: {
    marginTop: '8px',
  },
}));

interface IDashboardDateRangeMenuProps {
  anchorElDateRange: null | HTMLElement;
  setAnchorElDateRange: Dispatch<SetStateAction<null | HTMLElement>>;
  date: (string | undefined)[];
  setDate: (date: DateRange) => void;
  closeParent?: () => void;
}

export default function DashboardDateRangeMenu({
  anchorElDateRange,
  setAnchorElDateRange,
  date,
  setDate,
  closeParent,
}: IDashboardDateRangeMenuProps): JSX.Element {
  const classes = useStyles();
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    let type: DateRange['type'] = 'Between';
    if (!date[1] && date[0]) type = 'After';
    if (!date[0] && date[1]) type = 'Before';

    return {
      type,
      startDate: date[0] ? date[0] : dayjs().format('YYYY-MM-DD').toString(),
      endDate: date[1] ? date[1] : dayjs().format('YYYY-MM-DD').toString(),
    };
  });

  const [message, setMessage] = useState<string>('');

  const handleTypeChange = (event): void => {
    setDateRange({
      ...dateRange,
      type: event.target.value,
    });
  };

  const handleStartDateChange = (newDate): void => {
    setDateRange({
      ...dateRange,
      startDate: newDate.format('YYYY-MM-DD').toString(),
    });
  };

  const handleEndDateChange = (newDate): void => {
    setDateRange({
      ...dateRange,
      endDate: newDate.format('YYYY-MM-DD').toString(),
    });
  };

  const handleApply = (): void => {
    if (dateRange.type !== 'Between'
          || !dayjs(dateRange.endDate).isBefore(dayjs(dateRange.startDate))) {
      const newDateRange: DateRange = {
        type: dateRange.type,
        startDate: dateRange.type === 'Before' ? '' : dateRange.startDate,
        endDate: dateRange.type === 'After' ? '' : dateRange.endDate,
      };
      setDate(newDateRange);
      setAnchorElDateRange(null);
      if (closeParent) closeParent();
    }
  };

  const handleClear = (): void => {
    setDate({
      type: '',
      startDate: '',
      endDate: '',
    });
    setAnchorElDateRange(null);
    if (closeParent) closeParent();
  };

  const handleClose = (event, reason): void => {
    setAnchorElDateRange(null);
    if (reason === 'escapeKeyDown' && closeParent) {
      closeParent();
    }
  };

  const dateRangeTypeOptions = [
    { name: 'Between', value: 'Between' },
    { name: 'At or Before', value: 'Before' },
    { name: 'At or After', value: 'After' },
  ];

  useEffect(() => {
    const format = 'DD MMM YYYY';
    if (dateRange.type === 'Between') {
      setMessage(`From ${dayjs(dateRange.startDate).format(format)} to ${dayjs(dateRange.endDate).format(format)}`);
    } else if (dateRange.type === 'After') {
      setMessage(`At or after ${dayjs(dateRange.startDate).format(format)}`);
    } else {
      setMessage(`At or before ${dayjs(dateRange.endDate).format(format)}`);
    }
  }, [dateRange]);

  return (
    <Menu
      className={classes.menu}
      anchorEl={anchorElDateRange}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      keepMounted
      open={Boolean(anchorElDateRange)}
      onClose={handleClose}
      disableRestoreFocus
    >
      <SelectInput
        inputContainerClassName={classes.typeSelect}
        headerTitle="Filter Type"
        placeholder="Select type"
        options={dateRangeTypeOptions}
        onChange={handleTypeChange}
        value={dateRange.type}
      />
      <Divider />
      {dateRange.type !== 'Before' && (
        <Row>
          <DatePicker
            className={classes.dateSelectContainer}
            onChange={handleStartDateChange}
            value={dateRange.startDate ? dayjs(dateRange.startDate) : dayjs()}
            label="Start Date"
            format="DD/MM/YYYY"
            slotProps={{
              inputAdornment: {
                sx: {
                  position: 'relative',
                  top: '-4px',
                },
              },
            }}
          />
        </Row>
      )}
      {dateRange.type !== 'After' && (
        <Row>
          <DatePicker
            className={classes.dateSelectContainer}
            onChange={handleEndDateChange}
            value={dateRange.endDate ? dayjs(dateRange.endDate) : dayjs()}
            format="DD/MM/YYYY"
            minDate={dateRange.type === 'Between' ? dayjs(dateRange.startDate) : undefined}
            slotProps={{
              inputAdornment: {
                sx: {
                  position: 'relative',
                  top: '-4px',
                },
              },
            }}
          />
        </Row>
      )}
      <Divider />
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="center"
        className={classes.dateMessageSection}
      >
        <CustomTypography
          variant="bodyRegular"
          style={{
            fontSize: 16,
            fontFamily: 'Roboto',
            color: '#1E86FC',
            fontWeight: 'bold',
          }}
        >
          {message}
        </CustomTypography>
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-end"
        className={classes.buttonSection}
      >
        <CustomButton
          style={{ width: '84px', marginRight: '8px' }}
          variant="subtle"
          size="small"
          label="Clear"
          onClick={handleClear}
        />
        <CustomButton
          style={{ width: '84px', right: '8px', marginLeft: '8px' }}
          variant="bold"
          size="small"
          label="Apply"
          onClick={handleApply}
        />
      </Box>
    </Menu>
  );
}
