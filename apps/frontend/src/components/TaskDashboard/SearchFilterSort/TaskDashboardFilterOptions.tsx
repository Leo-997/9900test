import AssigneeAndStatusMenu from '@/components/SearchFilterBar/AssigneeAndStatusMenu';
import DiagnosisFilterOptions from '@/components/SearchFilterBar/DiagnosisFilterOptions';
import ListMenu from '@/components/SearchFilterBar/ListMenu';
import { eventTypes } from '@/constants/options';
import { cohorts } from '@/constants/sample';
import { taskDashboardStageOptions } from '@/constants/TaskDashboard/stages';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { FilterOption } from '@/types/Search.types';
import { ITaskDashboardFilters, TaskDashboardStage, TaskDashboardStatuses } from '@/types/TaskDashboard/TaskDashboard.types';
import { Divider as MuiDivider, styled } from '@mui/material';
import {
  Dispatch, SetStateAction, useCallback, useState,
} from 'react';

const Divider = styled(MuiDivider)({
  margin: '0px !important',
});

export interface ITaskDashboardFilterOptionsProps {
  toggled: ITaskDashboardFilters;
  setToggled: Dispatch<SetStateAction<ITaskDashboardFilters>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function TaskDashboardFilterOptions({
  toggled,
  setToggled,
  loading,
  setLoading,
}: ITaskDashboardFilterOptionsProps): FilterOption[] {
  const zeroDashSdk = useZeroDashSdk();

  const [anchorElCaseFilter, setAnchorElCaseFilter] = useState<null | HTMLElement>(null);
  const [anchorElStudy, setAnchorElStudy] = useState<null | HTMLElement>(null);
  const [anchorElEvent, setAnchorElEvent] = useState<null | HTMLElement>(null);
  const [anchorElCohort, setAnchorElCohort] = useState<null | HTMLElement>(null);

  const areEnrolledOrWithdrawnActive = toggled.enrolledOnlyCases || toggled.withdrawnCases;

  const fetchStudies = useCallback(async () => {
    const studies = await zeroDashSdk.curation.analysisSets.getAllStudies();
    return studies;
  }, [zeroDashSdk.curation.analysisSets]);

  const getChipLabel = (list: string[], length = 4): string => (
    list.length > length ? (
      `${
        list
          ?.slice(0, length)
          .map((g) => g.toUpperCase().split('::')[0])
          .join('; ')
      } + ${
        list.length - length
      } more`
    ) : (
      list
        ?.map((g) => g.toUpperCase().split('::')[0])
        .join('; ')
    )
  );

  const getCaseFilterChipLabel = (
    assignees?: string[],
    stage?: TaskDashboardStage,
    statuses?: TaskDashboardStatuses[],
  ): string => {
    const chipLabel: string[] = [];

    if (assignees?.length) {
      if (assignees.length > 1) chipLabel.push(`USERS: ${assignees?.[0]?.split('::')[0]} + ${assignees.length - 1} more`);
      if (assignees.length === 1) chipLabel.push(`USER: ${assignees?.[0]?.split('::')[0]}`);
    }

    const stageName = taskDashboardStageOptions.find((o) => o.value === stage)?.name;
    if (stageName) chipLabel.push(`STAGE: ${stageName}`);

    if (statuses?.length) {
      if (statuses.length > 1) chipLabel.push(`STATUSES: ${statuses?.[0]} + ${statuses.length - 1} more`);
      if (statuses.length === 1) chipLabel.push(`STATUS: ${statuses?.[0]?.split('::')[0]}`);
    }

    return chipLabel.join('; ');
  };

  const filterOptions: FilterOption[] = [
    {
      label: 'Assignee & Status',
      value: 'assigneeAndStatus',
      type: 'menu',
      check: Boolean(
        (toggled.stage && toggled.statuses?.length)
        || toggled.assignees?.length,
      ),
      disabled: areEnrolledOrWithdrawnActive,
      defaultVal: [],
      submenu: (
        <AssigneeAndStatusMenu
          key={JSON.stringify(toggled)}
          anchorEl={anchorElCaseFilter}
          setAnchorEl={setAnchorElCaseFilter}
          toggled={toggled}
          onSubmit={
            (
              newAssignees,
              newStage,
              newStatuses,
            ): void => setToggled((prev): ITaskDashboardFilters => (
              {
                ...prev,
                stage: newStage,
                statuses: newStatuses,
                assignees: newAssignees,
              }
            ))
          }
        />
      ),
      setAnchor: (target) => setAnchorElCaseFilter(target),
      chipLabel: () => getCaseFilterChipLabel(
        toggled.assignees,
        toggled.stage,
        toggled.statuses,
      ),
    },
    {
      label: 'Expedited only',
      value: 'expedited',
      type: 'item',
      check: Boolean(toggled.expedited),
      disabled: areEnrolledOrWithdrawnActive,
    },
    {
      label: 'Registered-only patients',
      value: 'enrolledOnlyCases',
      type: 'item',
      check: Boolean(toggled.enrolledOnlyCases),
      disabled: toggled.withdrawnCases,
    },
    {
      label: 'Withdrawn patients',
      value: 'withdrawnCases',
      type: 'item',
      check: Boolean(toggled.withdrawnCases),
      disabled: toggled.enrolledOnlyCases,
      divider: <Divider />,
    },
    {
      label: 'Study',
      value: 'study',
      type: 'menu',
      check: Boolean(toggled.study?.length),
      disabled: areEnrolledOrWithdrawnActive,
      defaultVal: [],
      submenu: (
        <ListMenu
          anchorEl={anchorElStudy}
          setAnchorEl={setAnchorElStudy}
          value={toggled.study || []}
          onChange={(newValue): void => setToggled((prev): ITaskDashboardFilters => (
            prev ? { ...prev, study: newValue } : prev
          ))}
          menuOptionsFetch={fetchStudies}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElStudy(target),
      chipLabel: () => getChipLabel(toggled.study || []),
    },
    {
      label: 'Event',
      value: 'eventType',
      type: 'menu',
      check: Boolean(toggled.eventType?.length),
      disabled: areEnrolledOrWithdrawnActive,
      defaultVal: [],
      submenu: (
        <ListMenu
          anchorEl={anchorElEvent}
          setAnchorEl={setAnchorElEvent}
          value={toggled.eventType || []}
          onChange={(newValue): void => setToggled((prev): ITaskDashboardFilters => (
            prev ? { ...prev, eventType: newValue } : prev
          ))}
          menuOptions={eventTypes}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElEvent(target),
      chipLabel: () => getChipLabel(toggled.eventType || []),
    },
    {
      label: 'Cohort',
      value: 'cohort',
      type: 'menu',
      check: Boolean(toggled.cohort?.length),
      disabled: areEnrolledOrWithdrawnActive,
      defaultVal: [],
      submenu: (
        <ListMenu
          anchorEl={anchorElCohort}
          setAnchorEl={setAnchorElCohort}
          value={toggled.cohort || []}
          onChange={(newValue): void => setToggled((prev): ITaskDashboardFilters => (
            prev ? { ...prev, cohort: newValue } : prev
          ))}
          menuOptions={[...cohorts]}
          loading={loading}
          setLoading={setLoading}
        />
      ),
      setAnchor: (target) => setAnchorElCohort(target),
      chipLabel: () => getChipLabel(toggled.cohort || [], 1),
    },
    ...DiagnosisFilterOptions({
      filters: toggled,
      setFilters: setToggled,
      loading,
      endDivider: false,
      disabled: areEnrolledOrWithdrawnActive,
    }),
  ];

  return filterOptions;
}
