import { Dispatch, SetStateAction, type JSX } from 'react';
import SearchFilterBar from '../../../../SearchFilterBar/SearchFilterBar';
import SearchBar from '../../../../Search/SearchBar';
import SortButton from '../../../../SearchFilterBar/Buttons/SortButton';
import ArchiveFilterButton from './ArchiveFilterButton';
import { IArchiveSamplesQuery } from '../../../../../types/MTB/Archive.types';

interface IProps {
  filters: IArchiveSamplesQuery;
  setFilters: Dispatch<SetStateAction<IArchiveSamplesQuery>>;
  counts: { current: number; total: number };
}

export function ArchiveSearchFilterBar({
  filters,
  setFilters,
  counts,
}: IProps): JSX.Element {
  return (
    <SearchFilterBar
      styleOverride={{
        position: 'sticky',
        top: 0,
      }}
      isCompressed
      resetToDefault={(): void => {
        setFilters({});
      }}
      isDefault={JSON.stringify({}) === JSON.stringify(filters)}
      counts={counts}
      search={(
        <SearchBar
          searchMethod={(search): void => setFilters((prev) => ({ ...prev, search }))}
          advancedSearch
          supportedFields="Sample ID, Patient ID"
        />
      )}
    >
      <ArchiveFilterButton filters={filters} setFilters={setFilters} />
      <SortButton
        toggled={filters}
        setToggled={setFilters}
        sortOptions={[
          {
            name: 'MTB Date Ascending',
            value: 'MTB Date:asc',
          },
          {
            name: 'MTB Date Descending',
            value: 'MTB Date:desc',
          },
        ]}
      />
    </SearchFilterBar>
  );
}
