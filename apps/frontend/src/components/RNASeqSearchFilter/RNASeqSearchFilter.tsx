import {
  Dispatch, SetStateAction, useState, type JSX,
} from 'react';
import { rnaSortMenuOptions } from '../../constants/Curation/rna';
import { IRNASeqSearchOptions } from '../../types/Search.types';
import Search from '../Search/Search';
import FilterButton from '../SearchFilterBar/Buttons/FilterButton';
import SortButton from '../SearchFilterBar/Buttons/SortButton';
import SearchFilterBar from '../SearchFilterBar/SearchFilterBar';
import RNASeqFilterOptions from './RNASeqFilterOptions';
import { RNASeqSearchFilterExtraOptions } from './RNASeqSearchFilterExtraOptions';

interface IRNASeqSearchFilterBarProps {
  toggled: IRNASeqSearchOptions;
  emptyOptions: IRNASeqSearchOptions;
  defaultOptions: IRNASeqSearchOptions;
  setToggled: Dispatch<SetStateAction<IRNASeqSearchOptions>>;
  counts: { current: number, total: number };
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  disabled?: boolean;
  handleHidePlots: (hidden: boolean) => void;
}

export default function RNASeqSearchFilterBar({
  toggled,
  emptyOptions,
  defaultOptions,
  setToggled,
  counts,
  loading,
  setLoading,
  handleHidePlots,
  disabled,
}: IRNASeqSearchFilterBarProps): JSX.Element {
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
        <RNASeqSearchFilterExtraOptions
          onHidePlots={handleHidePlots}
          disabled={disabled}
        />
      )}
    >
      <FilterButton
        toggled={toggled}
        setToggled={setToggled}
        clearFilters={clearAll}
        filterOptions={
          RNASeqFilterOptions({
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
        sortOptions={rnaSortMenuOptions}
        disabled={disabled}
      />
    </SearchFilterBar>
  );
}
