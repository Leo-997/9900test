import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '@/contexts/CurationContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { IGeneQuickFilter } from '@/types/Common.types';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import { snvSortMenuOptions } from '../../constants/Curation/snv';
import { ISNVSearchOptions } from '../../types/Search.types';
import Search from '../Search/Search';
import ClearPathclassButton from '../SearchFilterBar/Buttons/ClearPathclassButton';
import FilterButton from '../SearchFilterBar/Buttons/FilterButton';
import SortButton from '../SearchFilterBar/Buttons/SortButton';
import QuickFilters from '../SearchFilterBar/QuickFilters/QuickFilters';
import SearchFilterBar from '../SearchFilterBar/SearchFilterBar';
import SNVFilterOptions from './SNVFilterOptions';

interface ISNVSearchFilterBarProps {
  toggled: ISNVSearchOptions;
  emptyOptions: ISNVSearchOptions;
  defaultOptions: ISNVSearchOptions;
  setToggled: Dispatch<SetStateAction<ISNVSearchOptions>>;
  quickFilters: IGeneQuickFilter<ISNVSearchOptions>[]
  counts: { current: number; total: number };
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  disabled?: boolean;
  setPathclassModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function SNVSearchFilterBar({
  toggled,
  emptyOptions,
  defaultOptions,
  setToggled,
  quickFilters,
  counts,
  loading,
  setLoading,
  disabled,
  setPathclassModalOpen,
}: ISNVSearchFilterBarProps): JSX.Element {
  const { tumourBiosample } = useAnalysisSet();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: tumourBiosample?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;
  const canEdit = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;

  const [search, setSearch] = useState<string>(toggled.genesearchquery || '');

  const resetAll = (): void => {
    setToggled(defaultOptions);
    setSearch('');
  };

  const clearAll = (): void => {
    setToggled(emptyOptions);
    setSearch('');
  };

  const checkFilters = (): boolean => {
    if (JSON.stringify(toggled) !== JSON.stringify(defaultOptions)) {
      return true;
    }
    return false;
  };

  return (
    <SearchFilterBar
      search={(
        <Search
          searchMethod={(query: string): void => setToggled({ ...toggled, genesearchquery: query })}
          searchOnChange={false}
          value={search}
          setValue={setSearch}
          loading={loading}
          disabled={disabled}
        />
      )}
      isDefault={!(checkFilters() || toggled.sortColumns?.length !== 0)}
      resetToDefault={resetAll}
      afterCounts={(
        <ClearPathclassButton
          setModalOpen={setPathclassModalOpen}
          disabled={disabled || loading || isReadOnly || !canEdit}
        />
      )}
      counts={counts}
    >
      <FilterButton
        toggled={toggled}
        setToggled={setToggled}
        clearFilters={clearAll}
        filterOptions={
          SNVFilterOptions({
            toggled,
            setToggled,
            loading,
            setLoading,
            emptyOptions,
          })
        }
        loading={loading}
        setLoading={setLoading}
        defaultFilter={!checkFilters()}
        disabled={disabled}
      />
      <SortButton
        toggled={toggled}
        setToggled={setToggled}
        sortOptions={snvSortMenuOptions}
        disabled={loading || disabled}
      />
      <QuickFilters
        quickFilters={quickFilters}
        toggled={toggled}
        isLoading={loading}
        disabled={disabled}
      />
    </SearchFilterBar>
  );
}
