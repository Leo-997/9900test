import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import {
  JSX,
  useEffect, useMemo, useState,
} from 'react';
import { useUser } from '@/contexts/UserContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IAnalysisSet, IUpdateAnalysisSetBody } from '@/types/Analysis/AnalysisSets.types';
import { IPipeline } from '@/types/Analysis/Biosamples.types';
import { IUser } from '@/types/Auth/User.types';
import { Avatar } from '@/types/Avatar.types';
import { IDateChip } from '@/types/Chip.types';
import { DashboardRowType } from '@/types/TaskDashboard/TaskDashboard.types';
import { getSecCuratorAvatarStatus } from '@/utils/components/avatar/getSecCuratorAvatarStatus';
import getPrimaryBiosample from '@/utils/functions/biosamples/getPrimaryBiosample';
import UsersSectionListItem from '../StageProgressModal/UsersSection/UsersSectionListItem';
import TaskStageCell from './TaskStageCell';

interface IProps {
  data: IAnalysisSet;
  updateData?: (newSet: IAnalysisSet) => void
  type?: DashboardRowType;
}

export default function CurationCell({
  data,
  updateData,
  type = 'main',
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { users } = useUser();
  const { enqueueSnackbar } = useSnackbar();

  const [pipelines, setPipelines] = useState<IPipeline[]>();

  const canUpdateCurator = useIsUserAuthorised('curation.sample.write');

  const assignedCurators = useMemo<Avatar[]>(() => {
    const assignedUsers: Avatar[] = [];

    const primaryCurator = users.find((u) => u.id === data.primaryCuratorId);
    assignedUsers.push({
      key: `primary::${data.analysisSetId}::${primaryCurator?.id}`,
      user: primaryCurator,
      title: 'Primary Curator',
    });

    const secondaryCurator = users.find((u) => u.id === data.secondaryCuratorId);
    assignedUsers.push({
      key: `secondary::${data.analysisSetId}::${secondaryCurator?.id}`,
      user: secondaryCurator,
      status: getSecCuratorAvatarStatus(data.secondaryCurationStatus),
      title: 'Secondary Curator',
    });

    return assignedUsers;
  }, [users, data]);

  const getDateChip = (): IDateChip | undefined => {
    if (data.curationStatus === 'Sequencing' && data.biosamples) {
      const sequencingDate = getPrimaryBiosample(data.biosamples)?.sequencingDate;

      if (sequencingDate) {
        return ({
          date: dayjs(sequencingDate).format('DD/MM/YYYY'),
        });
      }
    }

    if (pipelines && pipelines.length > 0) {
      return ({
        date: dayjs(pipelines[0].runDate).format('DD/MM/YYYY'),
        tooltip: pipelines.map((pipeline) => (
          <Box
            display="flex"
            flexDirection="column"
          >
            {`${pipeline.pipelineName}: ${pipeline.taskStatus}`}
          </Box>
        )),
      });
    }

    if (data.curationFinalisedAt && data.curationStatus === 'Done') {
      return ({
        date: dayjs(data.curationFinalisedAt).format('DD/MM/YYYY'),
      });
    }
    return undefined;
  };

  const updateAssignedCurator = async (
    user: IUser | null,
    key: Extract<keyof IUpdateAnalysisSetBody, 'primaryCuratorId' | 'secondaryCuratorId'>,
  ): Promise<void> => {
    try {
      await zeroDashSdk.curation.analysisSets.updateAnalysisSetById(
        data.analysisSetId,
        {
          [key]: user?.id ?? null,
        },
      );
      if (updateData) {
        updateData({ ...data, [key]: user?.id ?? null });
      }
    } catch {
      enqueueSnackbar('Could not update curator, please try again.');
    }
  };

  useEffect(() => {
    if (data.curationStatus === 'In Pipeline' && data.biosamples?.length) {
      zeroDashSdk.curation.biosamples.getPipelines(
        {
          biosamples: data.biosamples.map((b) => b.biosampleId),
        },
      )
        .then((resp) => {
          resp.sort((a, b) => dayjs(a.runDate).diff(dayjs(b.runDate)));
          setPipelines(resp);
        });
    } else {
      setPipelines(undefined);
    }
  }, [data.biosamples, data.curationStatus, zeroDashSdk.curation.biosamples]);

  return (
    <TaskStageCell
      stageName="Curation"
      data={data}
      type={type}
      avatars={assignedCurators.filter((a) => a.user)}
      status={data.pseudoStatus || data.curationStatus}
      dateChip={getDateChip()}
      modalUsersSectionContent={(
        <>
          {assignedCurators.map((curator) => (
            <UsersSectionListItem
              group="Curators"
              assignedUser={curator}
              onUpdate={(user): Promise<void> => updateAssignedCurator(
                user,
                curator.title?.startsWith('Primary') ? 'primaryCuratorId' : 'secondaryCuratorId',
              )}
              disabled={!canUpdateCurator}
            />
          ))}
        </>
      )}
      columnWidths={{
        minWidth: '180px',
        width: '10vw',
      }}
      startAt={data.curationStartedAt}
      finalisedAt={data.curationStatus === 'Done' ? data.curationFinalisedAt : null}
      averageDays={{
        belowAvgDays: 3,
        aboveAvgDays: 4,
      }}
    />
  );
}
