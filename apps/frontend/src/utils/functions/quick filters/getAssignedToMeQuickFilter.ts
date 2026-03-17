import { IUserWithMetadata } from '@/types/Auth/User.types';
import { IQuickFilter } from '@/types/Common.types';
import { IClinicalDashboardSearchOptions } from '@/types/Search.types';
import { ITaskDashboardFilters } from '@/types/TaskDashboard/TaskDashboard.types';
import { Dispatch, SetStateAction } from 'react';

export default function getAssignedToMeQuickFilter<
T extends IClinicalDashboardSearchOptions | ITaskDashboardFilters
>(
  setToggled: Dispatch<SetStateAction<T>>,
  currentUserData: IUserWithMetadata,
  disabled?: boolean,
): IQuickFilter<T> {
  const currentUser = `${currentUserData?.givenName} ${currentUserData?.familyName}::${currentUserData?.id}`;
  const isQFActive = (
    filters,
  ): boolean => filters.assignees?.length === 1 && filters.assignees[0] === currentUser;

  return ({
    label: 'Assigned to me',
    disabled,
    onClick: () => setToggled((prev): T => ({
      ...prev,
      assignees: isQFActive(prev) ? [] : [currentUser],
    })),
    checkIsActive: (filters) => isQFActive(filters),
  });
}
