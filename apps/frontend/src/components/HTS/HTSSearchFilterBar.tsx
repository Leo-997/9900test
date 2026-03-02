import { Box } from '@mui/material';
import { DownloadIcon } from 'lucide-react';
import {
  Dispatch, SetStateAction, useState, type JSX,
} from 'react';
import { htsSortMenuOptions } from '@/constants/HTS/hts';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IDrugScreen } from '@/types/Drugs/Screen.types';
import { IHTSSearchOptions } from '../../types/Search.types';
import CustomButton from '../Common/Button';
import CustomTypography from '../Common/Typography';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';
import { HTSTabView } from '../PreCurationTabs/HTSTabContent';
import Search from '../Search/Search';
import SearchFilterBar from '../SearchFilterBar/SearchFilterBar';
import SortButton from '../SearchFilterBar/Buttons/SortButton';
import { HTSFilterButton } from './HTSFilterButton';

interface IHTSSearchFilterBarProps {
  screens: IDrugScreen[];
  toggled: IHTSSearchOptions;
  setToggled: Dispatch<SetStateAction<IHTSSearchOptions>>;
  emptyOptions: IHTSSearchOptions;
  exportData: () => Promise<void>;
  counts: { current: number, total: number };
  loading: boolean;
  view: HTSTabView;
  onViewChange: (view: HTSTabView) => void;
}

export default function HTSSearchFilterBar({
  screens,
  toggled,
  emptyOptions,
  setToggled,
  exportData,
  counts,
  loading,
  view,
  onViewChange,
}: IHTSSearchFilterBarProps): JSX.Element {
  const [search, setSearch] = useState<string>(toggled.search || '');
  const [exporting, setExporting] = useState<boolean>(false);

  const canDownload = useIsUserAuthorised('curation.sample.hts.download');

  const resetAll = (): void => {
    setToggled(emptyOptions);
    setSearch('');
  };

  const checkFilters = (): boolean => JSON.stringify(toggled) === JSON.stringify(emptyOptions);

  const handleExport = async (): Promise<void> => {
    setExporting(true);
    await exportData();
    setExporting(false);
  };

  return (
    <SearchFilterBar
      search={(
        <Search
          searchMethod={(query: string): void => setToggled({ ...toggled, search: query })}
          searchOnChange={false}
          value={search}
          setValue={setSearch}
          loading={loading}
        />
      )}
      isDefault={checkFilters()}
      resetToDefault={resetAll}
      counts={counts}
      styleOverride={{
        position: 'sticky',
        top: 0,
        borderRadius: 4,
        zIndex: 1,
      }}
      afterCounts={canDownload && (
        <Box
          height="100%"
          display="flex"
          alignItems="center"
          padding="0px 8px"
          gap="8px"
        >
          <CustomTypography variant="label">
            View
          </CustomTypography>
          <AutoWidthSelect
            options={[
              {
                value: 'Drugs',
                name: 'Drugs',
              },
              {
                value: 'Drug Combination',
                name: 'Drug Combination',
              },
            ]}
            value={view}
            onChange={(e): void => onViewChange(e.target.value as HTSTabView)}
          />
          <CustomButton
            variant="text"
            size="small"
            label={(<b>Export</b>)}
            startIcon={<DownloadIcon />}
            onClick={() => { handleExport(); }}
            loading={exporting}
          />
        </Box>
      )}
    >
      <HTSFilterButton
        toggled={toggled}
        setToggled={setToggled}
        clearFilters={resetAll}
        screens={screens}
      />
      <SortButton
        sortOptions={htsSortMenuOptions}
        toggled={toggled}
        setToggled={setToggled}
      />
    </SearchFilterBar>
  );
}
