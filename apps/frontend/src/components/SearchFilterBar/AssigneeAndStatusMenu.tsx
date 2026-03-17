import { taskDashboardStageOptions } from '@/constants/TaskDashboard/stages';
import { taskDashboardStatusOptions } from '@/constants/TaskDashboard/status';
import { useUser } from '@/contexts/UserContext';
import { corePalette } from '@/themes/colours';
import { ISelectOption } from '@/types/misc.types';
import {
  CaseStatus, ITaskDashboardFilters, TaskDashboardStage, TaskDashboardStatuses,
} from '@/types/TaskDashboard/TaskDashboard.types';
import {
  Autocomplete,
  Box,
  Checkbox,
  Divider,
  Menu,
  styled,
  TextField,
} from '@mui/material';
import { Dispatch, ReactNode, SetStateAction, useMemo, useState, type JSX } from 'react';
import { Group } from '@/types/Auth/Group.types';
import CustomButton from '../Common/Button';
import LabelledInputWrapper from '../Common/LabelledInputWrapper';
import CustomTypography from '../Common/Typography';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';

const StyledMenu = styled(Menu)({
  '& .MuiPaper-root': {
    padding: '16px 0px',
  },
});

const StyledAutoWidthSelect = styled(AutoWidthSelect)({
  width: '200px',
});

const SelectedFilterDescription = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '0px 16px',
});

interface IEditableFields {
  stage?: TaskDashboardStage;
  statuses?: TaskDashboardStatuses[];
  assignees?: string[];
}

interface IProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
  toggled: ITaskDashboardFilters;
  onSubmit: (
    newAssignees?: string[],
    newStage?: TaskDashboardStage,
    newStatuses?: TaskDashboardStatuses[],
  ) => void;
}

const emptyEditableFields: IEditableFields = {
  stage: undefined,
  statuses: [],
  assignees: [],
};

export default function AssigneeAndStatusMenu({
  anchorEl,
  setAnchorEl,
  toggled,
  onSubmit,
}: IProps): JSX.Element {
  const { users } = useUser();

  const [editableFields, setEditableFields] = useState<IEditableFields>({
    stage: toggled.stage,
    statuses: toggled.statuses,
    assignees: toggled.assignees,
  });

  const userOptions = useMemo(() => {
    const relevantGroups: Group[] = [
      'Curators',
      'MolecularOncologists',
      'ClinicalFellows',
      'MTBChairs',
      'CancerGeneticists',
    ];

    return users
      .filter((u) => u.groups.some((g) => relevantGroups.includes(g.name)))
      .map((u) => ({
        name: `${u.givenName} ${u.familyName}`,
        value: `${u.givenName} ${u.familyName}::${u.id}`,
      }));
  }, [users]);

  const handleClear = (): void => {
    setEditableFields(emptyEditableFields);
  };

  const getStatusOptions = (stage: TaskDashboardStage): ISelectOption<CaseStatus>[] => (
    taskDashboardStatusOptions
      .filter((o) => o.allowedStages.includes(stage))
      .map((o) => ({ name: o.name, value: o.value }))
  );

  const onClose = (): void => setAnchorEl(null);

  const getSpanElement = (text: string): JSX.Element => (
    <CustomTypography
      component="span"
      color={corePalette.green150}
      fontWeight="bold"
    >
      {text}
    </CustomTypography>
  );

  const getEditableFieldsDescription = (): JSX.Element => {
    const { assignees, stage, statuses } = editableFields;

    let assigneeDesc: JSX.Element | null = null;
    if (assignees?.length) {
      const names = assignees.map((a) => a.split('::')[0]).join(', ');
      assigneeDesc = getSpanElement(names);
    }

    let stageDesc: JSX.Element | null = null;
    if (stage?.length && (assignees?.length || statuses?.length)) {
      const stageName = taskDashboardStageOptions.find((o) => o.value === stage)?.name;
      if (stageName) {
        stageDesc = (
          <>
            {assignees?.length ? ' in ' : ' '}
            {getSpanElement(stageName)}
          </>
        );
      }
    } else if (assignees?.length) {
      stageDesc = <> across all stages</>;
    }

    let statusDesc: JSX.Element | null = null;
    if (stage && statuses?.length) {
      statusDesc = (
        <>
          {' with status'}
          {statuses.length > 1 ? 'es' : ''}
          {' '}
          {getSpanElement(statuses.join(', '))}
        </>
      );
    } else if (assignees?.length) {
      statusDesc = <> for all statuses</>;
    }

    return (
      <SelectedFilterDescription>
        <CustomTypography variant="bodyRegular" style={{ maxWidth: '100%' }}>
          {assigneeDesc}
          {' '}
          {stageDesc}
          {' '}
          {statusDesc}
        </CustomTypography>
      </SelectedFilterDescription>
    );
  };

  return (
    <StyledMenu
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      onClose={onClose}
      disableRestoreFocus
    >
      <Box display="flex" flexDirection="column" gap="16px">
        <Box
          display="flex"
          gap="8px"
          padding="0px 16px"
        >
          {/* USER */}
          <LabelledInputWrapper label="User" sx={{ gap: '8px' }}>
            <Autocomplete
              multiple
              options={userOptions}
              disableCloseOnSelect
              value={userOptions.filter(
                (option) => editableFields.assignees?.includes(option.value),
              )}
              onChange={(e, newValue): void => {
                setEditableFields((prev) => ({
                  ...prev,
                  assignees: newValue.map((v) => v.value),
                }));
              }}
              getOptionLabel={(option): string => option.name}
              isOptionEqualToValue={(option, value): boolean => option.value === value.value}
              renderOption={(props, option, { selected }): ReactNode => (
                <li {...props}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <Checkbox checked={selected} />
                    <CustomTypography
                      variant="bodyRegular"
                      style={{ maxWidth: '100%' }}
                      truncate
                    >
                      {option.name}
                    </CustomTypography>
                  </Box>
                </li>
              )}
              renderInput={(params): ReactNode => (
                <TextField sx={{ width: '250px' }} {...params} variant="outlined" />
              )}
              renderTags={(value): ReactNode => {
                const names = value.map((v) => v.name).join(', ');
                return (
                  <CustomTypography
                    variant="bodyRegular"
                    style={{ maxWidth: '100%' }}
                    truncate
                    tooltipText={names}
                  >
                    {names}
                  </CustomTypography>
                );
              }}
            />
          </LabelledInputWrapper>
          {/* STAGE */}
          <LabelledInputWrapper label="Stage" sx={{ gap: '8px' }}>
            <StyledAutoWidthSelect
              options={taskDashboardStageOptions.filter((o) => o.value !== 'CASE_STATUS')}
              value={editableFields.stage ?? ''}
              onChange={(e): void => setEditableFields((prev) => ({
                ...prev,
                stage: e.target.value as TaskDashboardStage,
              }))}
            />
          </LabelledInputWrapper>
          {/* STATUS */}
          <LabelledInputWrapper label="Status" sx={{ gap: '8px' }}>
            <StyledAutoWidthSelect
              multiple
              options={editableFields.stage ? getStatusOptions(editableFields.stage) : []}
              value={editableFields.statuses}
              onChange={(e): void => setEditableFields((prev) => ({
                ...prev,
                statuses: e.target.value as TaskDashboardStatuses[],
              }))}
              renderValue={(selected): string => {
                const selectedStatuses = selected as TaskDashboardStatuses[];
                const selectedNames = taskDashboardStatusOptions
                  .filter((opt) => selectedStatuses.includes(opt.value))
                  .map((opt) => opt.name);

                return selectedNames.join(', ');
              }}
              disabled={!editableFields.stage}
            />
          </LabelledInputWrapper>
        </Box>
        {/* DIVIDER */}
        <Divider />
        {/* FILTER DESCRIPTION */}
        {getEditableFieldsDescription()}
        {/* ACTIONS */}
        <Box
          display="flex"
          justifyContent="flex-end"
          gap="8px"
          padding="0px 16px"
        >
          <CustomButton
            variant="subtle"
            label="Clear"
            size="small"
            onClick={handleClear}
          />
          <CustomButton
            variant="bold"
            label="Apply"
            size="small"
            onClick={(): void => {
              onSubmit(
                editableFields.assignees,
                editableFields.stage,
                editableFields.statuses,
              );
              onClose();
            }}
            disabled={!editableFields.assignees?.length && !editableFields.statuses?.length}
          />
        </Box>
      </Box>
    </StyledMenu>
  );
}
