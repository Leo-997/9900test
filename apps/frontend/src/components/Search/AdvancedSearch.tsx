import {
  Box,
  Divider,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  Popover,
  styled
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { SearchIcon, XIcon } from 'lucide-react';
import {
  useCallback, useEffect, useRef, useState, type JSX,
} from 'react';
import { corePalette } from '@/themes/colours';
import CustomTypography from '../Common/Typography';

interface IStyleProps {
  isFocused?: boolean;
  value?: string;
}

const SearchContainer = styled(Grid)<IStyleProps>(({ theme, isFocused, value }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  minHeight: '40px',
  width: '100%',
  margin: 'auto 0',
  paddingLeft: value !== '' || isFocused ? '15px' : '0',
  borderRadius: '4px',
  border: isFocused || value !== ''
    ? '1px solid'
    : 'none',
  borderColor: isFocused
    ? theme.colours.core.green150
    : theme.colours.core.grey50,
}));

const useStyles = makeStyles(() => ({
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '15px',
    width: '100%',
  },
  divider: {
    width: '100%',
    margin: '10px 0',
  },
  icon: {
    padding: '5px',
    marginRight: '10px',
  },
  iconWrapper: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'end',
    justifyContent: 'end',
  },
}));

interface IAdvancedSearchProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: (el: HTMLElement | null) => void;
  searchMethod: (search: string) => void;
  setDynamicPlaceholder: (placeholder: string) => void;
  supportedFields?: string;
  value?: string;
  setValue?: (value: string) => void;
  loading?: boolean;
}

function AdvancedSearch({
  anchorEl,
  setAnchorEl,
  searchMethod,
  setDynamicPlaceholder,
  supportedFields,
  loading = false,
  ...inputProps
}: IAdvancedSearchProps): JSX.Element {
  const [value, setValue] = useState<string>(inputProps.value || '');
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const classes = useStyles({ isFocused, value });

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(
    (e) => {
      setIsFocused(false);
      if (e && e.target.value !== '' && e.target.value !== value) {
        setValue(e.target.value.trim());
        if (inputProps.setValue) inputProps.setValue(e.target.value.trim());
        // Trigger search on de-focus
        setDynamicPlaceholder(value.replaceAll('\n', '; '));
        searchMethod(e.target.value.split('\n').map((line) => line.trim()).join('\n'));
        setAnchorEl(null);
      }
    },
    [searchMethod, setAnchorEl, setDynamicPlaceholder, value, inputProps],
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(e.target.value);
    },
    [],
  );

  const handleCancel = useCallback(() => {
    setValue('');
    if (inputProps.setValue) inputProps.setValue('');
    // Trigger search on cancel
    setDynamicPlaceholder('Search');
    searchMethod('');
    setAnchorEl(null);
    setIsFocused(false);
  }, [searchMethod, setAnchorEl, setDynamicPlaceholder, inputProps]);

  const handleKeyDown = useCallback(
    (e) => {
      if ((e.charCode === 13 || e.key === 'Enter') && !e.shiftKey) {
        e.preventDefault();
        setDynamicPlaceholder(value.replaceAll('\n', '; '));
        searchMethod(value.split('\n').map((line) => line.trim()).join('\n'));
        setAnchorEl(null);
        if (inputProps.setValue) inputProps.setValue(value);
      } else if ((e.charCode === 27 || e.key === 'Escape')) {
        handleCancel();
      }
    },
    [handleCancel, searchMethod, setAnchorEl, setDynamicPlaceholder, value, inputProps],
  );

  useEffect(() => {
    if (anchorEl) inputRef?.current?.focus();
  }, [anchorEl]);

  // keep the 'local' value in sync with the value passed in through props
  useEffect(() => {
    if (inputProps.value !== undefined) {
      setValue(inputProps.value);
    }
  }, [inputProps.value]);

  useEffect(() => {
    if (value) {
      setDynamicPlaceholder(value.replaceAll('\n', '; '));
    } else {
      setDynamicPlaceholder('Search');
    }
  }, [value, setDynamicPlaceholder]);

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={(): void => setAnchorEl(null)}
      disableRestoreFocus
      slotProps={{
        paper: {
          style: {
            width: '680px',
          },
        },
      }}
    >
      <Grid container className={classes.contentWrapper} gap="16px">
        <SearchContainer isFocused={isFocused} value={value}>
          <Input
            {...inputProps}
            id="searchInput"
            inputRef={inputRef}
            onBlur={handleBlur}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            fullWidth
            autoFocus
            placeholder="Search"
            disableUnderline
            multiline
            disabled={loading}
            startAdornment={
              value === '' && !isFocused && (
                <InputAdornment position="start">
                  <IconButton
                    onClick={(): void => inputRef?.current?.focus()}
                    className={classes.icon}
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )
            }
            endAdornment={
              (value !== '' || isFocused) && (
                <InputAdornment position="end" className={classes.iconWrapper}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: '4px',
                    position: 'relative',
                    top: '3px',
                  }}
                  >
                    <IconButton onClick={handleCancel} className={classes.icon} disabled={loading}>
                      <XIcon />
                    </IconButton>
                    <Box sx={{ width: '1px', height: '24px', backgroundColor: corePalette.grey50 }} />
                    <IconButton
                      onClick={(): void => {
                        setDynamicPlaceholder(value.replaceAll('\n', '; '));
                        searchMethod(value.split('\n').map((line) => line.trim()).join('\n'));
                        setAnchorEl(null);
                        if (inputProps.setValue) inputProps.setValue(value);
                      }}
                      className={classes.icon}
                      disabled={loading}
                    >
                      <SearchIcon />
                    </IconButton>
                  </div>
                </InputAdornment>
              )
            }
          />
        </SearchContainer>
        <Grid className={classes.divider}>
          <Divider />
        </Grid>
        <Grid container direction="column" gap="8px">
          <Grid container direction="column">
            <CustomTypography variant="bodyRegular">
              Search for multiple IDs by entering them one per line,
              or separated by a semi-colon (;).
            </CustomTypography>
            <CustomTypography variant="bodyRegular">
              Press
              {' '}
              <b>Shift + Enter</b>
              {' '}
              to enter a new line.
            </CustomTypography>
          </Grid>
          <CustomTypography variant="bodyRegular">
            <b>Supported fields:</b>
            <br />
            {supportedFields}
          </CustomTypography>
        </Grid>
      </Grid>
    </Popover>
  );
}

export default AdvancedSearch;
