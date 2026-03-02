import { styled } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dispatch, SetStateAction, type JSX } from 'react';
import SearchBar from './SearchBar';

interface IStyleProps {
  isCompressed?: boolean;
}

const Searchbar = styled(SearchBar)<IStyleProps>(({ theme, isCompressed }) => ({
  ...theme.typography.body2,
  position: 'relative',
  borderRadius: '4px',
  boxSizing: 'border-box',
  boxShadow: 'none',
  height: '40px',
  minWidth: isCompressed ? '100px' : '160px',
}));

const useStyles = makeStyles(() => ({
  root: {
    maxHeight: '40px',
    marginLeft: '4px',
  },
}));

// Interface for creating a search bar
export interface ISearchProps {
  searchMethod: (query: string) => void; // Updates the list you're searching on
  searchOnChange?: boolean; // Search on change as well as on blur
  ignoreStyles?: boolean;
  advancedSearch?: boolean;
  supportedFields?: string;
  value?: string;
  setValue?: Dispatch<SetStateAction<string>>;
  placeholder?: string;
  loading?: boolean;
  isCompressed?: boolean;
  disabled?: boolean;
}

// Search bar component definition
export default function Search({
  searchMethod,
  searchOnChange,
  ignoreStyles,
  advancedSearch,
  supportedFields,
  value,
  setValue,
  placeholder,
  loading,
  isCompressed = false,
  disabled = false,
}: ISearchProps): JSX.Element {
  const classes = useStyles({ isCompressed });

  return (
    <div className={classes.root}>
      <Searchbar
        searchMethod={searchMethod}
        searchOnChange={searchOnChange}
        ignoreStyles={ignoreStyles}
        advancedSearch={advancedSearch}
        supportedFields={supportedFields}
        value={value}
        setValue={setValue}
        placeholder={placeholder}
        loading={loading}
        isCompressed={isCompressed}
        disabled={disabled}
      />
    </div>
  );
}
