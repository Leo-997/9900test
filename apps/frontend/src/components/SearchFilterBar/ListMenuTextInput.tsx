import { corePalette } from '@/themes/colours';
import {
  Box, IconButton, InputAdornment, Popover,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Search, XIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useCallback, useEffect, useState, type JSX } from 'react';
import ChipsList from '../Chips/ChipsList';
import CustomButton from '../Common/Button';
import OutlinedInput from '../Input/OutlinedTextInput';

const useStyles = makeStyles(() => ({
  menu: {
    overflowY: 'auto',
    width: '100%',
    padding: '8px',
  },
  btnMargins: {
    marginRight: '16px',
  },
  input: {
    height: '44px',
    margin: '0 12px',
  },
  icon: {
    padding: '5px',
    marginRight: '10px',
    color: '#022034',
  },
}));

interface IListMenuTextInput {
  chipListHeading: string;
  anchorEl: null | HTMLElement;
  setAnchorEl: Dispatch<SetStateAction<null | HTMLElement>>;
  currentFilterValue: string[],
  handleApplyFilter: (newValue: string[]) => void;
  inputType?: string;
  loading?: boolean;
}

export default function ListMenuTextInput({
  chipListHeading,
  anchorEl,
  setAnchorEl,
  currentFilterValue,
  handleApplyFilter,
  inputType = 'text',
  loading,
}: IListMenuTextInput): JSX.Element {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [inputValue, setInputValue] = useState<string>('');
  const [searchList, setSearchList] = useState<string[]>([]);

  const handleAddChip = useCallback((): void => {
    if (inputValue) {
      const trimmedInputValue = inputValue.trim();

      if (!trimmedInputValue.length) {
        setInputValue('');
        enqueueSnackbar('Cannot search empty values.', { variant: 'error' });
        return;
      }
      if (searchList.includes(trimmedInputValue)) {
        enqueueSnackbar('Cannot add two identical search values.', { variant: 'error' });
        return;
      }

      setSearchList((prev) => [...prev, trimmedInputValue]);
      setInputValue('');
    }
  }, [enqueueSnackbar, inputValue, searchList]);

  const handleKeyUp = useCallback((e): void => {
    if (e.code === 'Enter' || e.key === 'Enter') {
      handleAddChip();
    }
  }, [handleAddChip]);

  const handleDeleteSearchListItem = (item: string):void => {
    const filteredSearchList = searchList.filter((listItem) => listItem !== item);
    setSearchList(filteredSearchList);
  };

  useEffect((): void => {
    setSearchList(currentFilterValue);
  }, [currentFilterValue]);

  return (
    <Popover
      className={classes.menu}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      open={Boolean(anchorEl)}
      onClose={(): void => setAnchorEl(null)}
      PaperProps={{
        style: {
          width: '500px',
          padding: '8px 8px 0px 8px',
        },
      }}
    >
      <OutlinedInput
        inputContainerClassName={classes.input}
        value={inputValue}
        type={inputType}
        onChange={(e): void => setInputValue(e.target.value)}
        onKeyUp={handleKeyUp}
        inputProps={inputType === 'number' ? { min: 0 } : undefined}
        disabled={loading}
        endAdornment={inputValue && (
          <InputAdornment position="end" sx={{ top: '-4px', position: 'relative', gap: '4px' }}>
            <IconButton
              onClick={(): void => setInputValue('')}
              className={classes.icon}
            >
              <XIcon />
            </IconButton>
            <div
              style={{
                height: '24px',
                width: '1px',
                borderLeft: `1px solid ${corePalette.grey50}`,
              }}
            />
            <IconButton
              className={classes.icon}
              onClick={handleAddChip}
            >
              <Search />
            </IconButton>
          </InputAdornment>
        )}
      />
      <Box display="flex" flexDirection="column" style={{ margin: 12 }}>
        <ChipsList
          type="success"
          chips={searchList.map((l) => ({
            label: l,
            key: l,
          }))}
          handleDelete={handleDeleteSearchListItem}
          successTitle={`${chipListHeading.toUpperCase()} SEARCH LIST`}
          errorTitle="THE FOLLOWING SEARCH COULD NOT BE IMPLEMENTED AS IT COULD NOT BE VALIDATED"
        />
        <Box
          display="flex"
          justifyContent="flex-end"
          marginTop="19px"
          gap="8px"
        >
          <CustomButton
            className={classes.btnMargins}
            size="small"
            label="Clear all"
            variant="subtle"
            onClick={(): void => setSearchList([])}
            disabled={loading}
          />
          <CustomButton
            size="small"
            variant="bold"
            label={`Apply Filter (${searchList.length})`}
            onClick={():void => handleApplyFilter(searchList)}
            disabled={JSON.stringify(currentFilterValue) === JSON.stringify(searchList) || loading}
          />
        </Box>
      </Box>
    </Popover>
  );
}
