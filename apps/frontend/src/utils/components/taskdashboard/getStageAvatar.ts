import { Avatar } from '@/types/Avatar.types';
import { ITaskDashboardFilters, TaskDashboardStage } from '@/types/TaskDashboard/TaskDashboard.types';

export const getStageAvatars = (
  toggled: ITaskDashboardFilters,
  cellStage: TaskDashboardStage,
  assignedUsers: Avatar[],
): Avatar[] => {
  const usersAvatars: Avatar[] = [];

  if (
    toggled.assignees?.length
      && (
        (toggled.stage && (toggled.stage === cellStage))
        || (!toggled.stage)
      )
  ) {
    return assignedUsers.filter((a) => toggled.assignees?.some((t) => t.split('::')[1] === a.user?.id));
  }

  return usersAvatars;
};
