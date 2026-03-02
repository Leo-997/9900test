import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import DiagnosisFilterOptions from '@/components/SearchFilterBar/DiagnosisFilterOptions';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IMolecularAlterationSearchOptions } from '../../../../../../../types/Search.types';
import Search from '../../../../../../Search/Search';
import FilterButton from '../../../../../../SearchFilterBar/Buttons/FilterButton';
import SearchFilterBar from '../../../../../../SearchFilterBar/SearchFilterBar';
import SortButton from '../../../../../../SearchFilterBar/Buttons/SortButton';
import { leftPanelSortMenuOptions } from '../../../../../../../constants/MTB/leftPanel';

interface ILeftPanelSearchFilterBarProps {
  toggled: IMolecularAlterationSearchOptions;
  setToggled: Dispatch<SetStateAction<IMolecularAlterationSearchOptions>>;
  emptyOptions: IMolecularAlterationSearchOptions;
  loading: boolean;
  counts?: { current: number; total: number };
}

export default function LeftPanelSearchFilterBar({
  toggled,
  setToggled,
  emptyOptions,
  loading,
  counts,
}: ILeftPanelSearchFilterBarProps): JSX.Element {
  const [value, setValue] = useState<string>('');

  const canFilterAlterations = useIsUserAuthorised('clinical.sample.read');

  const resetAll = (): void => {
    setToggled(emptyOptions);
    setValue('');
  };

  const checkFilters = (): boolean => JSON.stringify(toggled) === JSON.stringify(emptyOptions);

  const searchMethod = (query: string): void => {
    const delim = /\s*;\s*/;
    if (query && query.length > 0) {
      const valArr = query.replace(/\n/g, ';').split(delim);
      let uniqueValArr = [...new Set(valArr)];
      uniqueValArr = uniqueValArr.filter((val) => val !== '');
      if (uniqueValArr && uniqueValArr.length > 0) {
        setToggled({ ...toggled, searchId: uniqueValArr });
      }
    } else {
      setToggled({ ...toggled, searchId: [] });
    }
  };

  return (
    <SearchFilterBar
      isDefault={checkFilters() && toggled.sortColumns?.length === 0}
      resetToDefault={resetAll}
      counts={counts}
      isCompressed
    >
      <Search
        searchMethod={(query: string): void => searchMethod(query)}
        searchOnChange={false}
        advancedSearch
        supportedFields="Sample ID"
        value={value}
        setValue={setValue}
        placeholder={value ? 'Click to view full query' : 'Search'}
        isCompressed
        disabled={!canFilterAlterations}
      />
      <FilterButton
        toggled={toggled}
        setToggled={setToggled}
        clearFilters={resetAll}
        filterOptions={DiagnosisFilterOptions({
          filters: toggled,
          setFilters: setToggled,
          loading,
        })}
        loading={loading}
        isCompressed
        disabled={!canFilterAlterations}
      />
      <SortButton
        toggled={toggled}
        setToggled={setToggled}
        sortOptions={leftPanelSortMenuOptions}
        isCompressed
        disabled={!canFilterAlterations}
      />
    </SearchFilterBar>
  );
}
