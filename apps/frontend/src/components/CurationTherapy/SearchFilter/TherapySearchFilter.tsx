import CustomButton from '@/components/Common/Button';
import CustomTypography from '@/components/Common/Typography';
import LinkedTherapyModal from '@/components/ExpandedModal/Comments/LinkedTherapyModal';
import SearchBar from '@/components/Search/SearchBar';
import FilterButton from '@/components/SearchFilterBar/Buttons/FilterButton';
import SortButton from '@/components/SearchFilterBar/Buttons/SortButton';
import { therapiesSortMenuOptions } from '@/constants/therapies';
import { CurationTherapyEntityTypes, ICurationTherapy, ITherapiesQuery } from '@/types/Therapies/CurationTherapies.types';
import { Box, styled } from '@mui/material';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import { PlusIcon } from 'lucide-react';
import TherapyFilterOptions from './TherapyFilterOptions';

const SearchInput = styled(SearchBar)(() => ({
  display: 'flex',
  height: 48,
  flex: 1,
  borderRadius: 4,
  paddingLeft: 20,
  marginRight: 24,
  '& p': {
    color: '#273957',
  },
}));

const HeaderTypography = styled(CustomTypography)(() => ({
  marginTop: 16,
  marginBottom: 8,
  lineHeight: 1.5,
}));

interface IProps {
  filters: ITherapiesQuery;
  setFilters: Dispatch<SetStateAction<ITherapiesQuery>>;
  entityId: string | number;
  entityType: CurationTherapyEntityTypes;
  counts: { current: number, total: number };
  onSubmit: (newTherapy: ICurationTherapy) => void;
  canAddTherapy: boolean;
  className?: string;
  searchPlaceholder?: string;
}

export default function TherapySearchFilter({
  filters,
  setFilters,
  entityId,
  entityType,
  counts,
  onSubmit,
  canAddTherapy,
  className,
  searchPlaceholder,
}: IProps): JSX.Element {
  const [newTherapyModalOpen, setNewTherapyModalOpen] = useState<boolean>(false);

  return (
    <Box display="flex" flexDirection="column" className={className}>
      <HeaderTypography variant="label">
        {searchPlaceholder}
      </HeaderTypography>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        style={{ width: '100%', marginBottom: 16 }}
      >
        <SearchInput
          searchMethod={
            (query: string): void => (
              setFilters((prev) => ({ ...prev, searchQuery: query }))
            )
          }
          placeholder={searchPlaceholder}
          value={filters.searchQuery}
        />
        <CustomButton
          label="Add new therapy"
          variant="outline"
          startIcon={<PlusIcon />}
          onClick={(): void => setNewTherapyModalOpen(true)}
          disabled={!canAddTherapy}
        />
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingBottom="16px"
      >
        <Box display="flex">
          <FilterButton
            toggled={filters}
            setToggled={setFilters}
            clearFilters={(): void => setFilters({})}
            filterOptions={
                  TherapyFilterOptions({
                    filters,
                    setFilters,
                  })
                }
            isCompressed
          />
          <SortButton
            toggled={filters}
            setToggled={setFilters}
            sortOptions={therapiesSortMenuOptions}
            isCompressed
          />
        </Box>
        <Box display="flex" flexDirection="row" alignItems="center">
          <CustomTypography variant="label">
            {counts.current}
            {' of '}
            {counts.total}
            {' therapies'}
          </CustomTypography>
        </Box>
      </Box>
      {newTherapyModalOpen && (
        <LinkedTherapyModal
          open={newTherapyModalOpen}
          onClose={(): void => setNewTherapyModalOpen(false)}
          entityId={entityId}
          entityType={entityType}
          onSubmit={onSubmit}
        />
      )}
    </Box>
  );
}
