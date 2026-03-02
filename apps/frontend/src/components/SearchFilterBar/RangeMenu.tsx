import {
    FormHelperText,
    Grid,
    IconButton,
    Menu,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { XIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import CustomButton from '../Common/Button';
import OutlinedInput from '../Input/OutlinedTextInput';
import Select from '../Input/Select';

const useStyles = makeStyles(() => ({
  menu: {
    overflowY: 'auto',
  },
  menuItem: {
    height: '48px',
  },
  selectedWrapper: {
    maxHeight: '200px',
    overflowY: 'auto',
  },
  select: {
    paddingBottom: 0,
    paddingTop: 0,
    borderRadius: 8,
  },
  selectButton: {
    height: 40,
    width: 80,
    borderRadius: 4,
    marginTop: 6,
    marginLeft: 10,
  },
  ageLabelFrom: {
    paddingLeft: 24,
    marginTop: 10,
    marginBottom: 14,
  },
  ageLabelTo: {
    paddingLeft: 20,
    marginTop: 10,
    marginBottom: 14,
  },
  crossIcon: {
    width: 24,
    height: 24,
  },
  iconBtn: {
    height: 32,
    width: 32,
    position: 'absolute',
    right: '8px',
    top: '8px',
  },
  applyButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
  },
}));

interface IProps {
  anchorEl: null | HTMLElement;
  setAnchorEl: Dispatch<SetStateAction<null | HTMLElement>>;
  loading: boolean;
  value: number[] | readonly number[];
  onChange: (newRange: number[] | readonly number[]) => void;
  defaultRange: number[] | readonly number[];
  baseUnit?: string;
  getUnitOptions?: () => { name: string; value: string }[];
  convertFromUnit?: (value: number, unit: string) => number
  convertToUnit?: (value: number, unit: string) => number;
  closeParent?: () => void;
  customMinLabel?: string;
  customMaxLabel?: string;
  rangeType?: 'between' | 'outside';
}

export default function RangeMenu({
  anchorEl,
  setAnchorEl,
  loading,
  value,
  onChange,
  defaultRange,
  baseUnit,
  getUnitOptions,
  convertFromUnit,
  convertToUnit,
  closeParent,
  customMinLabel = 'Min',
  customMaxLabel = 'Max',
  rangeType = 'between',
}: IProps): JSX.Element {
  const classes = useStyles();
  const [error, setError] = useState<string>('');

  const [unitVal, setUnitVal] = useState<string | undefined>(baseUnit);
  const [minVal, setMinVal] = useState<number>(
    convertFromUnit && unitVal
      ? convertFromUnit(value[0], unitVal)
      : value[0],
  );
  const [maxVal, setMaxVal] = useState<number>(
    convertFromUnit && unitVal
      ? convertFromUnit(value[1], unitVal)
      : value[1],
  );

  const handleClose = (reason: string): void => {
    if (reason === 'tabKeyDown') return;

    setAnchorEl(null);
    if (reason === 'escapeKeyDown' && closeParent) {
      closeParent();
    }
  };

  const handleApply = (): void => {
    if (minVal > maxVal) {
      setError(`'${customMinLabel}' cannot be greater than '${customMaxLabel}'`);
      return;
    }
    if (minVal < defaultRange[0] && rangeType === 'between') {
      setError(`'${customMinLabel}' cannot be less than ${defaultRange[0]}`);
      return;
    }
    if (maxVal > defaultRange[1] && rangeType === 'between') {
      setError(`'${customMaxLabel}' cannot be greater than ${defaultRange[1]}`);
      return;
    }
    onChange([
      convertToUnit && unitVal ? convertToUnit(minVal, unitVal) : minVal,
      convertToUnit && unitVal ? convertToUnit(maxVal, unitVal) : maxVal,
    ]);
    setError('');
    handleClose('');
  };

  return (
    <Menu
      className={classes.menu}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
      disableRestoreFocus
    >
      <Grid container direction="column" style={{ width: 395, marginTop: '20px', padding: '0px 20px 12px 20px' }}>
        <Grid container justifyContent="space-between" direction="row">
          <Grid size={unitVal ? 4 : 5}>
            <OutlinedInput
              label={customMinLabel}
              value={minVal}
              onChange={(event): void => setMinVal(parseFloat(event.target.value))}
              headerTitle={customMinLabel}
              type="number"
              disabled={loading}
            />
          </Grid>
          <Grid size={unitVal ? 4 : 5}>
            <OutlinedInput
              label={customMaxLabel}
              value={maxVal}
              onChange={(event): void => setMaxVal(parseFloat(event.target.value))}
              headerTitle={customMaxLabel}
              type="number"
              disabled={loading}
            />
          </Grid>
          { unitVal && getUnitOptions && (
            <Grid size={3}>
              <Select
                headerTitle="Unit"
                options={getUnitOptions()}
                value={unitVal}
                onChange={(event): void => setUnitVal(event.target.value as string)}
              />
            </Grid>
          )}
          <IconButton className={classes.iconBtn} onClick={(): void => setAnchorEl(null)}>
            <XIcon />
          </IconButton>
        </Grid>
        <Grid container justifyContent="space-between" direction="row" style={{ marginTop: '10px' }}>
          <Grid size={8} className={classes.errorContainer}>
            {error && <FormHelperText error>{error}</FormHelperText> }
          </Grid>
          <Grid size={3} className={classes.applyButtonContainer}>
            <CustomButton
              variant="bold"
              size="small"
              label="Apply"
              onClick={(): void => handleApply()}
              disabled={loading}
            />
          </Grid>
        </Grid>
      </Grid>
    </Menu>
  );
}
