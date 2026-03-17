import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import QuickFilters from '@/components/SearchFilterBar/QuickFilters/QuickFilters';
import getExpeditedQuickFilter from '@/utils/functions/quick filters/getExpeditedQuickFilter';
import useGetAssignedToMeQuickFilter from '@/hooks/QuickFilters/useGetAssignedToMeQuickFilter';
import { IClinicalDashboardSearchOptions } from '../../../../../types/Search.types';
import Search from '../../../../Search/Search';
import FilterButton from '../../../../SearchFilterBar/Buttons/FilterButton';
import SearchFilterBar from '../../../../SearchFilterBar/SearchFilterBar';
import SortButton from '../../../../SearchFilterBar/Buttons/SortButton';
import ClinicalFilterOptions from './ClinicalFilterOptions';
import { clinicalSortMenu } from '../../../../../constants/Clinical/searchFilterBar';

interface IClinicalSearchFilterBarProps {
  toggled: IClinicalDashboardSearchOptions;
  setToggled: Dispatch<SetStateAction<IClinicalDashboardSearchOptions>>;
  emptyOptions: IClinicalDashboardSearchOptions;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  counts?: {current: number, total: number};
}

export default function ClinicalSearchFilterBar({
  toggled,
  setToggled,
  emptyOptions,
  loading,
  setLoading,
  counts,
}: IClinicalSearchFilterBarProps): JSX.Element {
  const [value, setValue] = useState<string>('');

  const assignedToMeQuickFilter = useGetAssignedToMeQuickFilter('Clinical', toggled, setToggled);

  const canFilterClinicalDashboard = useIsUserAuthorised('clinical.sample.read');

  const resetAll = (): void => {
    setToggled(emptyOptions);
    setValue('');
  };

  const checkFilters = (): boolean => JSON.stringify(toggled) !== JSON.stringify(emptyOptions);

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
      dashboard
      isDefault={!(checkFilters() || toggled.sortColumns?.length !== 0)}
      resetToDefault={resetAll}
      counts={counts}
      search={(
        <Search
          searchMethod={(query: string): void => searchMethod(query)}
          searchOnChange={false}
          advancedSearch
          supportedFields="Sample ID, Patient ID, Labmatrix Subject ID, Public Patient ID and Manifest Name."
          value={value}
          setValue={setValue}
          placeholder={value ? 'Click to view full query' : 'Search'}
          disabled={!canFilterClinicalDashboard}
        />
      )}
    >
      <FilterButton
        toggled={toggled}
        setToggled={setToggled}
        clearFilters={resetAll}
        filterOptions={ClinicalFilterOptions({
          toggled, setToggled, loading, setLoading,
        })}
        loading={loading}
        setLoading={setLoading}
        disabled={!canFilterClinicalDashboard}
      />
      <SortButton
        toggled={toggled}
        setToggled={setToggled}
        sortOptions={clinicalSortMenu}
        disabled={!canFilterClinicalDashboard}
      />
      <QuickFilters
        quickFilters={[
          getExpeditedQuickFilter(toggled, setToggled),
          assignedToMeQuickFilter,
        ]}
        toggled={toggled}
      />
    </SearchFilterBar>
  );
}
