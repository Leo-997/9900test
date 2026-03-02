import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import Search from '../../Search/Search';
import SearchFilterBar from '../../SearchFilterBar/SearchFilterBar';
import { IGetReportsQuery } from '../../../types/Reports/Reports.types';
import SortButton from '../../SearchFilterBar/Buttons/SortButton';
import ReportFilterButton from './ReportsFilterButton';
import { reportSortOptions } from '../../../constants/Reports/reports';

interface IProps {
  toggled: IGetReportsQuery;
  setToggled: Dispatch<SetStateAction<IGetReportsQuery>>;
  defaultOptions: IGetReportsQuery;
  loading: boolean;
  counts?: {current: number, total: number};
}

export default function ReportsSearchFilterBar({
  toggled,
  setToggled,
  defaultOptions,
  loading,
  counts,
}: IProps): JSX.Element {
  const [value, setValue] = useState<string>('');

  const resetAll = (): void => {
    setToggled(defaultOptions);
    setValue('');
  };

  const checkFilters = (): boolean => (
    JSON.stringify(toggled) !== JSON.stringify(defaultOptions)
  );

  const searchMethod = (query: string): void => {
    const delim = /\s*;\s*/;
    if (query && query.length > 0) {
      const valArr = query.replace(/\n/g, ';').split(delim);
      let uniqueValArr = [...new Set(valArr)];
      uniqueValArr = uniqueValArr.filter((val) => val !== '');
      if (uniqueValArr && uniqueValArr.length > 0) {
        setToggled({ ...toggled, analysisSetIds: uniqueValArr });
      }
    } else {
      setToggled({ ...toggled, analysisSetIds: [] });
    }
  };

  return (
    <SearchFilterBar
      dashboard
      isDefault={!(checkFilters() || (toggled.sortColumns?.length || 0) !== 0)}
      resetToDefault={resetAll}
      counts={counts}
      search={(
        <Search
          searchMethod={(query: string): void => searchMethod(query)}
          searchOnChange={false}
          advancedSearch
          supportedFields="Sample ID, Patient ID"
          value={value}
          setValue={setValue}
          placeholder={value ? 'Click to view full query' : 'Search'}
        />
      )}
    >
      <ReportFilterButton
        toggled={toggled}
        setToggled={setToggled}
        loading={loading}
      />
      <SortButton
        toggled={toggled}
        setToggled={setToggled}
        sortOptions={reportSortOptions}
      />
    </SearchFilterBar>
  );
}
