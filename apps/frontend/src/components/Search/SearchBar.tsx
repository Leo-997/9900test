import {
  Box, InputAdornment, styled,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { SearchIcon, XIcon } from 'lucide-react';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
  type JSX,
} from 'react';
import { corePalette } from '@/themes/colours';
import AdvancedSearch from './AdvancedSearch';

interface IStyleProps {
  isFocused?: boolean;
  value?: string;
  ignoreStyles?: boolean;
  dynamicPlaceholder?: string;
}

const SearchContainer = styled(Box)<IStyleProps>(({
  isFocused,
  value,
  ignoreStyles,
  dynamicPlaceholder,
}) => (
  ignoreStyles
    ? {
      display: 'flex',
      alignItems: 'center',
      height: '40px',
      width: '40px',
      margin: 'auto 0',
      paddingLeft: value !== '' || isFocused ? '15px' : '0',
    } : {
      display: 'flex',
      alignItems: 'center',
      height: '40px',
      margin: 'auto 0',
      marginRight: '25px',
      paddingLeft: value !== '' || isFocused ? '15px' : '0',
      borderRadius: '4px',
      borderWidth: '2px',
      border: isFocused || value !== '' || dynamicPlaceholder !== 'Search'
        ? '1px solid'
        : 'none',
      borderColor: isFocused
        ? corePalette.green100
        : corePalette.grey50,

      '& input': {
        paddingRight: dynamicPlaceholder !== 'Search' ? '10px' : undefined,
      },

      '& input:placeholder-shown': {
        textOverflow: 'ellipsis',
      },

      '& ::placeholder': {
        color: dynamicPlaceholder !== 'Search' ? corePalette.grey100 : undefined,
        opacity: dynamicPlaceholder !== 'Search' ? 1 : 0.5,
      },
    }
));

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  icon: {
    padding: '5px',
    marginRight: '10px',
    color: corePalette.grey100,
  },
  searchContainerDynamic: {
    width: '160px',
  },
  searchContainerUncompressed: {
    width: '250px',
  },
  searchContainerCompressed: {
    width: '100px',
  },
  searchContainerUnfocused: {
    width: '300px',
  },
}));

/**
 * Material design search bar
 * @see [Search patterns](https://material.io/archive/guidelines/patterns/search.html)
 */

interface ISearchBarProps {
  searchMethod: (query: string) => void;
  className?: string;
  ignoreStyles?: boolean;
  cancelOnEscape?: boolean;
  onChange?: (val: string) => void;
  placeholder?: string;
  value?: string;
  setValue?: Dispatch<SetStateAction<string>>;
  initialValue?: string;
  searchOnChange?: boolean;
  advancedSearch?: boolean;
  supportedFields?: string;
  loading?: boolean;
  isCompressed?: boolean;
  disabled?: boolean;
}

function SearchBar({
  cancelOnEscape,
  className,
  searchMethod,
  ignoreStyles,
  placeholder = 'Search',
  searchOnChange,
  advancedSearch,
  supportedFields,
  initialValue = '',
  loading = false,
  isCompressed = false,
  disabled = false,
  ...inputProps
}: ISearchBarProps): JSX.Element {
  const [value, setValue] = useState<string>(
    !advancedSearch && inputProps.value ? inputProps.value : initialValue,
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [viewAdvancedSearch, setViewAdvancedSearch] = useState<boolean>(false);
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState<string>(placeholder);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const classes = useStyles({
    isFocused, value, ignoreStyles, dynamicPlaceholder,
  });

  const handleFocus = useCallback(() => {
    if (advancedSearch) {
      setViewAdvancedSearch(true);
      setAnchorEl(searchContainerRef.current);
    } else {
      setIsFocused(true);
    }
  }, [advancedSearch]);

  const handleBlur = useCallback(
    (e) => {
      setIsFocused(false);
      if (e && e.target.value !== '' && e.target.value !== value) {
        setValue(e.target.value.trim());
        if (inputProps.setValue) inputProps.setValue(e.target.value.trim());
        // Trigger search on de-focus
        searchMethod(e.target.value.trim());
      }
    },
    [searchMethod, value, inputProps],
  );

  const handleInput = useCallback((e) => {
    setValue(e.target.value);
  }, []);

  const handleCancel = useCallback(() => {
    setValue('');
    if (inputProps.setValue) inputProps.setValue('');
    // Trigger search on cancel
    searchMethod('');
    setIsFocused(false);
    setDynamicPlaceholder(placeholder);
  }, [searchMethod, inputProps, placeholder]);

  const handleKeyUp = useCallback(
    (e) => {
      if (searchOnChange) {
        searchMethod(value.trim());
      } else if (e.charCode === 13 || e.key === 'Enter') {
        // Trigger search on enter key
        searchMethod(value.trim());
        if (inputProps.setValue) inputProps.setValue(value.trim());
      } else if (
        cancelOnEscape
            && (e.charCode === 27 || e.key === 'Escape')
      ) {
        handleCancel();
      }
    },
    [searchMethod, cancelOnEscape, handleCancel, value, searchOnChange, inputProps],
  );

  // keep the 'local' value in sync with the value passed in through props
  useEffect(() => {
    if (!advancedSearch && inputProps.value !== undefined) {
      setValue(inputProps.value);
    }

    if (advancedSearch && inputProps.value === '') {
      setDynamicPlaceholder('Search');
    }
  }, [advancedSearch, inputProps.value]);

  return (
    <>
      <SearchContainer
        isFocused={isFocused}
        value={value}
        ignoreStyles={ignoreStyles}
        dynamicPlaceholder={dynamicPlaceholder}
        className={
          clsx(
            className,
            {
              ...(
                !ignoreStyles
                  ? {
                    [classes.searchContainerUnfocused]: isFocused || value !== '',
                    [classes.searchContainerCompressed]: isCompressed,
                    [classes.searchContainerUncompressed]: dynamicPlaceholder !== 'Search' && !isCompressed,
                    [classes.searchContainerDynamic]: dynamicPlaceholder === 'Search' && !isCompressed,
                  } : {}
              ),
            },
          )
        }
        ref={searchContainerRef}
      >
        <Input
          {...inputProps}
          id="searchInput"
          inputRef={inputRef}
          onBlur={handleBlur}
          value={value}
          onChange={handleInput}
          onKeyUp={handleKeyUp}
          onFocus={handleFocus}
          fullWidth
          placeholder={dynamicPlaceholder}
          disableUnderline
          disabled={loading || disabled}
          startAdornment={
            value !== '' || isFocused ? (
              <div />
            ) : (
              <InputAdornment position="start">
                <IconButton
                  onClick={(): void => inputRef?.current?.focus()}
                  className={classes.icon}
                  disabled={disabled}
                  sx={{ color: corePalette.grey100 }}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            )
          }
          endAdornment={
            value === '' && !isFocused ? (
              <div />
            ) : (
              <InputAdornment position="end">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: '4px',
                  position: 'relative',
                }}
                >
                  <IconButton onClick={handleCancel} className={classes.icon} disabled={loading}>
                    <XIcon />
                  </IconButton>
                  <Box sx={{ width: '1px', height: '24px', backgroundColor: corePalette.grey50 }} />
                  <IconButton
                    onClick={(): void => {
                      setDynamicPlaceholder(value.replaceAll('\n', '; '));
                      searchMethod(value.trim());
                      setAnchorEl(null);
                      if (inputProps.setValue) inputProps.setValue(value.trim());
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
      {advancedSearch && viewAdvancedSearch && (
        <AdvancedSearch
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          searchMethod={searchMethod}
          setDynamicPlaceholder={setDynamicPlaceholder}
          supportedFields={supportedFields}
          value={inputProps.value}
          setValue={inputProps.setValue}
          loading={loading}
        />
      )}
    </>
  );
}

export default SearchBar;
