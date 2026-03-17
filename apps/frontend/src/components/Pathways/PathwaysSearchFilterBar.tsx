import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import { IPathwaySearchOptions } from '../../types/Search.types';
import Search from '../Search/Search';
import SearchFilterBar from '../SearchFilterBar/SearchFilterBar';

interface IPathwaysSearchFilterBarProps {
  toggled: IPathwaySearchOptions;
  emptyOptions: IPathwaySearchOptions;
  setToggled: Dispatch<SetStateAction<IPathwaySearchOptions | undefined>>;
  counts: { current: number, total: number };
  loading: boolean;
  disabled?: boolean;
}

export default function PathwaysSearchFilterBar({
  toggled,
  emptyOptions,
  setToggled,
  counts,
  loading,
  disabled,
}: IPathwaysSearchFilterBarProps): JSX.Element {
  const [search, setSearch] = useState<string>(toggled.search || '');

  const resetAll = (): void => {
    setToggled(emptyOptions);
    setSearch('');
  };

  const checkFilters = (): boolean => JSON.stringify(toggled) !== JSON.stringify(emptyOptions);

  return (
    <SearchFilterBar
      search={(
        <Search
          searchMethod={(query: string): void => setToggled({ ...toggled, search: query })}
          searchOnChange={false}
          value={search}
          setValue={setSearch}
          loading={loading}
          disabled={disabled}
        />
      )}
      counts={counts}
      isDefault={!(checkFilters())}
      resetToDefault={resetAll}
    />
  );
}
