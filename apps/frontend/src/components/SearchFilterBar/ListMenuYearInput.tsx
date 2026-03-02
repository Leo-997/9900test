import {
  Box, Popover,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Dispatch, SetStateAction, useEffect, useRef, useState, type JSX } from 'react';
import CustomButton from '../Common/Button';

const useStyles = makeStyles(() => ({
  menu: {
    overflowY: 'auto',
    width: '100%',
    padding: '8px',
  },
  dateSelectContainer: {
    height: '44px',
    width: '100px',
  },
  datePickerPopover: {
    zIndex: 1300,
    top: '8px !important',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0px 10px 24px 0px rgba(18, 47, 92, 0.12)',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiPickersYear-root': {
      width: '100px',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiPickersBasePicker-pickerView': {
      minWidth: '100px',
    },
    '& .MuiPickersYearSelection-container': {
      overflowX: 'hidden',
    },
    '& .MuiPickersStaticWrapper-staticWrapperRoot': {
      minWidth: '100px',
    },
  },
}));

interface IListMenuYearInputProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: Dispatch<SetStateAction<null | HTMLElement>>;
  currentFilterValue: number | null;
  handleApplyFilter: (newYear: number | null) => void;
  loading?: boolean;
}

export default function ListMenuYearInput({
  anchorEl,
  setAnchorEl,
  currentFilterValue,
  handleApplyFilter,
  loading,
}: IListMenuYearInputProps): JSX.Element {
  const classes = useStyles();

  const [year, setYear] = useState<number | null>(null);
  const [yearPopperAnchor, setYearPopperAnchor] = useState<null | HTMLElement>(null);

  const popperRef = useRef<HTMLDivElement>(null);

  useEffect((): void => {
    setYear(currentFilterValue);
  }, [currentFilterValue]);

  // useEffect responsible for handling clicks outside the Popper component but inside Popover.
  // Clicks outside Popper and outside Popover are handle on Popover's onClose prop.
  useEffect(() => {
    const handleClickOutsidePopper = (event): void => {
      if (popperRef.current && !popperRef.current.contains(event.target)) {
        setYearPopperAnchor(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutsidePopper);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutsidePopper,
      );
    };
  }, []);

  const handleOnChangeYear = (value: number): void => {
    if (value > dayjs().year()) {
      setYear(dayjs().year());
    } else if (String(value).length === 4 && value < 1900) {
      setYear(1900);
    } else {
      setYear(value);
    }
  };

  const handleSubmit = (): void => {
    if (
      (
        (year && (year >= 1900 || year <= dayjs().year()))
        || year === null
      )
        && year !== currentFilterValue
    ) {
      handleApplyFilter(year);
      setYearPopperAnchor(null);
      setAnchorEl(null);
    }
  };

  return (
    <Popover
      className={classes.menu}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      open={Boolean(anchorEl)}
      onClose={(): void => {
        setYearPopperAnchor(null);
        setAnchorEl(null);
      }}
      slotProps={{
        paper: {
          style: {
            width: '340px',
            padding: '8px',
          },
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
      >
        <DatePicker
          onChange={(newDate): void => handleOnChangeYear(Number(newDate?.format('YYYY')))}
          value={dayjs(year?.toString())}
          format="YYYY"
          maxDate={dayjs()}
          slotProps={{
            inputAdornment: {
              sx: {
                position: 'relative',
                top: '-4px',
              },
            },
            popper: {
              sx: {
                '& .MuiDateCalendar-root': {
                  height: 'auto',
                },
              },
            },
            textField: {
              error: false,
            },
          }}
          views={['year']}
          disabled={loading}
        />
        <Box
          display="flex"
          alignContent="center"
          gap=" 16px"
          flexDirection="column"
          alignItems="flex-end"
        >
          <CustomButton
            size="small"
            label="Clear"
            variant="subtle"
            onClick={(): void => setYear(null)}
            disabled={loading}
          />
          <CustomButton
            size="small"
            variant="bold"
            label="Apply Filter"
            onClick={():void => handleSubmit()}
            disabled={
              currentFilterValue === year
              || (year && (year < 1900 || year > dayjs().year()))
              || loading
            }
          />
        </Box>
      </Box>
    </Popover>
  );
}
