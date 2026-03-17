import { ApprovalStatus } from '@/types/Reports/Approvals.types';
import { IReport, ReportType } from '@/types/Reports/Reports.types';
import { CaseStatus, PseudoStatus } from '@/types/TaskDashboard/TaskDashboard.types';

export const mapReportStatus = (
  reportType: ReportType,
  status: ApprovalStatus | PseudoStatus | undefined,
  isGermlineOnly: boolean,
  isHighRisk: boolean,
  molecularReport?: IReport | null,
): CaseStatus => {
  switch (status) {
    case 'pending':
      return 'In Progress';
    case 'approved':
      return 'Done';
    case 'rejected':
    case 'cancelled':
      return 'Upcoming';
    case undefined:
      if (reportType === 'MOLECULAR_REPORT' && isGermlineOnly) return 'N/A';
      if (
        reportType === 'MTB_REPORT'
          && (
            !isHighRisk
            || molecularReport?.metadata?.['molecular.hidePanel'] === 'true'
            || isGermlineOnly
          )
      ) {
        return 'N/A';
      }
      return 'Upcoming';
    default:
      return status;
  }
};
