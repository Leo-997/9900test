import { Box, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import { DnaIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { JSX, useMemo } from 'react';
import { highRiskCohorts } from '@/constants/sample';
import { useUser } from '@/contexts/UserContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { Group } from '@/types/Auth/Group.types';
import { IUser } from '@/types/Auth/User.types';
import { AvatarStatus } from '@/types/Avatar.types';
import { IClinicalDashboardSample } from '@/types/Dashboard.types';
import { ClinicalReviewStatus } from '@/types/MTB/ClinicalStatus.types';
import { IReviewerData, UpdateClinicalVersionBody } from '@/types/MTB/MTB.types';
import { Cohorts } from '@/types/Samples/Sample.types';
import { DashboardRowType, ITaskDashboardFilters } from '@/types/TaskDashboard/TaskDashboard.types';
import { getStageAvatars } from '@/utils/components/taskdashboard/getStageAvatar';
import { mapMtbSlidesStatus } from '@/utils/components/taskdashboard/mapMtbSlidesStatus';
import UsersSectionListItem from '../StageProgressModal/UsersSection/UsersSectionListItem';
import TaskStageCell from './TaskStageCell';

interface IMTBAssignee {
  group: Group;
  isReviewer: boolean;
  key?: Extract<keyof UpdateClinicalVersionBody, 'cancerGeneticistId' | 'curatorId' | 'clinicianId'> | 'mtbChairId'
}

const mtbSlidesGroups: Record<string, IMTBAssignee> = {
  'MTB Chair': {
    group: 'MTBChairs',
    isReviewer: true,
    key: 'mtbChairId',
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Clinician: {
    group: 'Clinicians',
    isReviewer: false,
    key: 'clinicianId',
  },
  'Reviewing Clinician': {
    group: 'Clinicians',
    isReviewer: true,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Curator: {
    group: 'Curators',
    isReviewer: false,
    key: 'curatorId',
  },
  'Reviewing Curator': {
    group: 'Curators',
    isReviewer: true,
  },
  'Genetic Clinician': {
    group: 'CancerGeneticists',
    isReviewer: false,
    key: 'cancerGeneticistId',
  },
  'Reviewing Genetic Clinician': {
    group: 'Curators',
    isReviewer: true,
  },
};

interface IProps {
  curationData: IAnalysisSet;
  clinicalData: IClinicalDashboardSample | null;
  updateClinicalData?: (sample: IClinicalDashboardSample) => void;
  toggled: ITaskDashboardFilters,
  type?: DashboardRowType;
}

export function MTBSlidesCell({
  curationData,
  clinicalData,
  updateClinicalData,
  toggled,
  type = 'main',
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { users } = useUser();

  const canAssignUser = useIsUserAuthorised('clinical.sample.write');

  const isHighRisk = Boolean(
    curationData.cohort
    && (highRiskCohorts as readonly Cohorts[]).includes(curationData.cohort),
  );
  const isGermlineOnly = curationData.cohort === 'Cohort 13: Germline only';

  const disabled = !clinicalData
    || clinicalData?.pseudoStatus === 'N/A'
    || mapMtbSlidesStatus(
      clinicalData?.clinicalStatus,
      isHighRisk,
      isGermlineOnly,
    ) === 'N/A';

  const mapReviewStatus = (reviewStatus: ClinicalReviewStatus): AvatarStatus | undefined => {
    switch (reviewStatus) {
      case 'Completed':
        return 'done';
      case 'In Progress':
        return 'progress';
      case 'Ready for Review':
        return 'ready';
      default:
        return undefined;
    }
  };

  const clinicalAssignedUsers = useMemo(() => (
    Object.entries(mtbSlidesGroups).map(([title, group]) => {
      const review = group.isReviewer
        ? clinicalData?.reviewerIds.find((r) => r.group === group.group)
        : undefined;

      const userId = group.key
        ? clinicalData?.[group.key]
        : review?.reviewerId;

      const user = userId
        ? users.find((u) => u.id === userId)
        : undefined;

      return {
        key: `${title}-${clinicalData?.clinicalVersionId}`,
        user,
        title,
        status: review ? mapReviewStatus(review?.status) : undefined,
      };
    })
  ), [clinicalData, users]);

  const updateAssignedUser = async (
    key: Extract<keyof UpdateClinicalVersionBody, 'cancerGeneticistId' | 'curatorId' | 'clinicianId'> | 'mtbChairId',
    user: IUser | null,
  ): Promise<void> => {
    try {
      if (clinicalData?.clinicalVersionId) {
        await zeroDashSdk.mtb.clinical.updateClinicalVersionData(
          clinicalData.clinicalVersionId,
          { [key]: user?.id || null },
        );
        if (updateClinicalData) {
          updateClinicalData({
            ...clinicalData,
            [key]: user?.id || null,
          });
        }
      }
    } catch {
      enqueueSnackbar('Could not update clinical sample, please try again.');
    }
  };

  const updateReviewer = async (
    group: Group,
    user: IUser | null,
  ): Promise<void> => {
    try {
      if (clinicalData?.clinicalVersionId) {
        await zeroDashSdk.mtb.clinical.removeReviewer(clinicalData.clinicalVersionId, group);
        let newReview: IReviewerData | undefined;
        if (user) {
          await zeroDashSdk.mtb.clinical.addReviewer(
            clinicalData.clinicalVersionId,
            {
              reviewerId: user.id,
              group,
            },
          );

          newReview = {
            reviewerId: user.id,
            status: 'Assigned',
            group,
          };
        }

        if (updateClinicalData) {
          updateClinicalData({
            ...clinicalData,
            reviewerIds: clinicalData.reviewerIds
              .filter((r) => r.group !== group)
              .concat(...(newReview ? [newReview] : [])),
          });
        }
      }
    } catch {
      enqueueSnackbar('Could not update clinical sample, please try again.');
    }
  };

  return (
    <TaskStageCell
      stageName="MTB Slides"
      data={clinicalData}
      disabled={disabled}
      type={type}
      avatars={clinicalData
        ? getStageAvatars(
          toggled,
          'MTB_SLIDES',
          clinicalAssignedUsers,
        ) : undefined}
      status={clinicalData?.pseudoStatus
        || mapMtbSlidesStatus(clinicalData?.clinicalStatus, isHighRisk, isGermlineOnly)}
      columnWidths={{
        minWidth: '180px',
        width: '10vw',
      }}
      dateChip={clinicalData?.meetings.find((r) => r.type === 'MTB')?.date
        ? ({
          date: dayjs(clinicalData?.meetings.find((r) => r.type === 'MTB')?.date).format('DD/MM/YYYY'),
        }) : undefined}
      icon={clinicalData?.isGermlineOnly && (
        <Tooltip title="Germline only">
          <Box
            sx={{
              backgroundColor: corePalette.orange30,
              color: corePalette.orange150,
              borderRadius: '5px',
            }}
          >
            <DnaIcon />
          </Box>
        </Tooltip>
      )}
      startAt={curationData.curationFinalisedAt}
      finalisedAt={clinicalData?.clinicalStatus === 'Done' ? clinicalData?.slidesFinalisedAt : null}
      averageDays={{
        belowAvgDays: 3,
        aboveAvgDays: 6,
      }}
      modalUsersSectionContent={(
        <>
          {Object.entries(mtbSlidesGroups).map(([title, group]) => {
            const review = group.isReviewer
              ? clinicalData?.reviewerIds.find((r) => r.group === group.group)
              : undefined;

            const userId = group.key
              ? clinicalData?.[group.key]
              : review?.reviewerId;

            const user = userId
              ? users.find((u) => u.id === userId)
              : undefined;

            return (
              <UsersSectionListItem
                group={group.group}
                assignedUser={{
                  key: `${title}-${clinicalData?.clinicalVersionId}-${user?.id}`,
                  user,
                  title,
                  status: review ? mapReviewStatus(review?.status) : undefined,
                }}
                onUpdate={(u): void => {
                  if (group.key) updateAssignedUser(group.key, u);
                  if (group.isReviewer) updateReviewer(group.group, u);
                }}
                disabled={!canAssignUser || clinicalData?.clinicalStatus === 'Done'}
              />
            );
          })}
        </>
        )}
    />
  );
}
