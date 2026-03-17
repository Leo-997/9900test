import {
  Dispatch, SetStateAction, useState, type JSX,
} from 'react';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '@/contexts/CurationContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { AllQuickFilters } from '@/types/Common.types';
import { svSortMenuOptions } from '../../constants/Curation/sv';
import { ISVSearchOptions } from '../../types/Search.types';
import Search from '../Search/Search';
import FilterButton from '../SearchFilterBar/Buttons/FilterButton';
import SortButton from '../SearchFilterBar/Buttons/SortButton';
import QuickFilters from '../SearchFilterBar/QuickFilters/QuickFilters';
import SearchFilterBar from '../SearchFilterBar/SearchFilterBar';
import SVFilterOptions from './SVFilterOptions';
import { SVMoreOptionsButton } from './SVMoreOptionsButton';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';

interface ISVSearchFilterBarProps {
  toggled: ISVSearchOptions;
  emptyOptions: ISVSearchOptions;
  defaultOptions: ISVSearchOptions;
  setToggled: Dispatch<SetStateAction<ISVSearchOptions>>;
  counts: { current: number, total: number };
  quickFilters: AllQuickFilters<ISVSearchOptions>[];
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  allExpanded: boolean;
  setAllExpanded: Dispatch<SetStateAction<boolean>>;
  isGermline?: boolean;
  setPathclassModalOpen: Dispatch<SetStateAction<boolean>>;
  disabled?: boolean;
}

export default function SVSearchFilterBar({
  toggled,
  emptyOptions,
  defaultOptions,
  setToggled,
  counts,
  quickFilters,
  loading,
  setLoading,
  allExpanded,
  setAllExpanded,
  isGermline = false,
  setPathclassModalOpen,
  disabled,
}: ISVSearchFilterBarProps): JSX.Element {
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
      counts={counts}
      afterCounts={(
        <SVMoreOptionsButton
          loading={loading}
          allExpanded={allExpanded}
          setAllExpanded={setAllExpanded}
          setPathclassModalOpen={setPathclassModalOpen}
          disabled={
            disabled
            || loading
            || !canEdit
          }
        />
      )}
    >
      <FilterButton
        toggled={toggled}
        setToggled={setToggled}
        clearFilters={clearAll}
        filterOptions={
          SVFilterOptions({
            toggled,
            setToggled,
            loading,
            setLoading,
            emptyOptions,
            isGermline,
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
        sortOptions={svSortMenuOptions}
        disabled={disabled}
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
