import { AvatarStatus } from '@/types/Avatar.types';
import { SecondaryCurationStatus } from '@/types/Samples/Sample.types';

export const getSecCuratorAvatarStatus = (
  status: SecondaryCurationStatus,
): AvatarStatus | undefined => {
  if (status === 'Not Started') return 'ready';
  if (status === 'In Progress') return 'progress';
  if (status === 'Completed') return 'done';

  return undefined;
};
