import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import type { JSX } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IUser } from '@/types/Auth/User.types';
import { AvatarStatus } from '@/types/Avatar.types';
import { ApprovalStatus } from '@/types/Reports/Approvals.types';
import { IReport, ITaskDashboardReport, ReportType } from '@/types/Reports/Reports.types';
import {
  CaseStatus,
  DashboardRowType,
  ITaskDashboardFilters,
  StageName, TaskDashboardStage,
} from '@/types/TaskDashboard/TaskDashboard.types';
import { IReportOption } from '@/types/misc.types';
import { getStageAvatars } from '@/utils/components/taskdashboard/getStageAvatar';
import { mapGroupName } from '@/utils/functions/mapGroupName';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import UsersSectionListItem from '../StageProgressModal/UsersSection/UsersSectionListItem';
import TaskStageCell from './TaskStageCell';

interface IProps {
  stage: IReportOption<ReportType>;
  report: ITaskDashboardReport | null;
  status: CaseStatus;
  curationData: IAnalysisSet;
  toggled: ITaskDashboardFilters,
  columnWidths: {
    minWidth: string;
    width: string;
  };
  averageDays: {
    belowAvgDays: number;
    aboveAvgDays: number;
  }
  type?: DashboardRowType;
  updateReport: (newReport: IReport) => void;
}

export default function ReportCell({
  stage,
  report,
  status,
  curationData,
  toggled,
  columnWidths,
  averageDays,
  type = 'main',
  updateReport,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { users } = useUser();

  const isReadOnly = useIsPatientReadOnly(
    { analysisSetId: report?.analysisSetId },
  );
  const canAssignApprover = useIsUserAuthorised('report.assign') && !isReadOnly;

  const disabled = !report || report.pseudoStatus === 'N/A';

  const mapReportToAvatarStatus = (approvalStatus: ApprovalStatus): AvatarStatus => {
    switch (approvalStatus) {
      case 'approved':
        return 'done';
      case 'pending':
        return 'progress';
      default:
        return 'ready';
    }
  };

  const updateApproval = async (
    approvalId: string,
    user: IUser | null,
  ): Promise<void> => {
    try {
      await zeroDashSdk.services.reports.updateApproval(
        approvalId,
        {
          assigneeId: user?.id ?? null,
        },
      );

      if (report) {
        updateReport({
          ...report,
          approvals: report.approvals?.map((a) => (
            a.id === approvalId
              ? { ...a, assigneeId: user?.id ?? null }
              : a
          )),
        });
      }
    } catch {
      enqueueSnackbar('Could not update curator, please try again.');
    }
  };

  return (
    <TaskStageCell
      stageName={stage.name as StageName}
      data={report}
      disabled={disabled}
      patientId={curationData.patientId}
      avatars={report
        ? getStageAvatars(
          toggled,
          stage.value as TaskDashboardStage,
          report.approvals?.map((a) => ({
            key: `${a.id}-${a.assigneeId}`,
            user: users.find((u) => u.id === a.assigneeId),
            status: mapReportToAvatarStatus(a.status),
          })) || [],
        ) : undefined}
      type={type}
      columnWidths={columnWidths}
      status={status}
      startAt={report?.startedAt ?? curationData.curationFinalisedAt}
      finalisedAt={report?.status === 'approved' ? report?.approvedAt : null}
      averageDays={averageDays}
      dateChip={report?.approvedAt
        ? ({
          date: dayjs(report.approvedAt).format('DD/MM/YYYY'),
        })
        : undefined}
      modalUsersSectionContent={(
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {report?.approvals
            ?.filter((a) => a.status === 'approved' || a.status === 'pending')
            ?.map((approval) => {
              const user = users.find((u) => u.id === approval.assigneeId);
              return (
                <UsersSectionListItem
                  key={approval.id}
                  group={approval.groupName}
                  assignedUser={{
                    key: `${approval.id}-${user?.id}`,
                    user,
                    title: approval.status === 'cancelled'
                      ? 'Not required'
                      : user?.title || approval.label || mapGroupName(approval.groupName),
                    status: mapReportToAvatarStatus(approval.status),
                  }}
                  onUpdate={(u): void => { updateApproval(approval.id, u); }}
                  disabled={
                  !canAssignApprover
                  || report.status === 'approved'
                  || approval.status === 'approved'
                  || approval.status === 'cancelled'
                }
                />
              );
            })}
        </>
      )}
    />
  );
}
