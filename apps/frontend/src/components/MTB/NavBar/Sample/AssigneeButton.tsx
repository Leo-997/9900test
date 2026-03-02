import { Group } from '@/types/Auth/Group.types';
import {
  Divider, IconButton, MenuItem, Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useCallback, useMemo, useState, type JSX } from 'react';
import { AvatarStatus } from '@/types/Avatar.types';
import { useUser } from '../../../../contexts/UserContext';
import { ClinicalReviewStatus } from '../../../../types/MTB/ClinicalStatus.types';
import { ClinicalAssigneeMenuOptions } from '../../../../types/MTB/MTB.types';
import CustomTypography from '../../../Common/Typography';
import { AvatarWithBadge } from '../../../CustomIcons/AvatarWithBadge';
import UsersMenu from '../../../UsersMenu/UsersMenu';

const useStyles = makeStyles(() => ({
  avatarButton: {
    padding: '0px',
    height: 'fit-content',
  },
}));

interface IProps {
  options: ClinicalAssigneeMenuOptions;
  defaultBackgroundColour?: string;
  iconColour?: string;
  canRequestReview?: boolean;
  updateReviewStatus?: (group: Group, status: ClinicalReviewStatus) => void;
  disabled?: boolean;
}

export function AssigneeButton({
  options,
  defaultBackgroundColour = '#FFFFFF',
  iconColour,
  canRequestReview = false,
  updateReviewStatus = (): void => { /* empty */ },
}: IProps): JSX.Element {
  const classes = useStyles();
  const { users } = useUser();

  const [usersMenuAnchor, setUsersMenuAnchor] = useState<HTMLButtonElement | null>(null);
  const [usersMenuType, setUsersMenuType] = useState<ClinicalAssigneeMenuOptions>({
    id: null,
  });

  const assignee = useMemo(() => users.find((u) => u.id === options.id), [users, options]);

  const getReviewerBadgeContent = (
    reviewStatus: ClinicalReviewStatus,
  ): AvatarStatus | undefined => {
    switch (reviewStatus) {
      case 'Ready for Review':
        return 'ready';
      case 'In Progress':
        return 'progress';
      case 'Completed':
        return 'done';
      default:
        return undefined;
    }
  };

  const handleReviewRequest = useCallback((): void => {
    if ((usersMenuType.type === 'reviewer' || usersMenuType.type === 'chair') && usersMenuType.group) {
      updateReviewStatus(usersMenuType.group, 'Ready for Review');
      setUsersMenuType({
        id: null,
      });
    }
  }, [updateReviewStatus, usersMenuType.group, usersMenuType.type]);

  const getAdditionalUserMenuItems = useCallback((option: ClinicalAssigneeMenuOptions) => (
    (option.type === 'reviewer' || option.type === 'chair')
    && assignee
    && option.reviewStatus === 'Assigned'
    && canRequestReview
      ? (
        <>
          <MenuItem disabled>
            <CustomTypography variant="bodySmall">Request review</CustomTypography>
          </MenuItem>
          <MenuItem
            onClick={handleReviewRequest}
            disabled={!canRequestReview}
          >
            <CustomTypography truncate>
              {`Ask ${
                assignee?.givenName
              } ${
                assignee?.familyName
              } to review`}
            </CustomTypography>
          </MenuItem>
          <Divider style={{ margin: '5px 0' }} />
          <MenuItem disabled>
            <CustomTypography variant="bodySmall">
              {`Reassign ${option.groupLabel}`}
            </CustomTypography>
          </MenuItem>
        </>
      ) : (
        <MenuItem disabled>
          <CustomTypography variant="bodySmall">
            {`Assign ${option.groupLabel}`}
          </CustomTypography>
        </MenuItem>
      )
  ), [canRequestReview, handleReviewRequest, assignee]);

  return (
    <Tooltip
      title={options.groupLabel || ''}
      placement="top"
      sx={{
        marginTop: '24px',
      }}
      slotProps={{
        popper: {
          sx: {
            marginTop: '12px !important',
          },
        },
      }}
      disableHoverListener={Boolean(usersMenuAnchor)}
    >
      <span>
        <IconButton
          className={classes.avatarButton}
          onClick={(e): void => {
            setUsersMenuAnchor(e.currentTarget);
            setUsersMenuType({
              ...options,
              onSelect: (user) => {
                if (options.onSelect) {
                  options.onSelect(user);
                }
                setUsersMenuAnchor(null);
                setUsersMenuType({ id: null });
              },
            });
          }}
          disabled={options.disabled}
        >
          <AvatarWithBadge
            badgeText=""
            user={assignee}
            defaultBackgroundColour={defaultBackgroundColour}
            status={getReviewerBadgeContent(options.reviewStatus || 'Assigned')}
            iconColour={iconColour}
            borderStyle={assignee ? 'solid' : 'dashed'}
          />
        </IconButton>
        {usersMenuType.onSelect && (
          <UsersMenu
            anchorEl={usersMenuAnchor}
            onClose={(): void => {
              setUsersMenuType({
                id: null,
              });
              setUsersMenuAnchor(null);
            }}
            group={usersMenuType.group}
            handleUserSelect={usersMenuType.onSelect}
            selectedUserId={usersMenuType.id}
            includeNone
            additionalItems={getAdditionalUserMenuItems(usersMenuType)}
          />
        )}
      </span>
    </Tooltip>
  );
}
