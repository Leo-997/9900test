import { useUser } from '@/contexts/UserContext';
import { IAnalysisSetFilters } from '@/types/Analysis/AnalysisSets.types';
import { IQuickFilter } from '@/types/Common.types';
import { IClinicalDashboardSearchOptions } from '@/types/Search.types';
import { Dispatch, SetStateAction, useMemo } from 'react';

const useGetAssignedToMeQuickFilter = <
  T extends IAnalysisSetFilters | IClinicalDashboardSearchOptions
>(
    type: 'Curation' | 'Clinical',
    toggled: T,
    setToggled: Dispatch<SetStateAction<T>>,
    disabled?: boolean,
  ): IQuickFilter<T> => {
  const { currentUser } = useUser();

  const user = `${currentUser?.givenName} ${currentUser?.familyName}::${currentUser?.id}`;

  const key = type === 'Curation' ? 'primaryCurators' : 'assignees';

  const assignedToMeQuickFilter = useMemo(() => ({
    label: 'Assigned to me',
    disabled,
    onClick: ():void => {
      if (toggled[key]?.includes(user)) {
        setToggled((prev) => ({
          ...prev,
          [key]: prev[key].filter((assignee) => assignee !== user),
        }));
        return;
      }
      setToggled((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), user],
      }));
    },
    checkIsActive: (updatedFilters: T) => (
      updatedFilters[key]?.includes(user)
    ),
  }), [key, setToggled, toggled, user, disabled]);

  return assignedToMeQuickFilter;
};

export default useGetAssignedToMeQuickFilter;
