import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '@/contexts/CurationContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { IGeneQuickFilter } from '@/types/Common.types';
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import { snvSortMenuOptions } from '../../constants/Curation/snv';
import { ISNVGermlineSearchOptions } from '../../types/Search.types';
import Search from '../Search/Search';
import ClearPathclassButton from '../SearchFilterBar/Buttons/ClearPathclassButton';
import FilterButton from '../SearchFilterBar/Buttons/FilterButton';
import SortButton from '../SearchFilterBar/Buttons/SortButton';
import QuickFilters from '../SearchFilterBar/QuickFilters/QuickFilters';
import SearchFilterBar from '../SearchFilterBar/SearchFilterBar';
import SNVGermlineFilterOptions from './SNVGermlineFilterOptions';

interface ISNVSearchFilterBarProps {
  toggled: ISNVGermlineSearchOptions;
  emptyOptions: ISNVGermlineSearchOptions;
  defaultOptions: ISNVGermlineSearchOptions;
  setToggled: Dispatch<SetStateAction<ISNVGermlineSearchOptions>>;
  counts: { current: number; total: number };
  quickFilters: IGeneQuickFilter<ISNVGermlineSearchOptions>[];
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setPathclassModalOpen: Dispatch<SetStateAction<boolean>>;
  disabled?: boolean;
}

export default function SNVGermlineSearchFilterBar({
  toggled,
  emptyOptions,
  defaultOptions,
  setToggled,
  counts,
  quickFilters,
  loading,
  setLoading,
  setPathclassModalOpen,
  disabled,
}: ISNVSearchFilterBarProps): JSX.Element {
  const { germlineBiosample } = useAnalysisSet();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: germlineBiosample?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;
  const canEdit = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;
  const { enqueueSnackbar } = useSnackbar();

  const [search, setSearch] = useState<string>(toggled?.genesearchquery || '');

  const resetAll = (): void => {
    setToggled(defaultOptions);
    setSearch('');
  };

  const clearAll = (): void => {
    enqueueSnackbar(
      'Filters require at least 1 gene. Default gene list has been reapplied',
      { variant: 'warning' },
    );
    setToggled({ ...emptyOptions, genename: defaultOptions.genename });
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
      isDefault={
        !(checkFilters() || toggled?.sortColumns?.length !== 0)
      }
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
          SNVGermlineFilterOptions({
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
        toggled={toggled || emptyOptions}
        setToggled={setToggled}
        sortOptions={snvSortMenuOptions}
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
