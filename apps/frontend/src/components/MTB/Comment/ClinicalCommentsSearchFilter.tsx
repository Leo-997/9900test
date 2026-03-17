import { Box } from '@mui/material';
import { Dispatch, SetStateAction, type JSX } from 'react';
import { makeStyles } from '@mui/styles';
import QuickFilterButton from '@/components/SearchFilterBar/QuickFilters/QuickFilterButton';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import CustomTypography from '@/components/Common/Typography';
import { commentsSortMenuOptions } from '../../../constants/Curation/comments';
import { IClinicalCommentsQuery } from '../../../types/Comments/ClinicalComments.types';
import SearchBar from '../../Search/SearchBar';
import FilterButton from '../../SearchFilterBar/Buttons/FilterButton';
import SearchFilterBar from '../../SearchFilterBar/SearchFilterBar';
import SortButton from '../../SearchFilterBar/Buttons/SortButton';
import ClinicalCommentsFilterOptions from './ClinicalCommentsFilterOptions';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    gridGap: '16px',
    padding: '16px 0px 0px 0px',
  },
  searchInput: {
    display: 'flex',
    height: 48,
    flex: 1,
    backgroundColor: '#F3F7FF',
    borderRadius: 4,
    paddingLeft: 20,
    marginRight: 0,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& p': {
      color: '#273957',
    },
  },
}));

interface IProps {
  filters: IClinicalCommentsQuery;
  setFilters: Dispatch<SetStateAction<IClinicalCommentsQuery>>;
  defaultFilters: IClinicalCommentsQuery,
  emptyFilters: IClinicalCommentsQuery,
  searchPlaceholder?: string
  counts: { current: number, total: number };
}

export default function ClinicalCommentsSearchFilter({
  filters,
  setFilters,
  defaultFilters,
  emptyFilters,
  searchPlaceholder,
  counts,
}: IProps): JSX.Element {
  const classes = useStyles();
  const { analysisSet } = useAnalysisSet();

  const aSetHasZero2FDiagnosis = Boolean(analysisSet.zero2FinalDiagnosis);

  const isFinalFilterActive = (
    prevFilter: IClinicalCommentsQuery,
  ): boolean => prevFilter.zero2FinalDiagnosis?.length === 1
    && prevFilter.zero2FinalDiagnosis[0] === analysisSet.zero2FinalDiagnosis;

  return (
    <Box className={classes.root}>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        style={{ width: '100%' }}
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
          clearFilters={(): void => setFilters(emptyFilters)}
          filterOptions={ClinicalCommentsFilterOptions({ filters, setFilters })}
          isCompressed
        />
        <SortButton
          toggled={filters}
          setToggled={setFilters}
          sortOptions={commentsSortMenuOptions}
          isCompressed
        />

        <Box
          height="36px"
          display="flex"
          alignItems="center"
          gap="8px"
          padding="0 8px 0px 12px"
        >
          <CustomTypography
            variant="bodySmall"
            sx={{
              minWidth: '80px',
            }}
          >
            Quick filters
          </CustomTypography>
          <QuickFilterButton
            toggled={filters}
            data={{
              label: 'Final diagnosis',
              disabled: !aSetHasZero2FDiagnosis,
              tooltip: !aSetHasZero2FDiagnosis ? 'This case has no Final Diagnosis yet.' : '',
              onClick: () => setFilters((prev) => ({
                ...prev,
                zero2FinalDiagnosis: isFinalFilterActive(prev)
                  ? undefined
                  : [analysisSet.zero2FinalDiagnosis],
              })),
              checkIsActive: isFinalFilterActive,
            }}
          />
        </Box>
      </SearchFilterBar>
    </Box>
  );
}
