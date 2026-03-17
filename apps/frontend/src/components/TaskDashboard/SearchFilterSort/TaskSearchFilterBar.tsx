import {
  Dispatch, SetStateAction, useState, type JSX,
} from 'react';
import Search from '@/components/Search/Search';
import FilterButton from '@/components/SearchFilterBar/Buttons/FilterButton';
import QuickFilters from '@/components/SearchFilterBar/QuickFilters/QuickFilters';
import SearchFilterBar from '@/components/SearchFilterBar/SearchFilterBar';
import { useUser } from '@/contexts/UserContext';
import { IQuickFilter } from '@/types/Common.types';
import { IOverviewExport, ITaskDashboardFilters } from '@/types/TaskDashboard/TaskDashboard.types';
import getAssignedToMeQuickFilter from '@/utils/functions/quick filters/getAssignedToMeQuickFilter';
import TaskDashboardFilterOptions from './TaskDashboardFilterOptions';
import OverviewExportButton from './OverviewExportButton';

interface IProps {
  toggled: ITaskDashboardFilters;
  setToggled: Dispatch<SetStateAction<ITaskDashboardFilters>>;
  getDashboardData: () => Promise<IOverviewExport[]>
  emptyOptions: ITaskDashboardFilters;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  counts?: {current: number, total: number}
}

export default function TaskSearchFilterBar({
  toggled,
  setToggled,
  getDashboardData,
  emptyOptions,
  loading,
  setLoading,
  counts,
}: IProps): JSX.Element {
  const { currentUser } = useUser();

  const [value, setValue] = useState<string>('');

  const areEnrolledOrWithdrawnActive = toggled.enrolledOnlyCases || toggled.withdrawnCases;

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

  const getAllQuickFilters = (): IQuickFilter<ITaskDashboardFilters>[] => {
    if (!currentUser) return [];

    const assignedToMeQuickFilter = getAssignedToMeQuickFilter(
      setToggled,
      currentUser,
      areEnrolledOrWithdrawnActive,
    );
    const assignedSecondCheckQuickFilter = currentUser.roles.some((r) => r.name === 'ZeroDash Curator')
      ? {
        label: 'Assigned second check',
        disabled: areEnrolledOrWithdrawnActive,
        onClick: () => setToggled((prev): ITaskDashboardFilters => ({
          ...prev,
          assignedSecCurator: !prev.assignedSecCurator ? currentUser.id : undefined,
        })),
        checkIsActive: (filters) => Boolean(filters.assignedSecCurator),
      }
      : undefined;
    const overdueReportsQuickFilter: IQuickFilter<ITaskDashboardFilters> = {
      label: 'Overdue reports',
      disabled: areEnrolledOrWithdrawnActive,
      onClick: () => setToggled((prev): ITaskDashboardFilters => ({
        ...prev,
        overdueReports: !prev.overdueReports,
      })),
      checkIsActive: (filters) => Boolean(filters.overdueReports),
    };
    const activeCasesQuickFilter: IQuickFilter<ITaskDashboardFilters> = {
      label: 'Active cases',
      disabled: areEnrolledOrWithdrawnActive,
      onClick: () => setToggled((prev): ITaskDashboardFilters => ({
        ...prev,
        activeCases: !prev.activeCases,
      })),
      checkIsActive: (filters) => Boolean(filters.activeCases),
    };

    return [
      assignedToMeQuickFilter,
      ...(assignedSecondCheckQuickFilter ? [assignedSecondCheckQuickFilter] : []),
      overdueReportsQuickFilter,
      activeCasesQuickFilter,
    ];
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
          disabled={loading}
        />
      )}
      isDefault={!(checkFilters())}
      resetToDefault={resetAll}
      counts={counts}
      afterCounts={(
        <OverviewExportButton
          getDashboardData={getDashboardData}
          disabled={areEnrolledOrWithdrawnActive}
        />
      )}
    >
      <FilterButton
        toggled={toggled}
        setToggled={setToggled}
        clearFilters={resetAll}
        filterOptions={TaskDashboardFilterOptions({
          toggled, setToggled, loading, setLoading,
        })}
        loading={loading}
        setLoading={setLoading}
      />
      <QuickFilters
        quickFilters={getAllQuickFilters()}
        toggled={toggled}
        isLoading={loading}
      />
    </SearchFilterBar>
  );
}
