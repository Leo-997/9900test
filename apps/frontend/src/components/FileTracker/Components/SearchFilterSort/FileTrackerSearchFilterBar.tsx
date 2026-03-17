import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import { IFileTrackerSearchOptions } from '../../../../types/Search.types';
import Search from '../../../Search/Search';
import FilterButton from '../../../SearchFilterBar/Buttons/FilterButton';
import SearchFilterBar from '../../../SearchFilterBar/SearchFilterBar';
import SortButton from '../../../SearchFilterBar/Buttons/SortButton';
import DownloadButton from './FileTrackerDownloadButton';
import FileTrackerFilterOptions from './FileTrackerFilterOptions';
import { fileTrackerSortMenuOptions } from '../../../../constants/File Tracker/sortMenuOptions';

interface IFileTrackerSearchFilterBarProps {
  toggled: IFileTrackerSearchOptions;
  setToggled: Dispatch<SetStateAction<IFileTrackerSearchOptions>>;
  emptyOptions: IFileTrackerSearchOptions;
  selectedFiles: string[];
  loading: boolean;
  counts?: { current: number, total: number };
}

export default function FileTrackerSearchFilterBar({
  toggled,
  setToggled,
  selectedFiles,
  emptyOptions,
  loading,
  counts,
}: IFileTrackerSearchFilterBarProps): JSX.Element {
  const [value, setValue] = useState<string>(toggled.searchId.join('\n'));

  const resetAll = (): void => {
    setToggled(emptyOptions);
    setValue('');
  };

  const checkFilters = (): boolean => {
    if (JSON.stringify(toggled) !== JSON.stringify(emptyOptions)) {
      return true;
    }
    return false;
  };

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
          supportedFields="Filename, Sample ID and Patient ID."
          value={value}
          setValue={setValue}
          placeholder={value ? value.replaceAll('\n', '; ') : 'Search'}
          loading={loading}
        />
      )}
      isDefault={!checkFilters()}
      resetToDefault={resetAll}
      counts={counts}
    >
      <FilterButton
        toggled={toggled}
        setToggled={setToggled}
        clearFilters={resetAll}
        filterOptions={FileTrackerFilterOptions({ toggled, setToggled, loading })}
        loading={loading}
      />
      <SortButton
        toggled={toggled}
        setToggled={setToggled}
        sortOptions={fileTrackerSortMenuOptions}
      />
      <DownloadButton
        selectedFiles={selectedFiles}
      />
    </SearchFilterBar>
  );
}
