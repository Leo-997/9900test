import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '@/contexts/CurationContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { IGeneQuickFilter } from '@/types/Common.types';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import { cnvGermlineSortMenuOptions } from '../../constants/Curation/cnvGermline';
import { ICNVGermlineSearchOptions } from '../../types/Search.types';
import Search from '../Search/Search';
import ClearPathclassButton from '../SearchFilterBar/Buttons/ClearPathclassButton';
import FilterButton from '../SearchFilterBar/Buttons/FilterButton';
import SortButton from '../SearchFilterBar/Buttons/SortButton';
import QuickFilters from '../SearchFilterBar/QuickFilters/QuickFilters';
import SearchFilterBar from '../SearchFilterBar/SearchFilterBar';
import CNVGermlineFilterOptions from './CNVGermlineFilterOptions';

interface ICNVSearchFilterBarProps {
  toggled: ICNVGermlineSearchOptions;
  emptyOptions: ICNVGermlineSearchOptions;
  defaultOptions: ICNVGermlineSearchOptions;
  setToggled: Dispatch<SetStateAction<ICNVGermlineSearchOptions>>;
  quickFilters: IGeneQuickFilter<ICNVGermlineSearchOptions>[]
  counts: { current: number; total: number };
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setPathclassModalOpen: Dispatch<SetStateAction<boolean>>;
  disabled?: boolean;
}

export default function CNVGermlineSearchFilterBar({
  toggled,
  emptyOptions,
  defaultOptions,
  setToggled,
  quickFilters,
  counts,
  loading,
  setLoading,
  setPathclassModalOpen,
  disabled,
}: ICNVSearchFilterBarProps): JSX.Element {
  const { germlineBiosample } = useAnalysisSet();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: germlineBiosample?.biosampleId });
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
          disabled={
            disabled
            || loading
            || isReadOnly
            || !canEdit
          }
        />
      )}
      counts={counts}
    >
      <FilterButton
        toggled={toggled}
        setToggled={setToggled}
        clearFilters={clearAll}
        filterOptions={
          CNVGermlineFilterOptions({
            toggled,
            setToggled,
            loading,
            setLoading,
            emptyOptions,
          })
        }
        loading={loading}
        setLoading={setLoading}
        disabled={disabled}
      />
      <SortButton
        toggled={toggled}
        setToggled={setToggled}
        sortOptions={cnvGermlineSortMenuOptions}
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
