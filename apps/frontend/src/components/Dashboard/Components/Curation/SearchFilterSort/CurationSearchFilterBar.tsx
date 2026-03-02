import {
  Dispatch, SetStateAction, useState, type JSX,
} from 'react';
import { Box } from '@mui/material';
import { FileTextIcon } from 'lucide-react';
import QuickFilters from '@/components/SearchFilterBar/QuickFilters/QuickFilters';
import useGetAssignedToMeQuickFilter from '@/hooks/QuickFilters/useGetAssignedToMeQuickFilter';
import { IAnalysisSet, IAnalysisSetFilters } from '@/types/Analysis/AnalysisSets.types';
import getExpeditedQuickFilter from '@/utils/functions/quick filters/getExpeditedQuickFilter';
import FilterButton from '@/components/SearchFilterBar/Buttons/FilterButton';
import CustomButton from '@/components/Common/Button';
import { dashboardSortMenu } from '../../../../../constants/Curation/dashboard';
import { DashboardExportOptions } from '../../../../../types/Search.types';
import Search from '../../../../Search/Search';
import SearchFilterBar from '../../../../SearchFilterBar/SearchFilterBar';
import SortButton from '../../../../SearchFilterBar/Buttons/SortButton';
import ExportButton from './CurationExportButton';
import DashboardFilterOptions from './CurationFilterOptions';

interface IProps {
  toggled: IAnalysisSetFilters;
  setToggled: Dispatch<SetStateAction<IAnalysisSetFilters>>;
  exportOptions: DashboardExportOptions;
  setExportOptions: Dispatch<SetStateAction<DashboardExportOptions>>;
  getDashboardData: () => Promise<IAnalysisSet[]>
  getFileTrackerFiles: (event: React.MouseEvent<HTMLButtonElement>) => void;
  emptyOptions: IAnalysisSetFilters;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  counts?: {current: number, total: number}
}

export default function CurationSearchFilterBar({
  toggled,
  setToggled,
  exportOptions,
  setExportOptions,
  getDashboardData,
  getFileTrackerFiles,
  emptyOptions,
  loading,
  setLoading,
  counts,
}: IProps): JSX.Element {
  const [value, setValue] = useState<string>('');

  const areEnrolledOrWithdrawnActive = toggled.enrolledOnlyCases || toggled.withdrawnCases;

  const assignedToMeQuickFilter = useGetAssignedToMeQuickFilter('Curation', toggled, setToggled, areEnrolledOrWithdrawnActive);

  // this function is used both to Clear all filters, reset to default, but also
  // to reset the filter when user selects "Registered-only patients/Withdrawn patients" filter
  const resetAll = (newValue?: 'enrolledOnlyCases' | 'withdrawnCases'): void => {
    // enrolledOnlyCases & withdrawnCases filters are not combinable with other filters
    // So when toggled on, empty filter too just in case
    setToggled(newValue
      ? { ...emptyOptions, [newValue]: true }
      : emptyOptions);
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
        setToggled({ ...toggled, search: uniqueValArr });
      }
    } else {
      setToggled({ ...toggled, search: [] });
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
          placeholder={value ? value.replaceAll('\n', '; ') : 'Search'}
          loading={loading}
        />
      )}
      isDefault={!(checkFilters() || toggled.sortColumns?.length)}
      resetToDefault={resetAll}
      counts={counts}
      afterCounts={(
        <Box
          display="flex"
          gap="8px"
          marginLeft="8px"
        >
          <CustomButton
            onClick={getFileTrackerFiles}
            variant="text"
            label="Related"
            size="small"
            startIcon={<FileTextIcon width="20px" height="20px" />}
          />
          <ExportButton
            exportOptions={exportOptions}
            setExportOptions={setExportOptions}
            getDashboardData={getDashboardData}
            disabled={areEnrolledOrWithdrawnActive}
          />
        </Box>
      )}
    >
      <FilterButton
        toggled={toggled}
        setToggled={setToggled}
        clearFilters={resetAll}
        filterOptions={DashboardFilterOptions({
          toggled, setToggled, loading, setLoading,
        })}
        loading={loading}
        setLoading={setLoading}
      />
      <SortButton
        toggled={toggled}
        setToggled={setToggled}
        sortOptions={dashboardSortMenu}
      />
      <QuickFilters
        quickFilters={[
          getExpeditedQuickFilter(toggled, setToggled, areEnrolledOrWithdrawnActive),
          assignedToMeQuickFilter,
        ]}
        toggled={toggled}
      />
    </SearchFilterBar>
  );
}
