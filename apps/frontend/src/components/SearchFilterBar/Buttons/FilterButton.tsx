import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  MenuItem as MuiMenuItem,
  Popover,
  styled,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  ArrowRightCircleIcon, ChevronDown, CirclePlusIcon, InfoIcon, SlidersHorizontalIcon,
} from 'lucide-react';
import {
  Dispatch, Fragment, SetStateAction, useEffect, useState, type JSX,
} from 'react';
import { corePalette } from '@/themes/colours';
import { FilterOption, SearchOptions } from '../../../types/Search.types';
import CustomButton from '../../Common/Button';
import CustomChip from '../../Common/Chip';
import CustomTypography from '../../Common/Typography';
import ClearFiltersButton from './ClearFiltersButton';

interface IStyleProps {
  isCompressed?: boolean;
}

const MenuItem = styled(MuiMenuItem)(({ theme }) => ({
  height: '48px',
  display: 'flex',
  justifyContent: 'space-between',
  '&:hover': {
    backgroundColor: theme.colours.core.grey10,
  },
}));

const ClearFiltersContainer = styled(MenuItem)({
  padding: '0',
  margin: '0',
  '&.Mui-disabled': {
    opacity: 1,
  },
});

const Wrapper = styled(Box)<IStyleProps>(({ isCompressed }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingLeft: isCompressed ? '5px' : '8px',
  flexWrap: 'nowrap',
  gap: '8px',
}));

const useStyles = makeStyles(() => ({
  menu: {
    padding: '0 !important',
  },
  scrollableSection: {
    maxHeight: '700px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '0px',
    },
  },
  geneIcons: {
    width: '25px',
    height: '25px',
  },
  clearBtnContainer: {
    padding: '0',
    margin: '0',
    '&:hover': {
      backgroundColor: 'none',
    },
  },
  subMenuBtn: {
    width: '100%',
    height: '100%',
    padding: '0 0px 0 16px',
    textTransform: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkboxArrayTypes: {
    marginLeft: 16,
  },
  selectBtn: {
    marginLeft: 'auto',
  },
}));

const uncombinableFilters = ['enrolledOnlyCases', 'withdrawnCases'] as const;
type UncombinableFilters = typeof uncombinableFilters[number];

interface IFilterButtonProps<T extends SearchOptions> {
  toggled: T;
  setToggled: (toggled: T) => void;
  clearFilters: (newValue?: UncombinableFilters) => void;
  filterOptions: FilterOption[];
  loading?: boolean;
  setLoading?: Dispatch<SetStateAction<boolean>>;
  defaultFilter?: boolean;
  isCompressed?: boolean;
  disabled?: boolean;
}

export default function FilterButton<T extends SearchOptions>({
  toggled,
  setToggled,
  clearFilters,
  filterOptions,
  loading,
  setLoading,
  defaultFilter,
  isCompressed = false,
  disabled = false,
}: IFilterButtonProps<T>): JSX.Element {
  const classes = useStyles({ isCompressed });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [total, setTotal] = useState<number>(0);

  const isUncombinableFilter = (k: string): k is UncombinableFilters => (
    uncombinableFilters as readonly string[]
  ).includes(k);

  const handleArraySelect = (key: string, value: string): void => {
    const array = toggled[key] || [];
    const index = array.indexOf(value);

    if (index > -1) {
      array.splice(index, 1);
    } else {
      array.push(value);
    }
    setToggled({
      ...toggled,
      [key]: array,
    });
  };

  // Update the toggled state
  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>, defaultVal: unknown): void => {
    const [key, val] = event.target.value.split(':');

    if (key === 'assigneeAndStatus') {
      setToggled({
        ...toggled,
        stage: undefined,
        statuses: [],
        assignees: [],
      });
      return;
    }

    if (val) {
      handleArraySelect(key, val);
      return;
    }

    const value = toggled[key];

    if (defaultVal) {
      setToggled({ ...toggled, [key]: defaultVal });
    } else if (event.target.checked) {
      if (value === undefined || value.constructor === Boolean) {
        // Empty other options if these filters are toggled on
        if (isUncombinableFilter(key)) {
          clearFilters(key);
          return;
        }
        setToggled({ ...toggled, [key]: true });
      }
    } else if (key === 'year') {
      setToggled({ ...toggled, [key]: null });
    } else if (value === undefined || value === null) {
      setToggled({ ...toggled, [key]: value });
    } else if (value.constructor === Boolean) {
      setToggled({ ...toggled, [key]: false });
    } else if (value.constructor === Array) {
      setToggled({ ...toggled, [key]: [] });
    } else if (value.constructor === Object) {
      setToggled({ ...toggled, [key]: {} });
    } else if (value.constructor === Number) {
      setToggled({ ...toggled, [key]: -1 });
    }
  };

  useEffect(() => {
    let subTotal = 0;
    Object.keys(toggled).forEach((key) => {
      // Excluded
      if (
        [
          'searchId',
          'meetingDate',
          'genesearchquery',
          'sortColumns',
          'sortDirections',
        ].includes(key)) {
        return;
      }
      const value = toggled[key];

      // Exceptions
      if (['gender', 'vitalStatus'].includes(key)) {
        subTotal += value.length;
        return;
      }

      if (value === undefined || value === null) {
        return;
      }

      // Booleans
      if (value.constructor === Boolean) {
        if (value) subTotal += 1;
      }

      // Numbers
      if (typeof value === 'number') {
        if (value >= 0) subTotal += 1;
      }

      // Arrays
      if (value && value.constructor === Array) {
        if (value.length > 0) subTotal += 1;
        return;
      }

      // Objects
      if (value && value.constructor === Object) {
        // Date Range
        if (value.type !== undefined && value.type !== '') {
          subTotal += 1;
          return;
        }
        // Range Menu
        if (
          (value.min !== undefined && value.max !== undefined)
          && (value.min > value.defaults[0] || value.max < value.defaults[1])
        ) {
          subTotal += 1;
        }
      }
    });
    setTotal(subTotal);
  }, [setTotal, toggled, loading]);

  return (
    <Wrapper>
      {/* Base Filter button */}
      <CustomButton
        onClick={(e): void => setAnchorEl(e.currentTarget)}
        variant={total > 0 ? 'subtle' : 'text'}
        size="small"
        disabled={disabled}
        startIcon={!isCompressed && (
          <SlidersHorizontalIcon />
        )}
        endIcon={<ChevronDown />}
        label={(
          <>
            <CustomTypography variant="bodySmall" color="inherit">
              Filter
            </CustomTypography>
            {total > 0 && (
              <CustomTypography variant="bodySmall" sx={{ color: corePalette.green200, marginLeft: '8px' }}>
                {total}
              </CustomTypography>
            )}
          </>
        )}
        sx={{
          color: corePalette.offBlack100,
          backgroundColor: total > 0 ? corePalette.green10 : 'inherit',
        }}
      />
      {/* Hidden popup menu with filter options */}
      <Popover
        className={classes.menu}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={(): void => setAnchorEl(null)}
        disableRestoreFocus
      >
        <FormGroup sx={{ gap: '0px' }}>
          <div className={classes.scrollableSection}>
            {filterOptions.map((o) => (
              <Fragment key={o.label}>
                <MenuItem
                  disabled={o.disabled || loading}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '8px',
                  }}
                  onClick={
                    o.submenu
                      ? (e): void => o.setAnchor && o.setAnchor(e.currentTarget)
                      : undefined
                    }
                >
                  <FormControlLabel
                    value={o.value}
                    style={{
                      pointerEvents: o.disableClearing
                        ? 'none'
                        : undefined,
                      cursor: o.disableClearing
                        ? 'default'
                        : undefined,
                    }}
                    control={
                      !o.disabled ? (
                        <Checkbox
                          checked={o.check}
                          onChange={(e): void => {
                            // Should not set loading back to false after handleSelect(),
                            // otherwise TabContentWrapper shows "No more data to load" message
                            // Each variant's fetch function will set loading to false eventually
                            if (setLoading) setLoading(true);
                            handleSelect(e, o.defaultVal);
                          }}
                          onClick={(e): void => e.stopPropagation()}
                        />
                      ) : (
                        <div />
                      )
                    }
                    label={typeof o.label === 'string' ? `${o.label}` : o.label}
                    labelPlacement="end"
                  />
                  {o.check && o.chipLabel && (
                    <CustomChip
                      label={o.chipLabel && o.chipLabel()}
                      colour={corePalette.green200}
                      backgroundColour={corePalette.green10}
                      pill
                      sx={{
                        margin: '0 12px',
                      }}
                    />
                  )}
                  {o.submenu ? (
                    <IconButton
                      onClick={(e): void => o.setAnchor && o.setAnchor(e.currentTarget)}
                      sx={{
                        width: '24px',
                        height: '24px',
                        padding: '0px',
                        marginLeft: 'auto',
                      }}
                    >
                      {o.check ? (
                        <ArrowRightCircleIcon color={corePalette.green150} />
                      ) : (
                        <CirclePlusIcon />
                      )}
                    </IconButton>
                  ) : (
                    <div style={{ marginLeft: 'auto' }}>
                      {o.icon}
                    </div>
                  )}
                </MenuItem>
                {o.divider}
                {o.submenu}
              </Fragment>
            ))}
          </div>
          {/* CLEAR ALL FILTERS BUTTON */}
          <ClearFiltersContainer
            disabled={!(total > 0 && !loading)}
          >
            <ClearFiltersButton
              isDisabled={!(total > 0 && !loading)}
              clearFilters={clearFilters}
            />
          </ClearFiltersContainer>
        </FormGroup>
        {/* </FormControl> */}
      </Popover>
      {defaultFilter && (
        <Tooltip
          title="Default filter will show reportable and C3.8+ variants even if they do not match the filter criteria."
        >
          <InfoIcon />
        </Tooltip>
      )}
    </Wrapper>
  );
}
