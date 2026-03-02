import { IAnalysisSetFilters } from '@/types/Analysis/AnalysisSets.types';
import { IQuickFilter } from '@/types/Common.types';
import { IClinicalDashboardSearchOptions } from '@/types/Search.types';
import { ITaskDashboardFilters } from '@/types/TaskDashboard/TaskDashboard.types';
import { Dispatch, SetStateAction } from 'react';

export default function getExpeditedQuickFilter<
T extends IAnalysisSetFilters | IClinicalDashboardSearchOptions | ITaskDashboardFilters
>(
  toggled: T,
  setToggled: Dispatch<SetStateAction<T>>,
  disabled?: boolean,
): IQuickFilter<T> {
  return ({
    label: 'Expedited',
    disabled,
    onClick: ():void => {
      setToggled({
        ...toggled,
        expedited: !toggled.expedited,
      });
    },
    checkIsActive: (updatedFilters) => (
      Boolean(updatedFilters.expedited)
    ),
  });
}
