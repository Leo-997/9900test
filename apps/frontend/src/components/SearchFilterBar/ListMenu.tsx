import {
  Popover,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  Dispatch,
  JSX,
  SetStateAction, useCallback,
  useEffect,
  useState,
} from 'react';
import CustomAutocomplete from '../Common/Autocomplete';

const useStyles = makeStyles(() => ({
  menu: {
    overflowY: 'auto',
    width: '100%',
    padding: '8px',
  },
  listLabel: {
    width: 240,
  },
  chip: {
    height: '32px',
    width: 'fit-content',
    color: '#112863',
    backgroundColor: '#D7EAFC',
    borderColor: '#75B6FF',
  },
  deleteChipBtn: {
    width: '20px',
    height: '20px',
  },
  chipDivider: {
    backgroundColor: '#75B6FF',
    height: '10px',
  },
}));

interface IMenuProps<T extends string> {
  anchorEl: null | HTMLElement;
  setAnchorEl: Dispatch<SetStateAction<null | HTMLElement>>;
  value: T[];
  onChange: (newValue: T[]) => void;
  menuOptions?: string[];
  menuOptionsFetch?: (search?: string) => Promise<string[]>;
  customLabel?: (option: string) => string;
  groupBy?: (option: string) => string;
  closeParent?: () => void;
  loading?: boolean;
  setLoading?: Dispatch<SetStateAction<boolean>>;
}

export default function ListMenu<T extends string>({
  anchorEl,
  setAnchorEl,
  value,
  onChange,
  menuOptions,
  menuOptionsFetch,
  customLabel,
  closeParent,
  groupBy,
  loading,
  setLoading,
}: IMenuProps<T>): JSX.Element {
  const classes = useStyles();

  const [options, setOptions] = useState<string[]>(menuOptions ?? []);

  const handleClose = (event, reason): void => {
    setAnchorEl(null);
    if (reason === 'escapeKeyDown' && closeParent) {
      closeParent();
    }
  };

  const handleInputChange = useCallback(async (search: string) => {
    if (menuOptionsFetch) {
      const data = await menuOptionsFetch(search);
      setOptions(() => Array
        .from(new Set([...menuOptions ?? [], ...data]))
        .sort((a, b) => a.localeCompare(b)));
    }
  }, [menuOptionsFetch, menuOptions]);

  useEffect(() => {
    async function getOptions(): Promise<void> {
      if (menuOptionsFetch) {
        const data = await menuOptionsFetch();
        setOptions((prev) => Array
          .from(new Set([...prev, ...data]))
          .sort((a, b) => a.localeCompare(b)));
      }
    }
    getOptions();
  }, [menuOptionsFetch]);

  useEffect(() => {
    if (menuOptions) {
      setOptions(menuOptions);
    }
  }, [menuOptions]);

  return (
    <Popover
      className={classes.menu}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      disableRestoreFocus
      slotProps={{
        paper: {
          sx: {
            width: '500px',
            padding: '8px 8px 0px 8px',
          },
        },
      }}
    >
      <CustomAutocomplete
        multiple
        open
        clearOnBlur
        disableClearable
        disablePortal
        disabled={loading}
        options={options}
        value={value}
        isOptionEqualToValue={(o): boolean => value.includes(o as T)}
        getOptionLabel={(o): string => (customLabel ? customLabel(o) : o)}
        groupBy={groupBy}
        onChange={(e, val): void => {
        // Should not set loading back to false after onChange(),
        // otherwise TabContentWrapper shows "No more data to load" message
        // Each variant's fetch function will set loading to false eventually
          if (setLoading) setLoading(true);
          onChange(val as T[]);
        }}
        onInputChange={(e, val): Promise<void> => handleInputChange(val)}
      />
    </Popover>
  );
}
