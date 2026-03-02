import CustomChip from '@/components/Common/Chip';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import {
  Box, IconButton, Popover,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useCallback, useState, type JSX } from 'react';
import { useClinical } from '../../../../contexts/ClinicalContext';
import { useUser } from '../../../../contexts/UserContext';
import { ClinicalAssigneeMenuOptions } from '../../../../types/MTB/MTB.types';
import CustomTypography from '../../../Common/Typography';
import { AvatarWithBadge } from '../../../CustomIcons/AvatarWithBadge';
import { AssigneeButton } from './AssigneeButton';

const useStyles = makeStyles(() => ({
  chip: {
    borderRadius: '4px',
    padding: '4px 8px',
    height: 'unset',
    backgroundColor: '#ECF0F3',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiChip-label': {
      padding: 0,
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& span': {
      fontSize: '13px',
    },
  },
  avatarButton: {
    padding: '0px',
    height: 'fit-content',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
}));

export function MoreAssigneesModal(): JSX.Element {
  const classes = useStyles();
  const { users } = useUser();
  const {
    clinicalVersion,
    clinicalStatus,
    updateMTBChair,
    updateAssignee,
    assignClinicalReviewer,
    updateReviewStatus,
    isReadOnly,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const canUpdateUser = useIsUserAuthorised('clinical.sample.write');
  const canRequestReview = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician);

  const getAssignees = useCallback(() => {
    const isFinalised = clinicalStatus.status === 'Done';
    const assignees: ClinicalAssigneeMenuOptions[] = [
      {
        id: clinicalVersion.mtbChair?.id || null,
        type: 'chair',
        disabled: !canUpdateUser || isFinalised,
        group: 'MTBChairs',
        groupLabel: 'MTB Chair',
        reviewStatus: clinicalVersion.reviewers.find(
          (review) => review.group === 'MTBChairs',
        )?.status,
        onSelect: updateMTBChair,
      },
      {
        id: clinicalVersion.clinician?.id || null,
        type: 'assignee',
        disabled: !canUpdateUser || isFinalised,
        group: 'Clinicians',
        groupLabel: 'Clinician',
        onSelect: (user) => updateAssignee('clinicianId', user),
      },
      {
        id: clinicalVersion.reviewers.find(
          (review) => review.group === 'Clinicians',
        )?.user?.id || null,
        type: 'reviewer',
        disabled: !canUpdateUser || isFinalised,
        group: 'Clinicians',
        groupLabel: 'Reviewing Clinician',
        reviewStatus: clinicalVersion.reviewers.find(
          (review) => review.group === 'Clinicians',
        )?.status,
        onSelect: (user) => assignClinicalReviewer(
          user,
          'Clinicians',
        ),
      },
      {
        id: clinicalVersion.curator?.id || null,
        type: 'assignee',
        disabled: !canUpdateUser || isFinalised,
        group: 'Curators',
        groupLabel: 'Curator',
        onSelect: (user) => updateAssignee('curatorId', user),
      },
      {
        id: clinicalVersion.reviewers.find(
          (review) => review.group === 'Curators',
        )?.user?.id || null,
        type: 'reviewer',
        disabled: !canUpdateUser || isFinalised,
        group: 'Curators',
        groupLabel: 'Reviewing Curator',
        reviewStatus: clinicalVersion.reviewers.find(
          (review) => review.group === 'Curators',
        )?.status,
        onSelect: (user) => assignClinicalReviewer(
          user,
          'Curators',
        ),
      },
      {
        id: clinicalVersion.cancerGeneticist?.id || null,
        type: 'assignee',
        disabled: !canUpdateUser || isFinalised,
        group: 'CancerGeneticists',
        groupLabel: 'Genetic Clinician',
        onSelect: (user) => updateAssignee('cancerGeneticistId', user),
      },
      {
        id: clinicalVersion.reviewers.find(
          (review) => review.group === 'CancerGeneticists',
        )?.user?.id || null,
        type: 'reviewer',
        disabled: !canUpdateUser || isFinalised,
        group: 'CancerGeneticists',
        groupLabel: 'Reviewing Genetic Clinician',
        reviewStatus: clinicalVersion.reviewers.find(
          (review) => review.group === 'CancerGeneticists',
        )?.status,
        onSelect: (user) => assignClinicalReviewer(
          user,
          'CancerGeneticists',
        ),
      },
    ];
    return assignees;
  }, [
    clinicalVersion.cancerGeneticist?.id,
    clinicalVersion.clinician?.id,
    clinicalVersion.curator?.id,
    clinicalVersion.mtbChair?.id,
    clinicalVersion.reviewers,
    updateMTBChair,
    updateAssignee,
    assignClinicalReviewer,
    canUpdateUser,
    clinicalStatus.status,
  ]);

  const getAssigneeRow = useCallback((options: ClinicalAssigneeMenuOptions) => {
    const assignee = users.find((u) => u.id === options.id);
    return (
      <Box key={`${options.groupLabel}-${options.id}`} className={classes.item}>
        <Box display="flex" gap="8px" alignItems="center" maxWidth="370px">
          <AssigneeButton
            options={options}
            updateReviewStatus={(group, status): void => {
              updateReviewStatus(group, status);
            }}
            canRequestReview={!isReadOnly && canRequestReview && clinicalStatus.canAskToReview}
          />
          {assignee && (
            <CustomTypography truncate>
              {`${assignee.givenName} ${assignee.familyName}`}
            </CustomTypography>
          )}
        </Box>
        <Box width="180px" display="flex">
          <CustomChip
            label={options.groupLabel || '-'}
            className={classes.chip}
            backgroundColour={corePalette.grey30}
          />
        </Box>
      </Box>
    );
  }, [
    canRequestReview,
    classes.chip,
    classes.item,
    clinicalStatus.canAskToReview,
    isReadOnly,
    updateReviewStatus,
    users,
  ]);

  const getAdditionalAssigneeCount = useCallback(
    () => Math.max(getAssignees().slice(3).filter((a) => a.id !== null).length, 0),
    [getAssignees],
  );

  return (
    <>
      <IconButton
        style={{ padding: '0px', color: '#FFFFFF' }}
        onClick={(e): void => setAnchorEl(e.currentTarget)}
      >
        <AvatarWithBadge
          badgeText=""
          avatarContent={getAdditionalAssigneeCount() > 0 ? (
            <CustomTypography variant="bodySmall" fontWeight="medium" style={{ color: '#FFFFFF' }}>
              {`+${getAdditionalAssigneeCount()}`}
            </CustomTypography>
          ) : (
            undefined
          )}
          iconColour="#FFFFFF"
          defaultBackgroundColour="#022034"
          borderStyle="dashed"
        />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        onClose={(): void => setAnchorEl(null)}
        anchorEl={anchorEl}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        PaperProps={{ style: { marginTop: '16px' } }}
      >
        <Box
          display="flex"
          flexDirection="column"
          gap="16px"
          padding="16px"
        >
          {getAssignees().map((a) => (
            getAssigneeRow(a)
          ))}
        </Box>
      </Popover>
    </>
  );
}
