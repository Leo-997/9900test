import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IClinicalDashboardSearchOptions } from '../../../../../types/Search.types';
import Search from '../../../../Search/Search';
import SearchFilterBar from '../../../../SearchFilterBar/SearchFilterBar';

interface IPopupSearchBarProps {
  toggled: Pick<IClinicalDashboardSearchOptions, 'searchId'>;
  setToggled: Dispatch<SetStateAction<Pick<IClinicalDashboardSearchOptions, 'searchId'> | undefined>>;
  emptyOptions: Pick<IClinicalDashboardSearchOptions, 'searchId'>;
  loading: boolean;
}

export default function PopupSearchBar({
  toggled,
  setToggled,
  emptyOptions,
  loading,
}: IPopupSearchBarProps): JSX.Element {
  const [value, setValue] = useState<string>('');

  const canFilterClinicalDashboard = useIsUserAuthorised('clinical.sample.read');

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
      dashboard
      search={(
        <Search
          searchMethod={(query: string): void => searchMethod(query)}
          searchOnChange={false}
          advancedSearch
          supportedFields="Sample ID, Patient ID, Labmatrix Subject ID, Public Patient ID and Manifest Name."
          value={value}
          setValue={setValue}
          placeholder={value ? 'Click to view full query' : 'Search'}
          disabled={!canFilterClinicalDashboard || loading}
        />
      )}
    />
  );
}
