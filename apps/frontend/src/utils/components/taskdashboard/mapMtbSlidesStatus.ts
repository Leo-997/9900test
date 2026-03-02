import { ClinicalStatus } from '@/types/MTB/ClinicalStatus.types';
import { CaseStatus } from '@/types/TaskDashboard/TaskDashboard.types';

export const mapMtbSlidesStatus = (
  status: ClinicalStatus | undefined,
  isHighRisk: boolean,
  isGermlineOnly: boolean,
): CaseStatus => {
  if (!status) {
    if (!isHighRisk || isGermlineOnly) {
      return 'N/A';
    }

    return 'Upcoming';
  }

  return status;
};
