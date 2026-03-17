import { corePalette } from '@/themes/colours';
import { ICommentTagOption } from '@/types/Comments/CommonComments.types';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dispatch, ReactNode, SetStateAction, type JSX } from 'react';
import { ICurationCommentsQuery } from '../../../../types/Comments/CurationComments.types';
import SearchBar from '../../../Search/SearchBar';
import FilterButton from '../../../SearchFilterBar/Buttons/FilterButton';
import SearchFilterBar from '../../../SearchFilterBar/SearchFilterBar';
import CommentsFilterOptions from './CommentsFilterOptions';

const useStyles = makeStyles(() => ({
  searchInput: {
    display: 'flex',
    height: 48,
    flex: 1,
    backgroundColor: corePalette.grey10,
    borderRadius: 4,
    paddingLeft: 20,
    marginRight: 0,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& p': {
      color: corePalette.offBlack100,
    },
  },
}));

interface IProps {
  filters: ICurationCommentsQuery;
  setFilters: Dispatch<SetStateAction<ICurationCommentsQuery>>;
  defaultFilters: ICurationCommentsQuery,
  searchPlaceholder?: string
  quickFilters?: ReactNode;
  counts: { current: number, total: number };
  tagOptions: ICommentTagOption<string>[];
}

export default function CommentsSearchFilter({
  filters,
  setFilters,
  defaultFilters,
  searchPlaceholder,
  quickFilters,
  counts,
  tagOptions,
}: IProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column">
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        style={{ width: '100%', marginBottom: 16, marginTop: 16 }}
      >
        <SearchBar
          searchMethod={
            (query: string): void => setFilters((prev) => ({ ...prev, searchQuery: query }))
          }
          className={classes.searchInput}
          placeholder={searchPlaceholder}
          value={filters.searchQuery}
        />
      </Box>
      <SearchFilterBar
        isDefault={JSON.stringify(defaultFilters) === JSON.stringify(filters)}
        resetToDefault={(): void => setFilters(defaultFilters)}
        counts={counts}
        isCompressed
      >
        <FilterButton
          toggled={filters}
          setToggled={setFilters}
          clearFilters={(): void => setFilters({})}
          filterOptions={CommentsFilterOptions({ filters, setFilters, tagOptions })}
          isCompressed
        />
        {quickFilters}
      </SearchFilterBar>
    </Box>
  );
}
