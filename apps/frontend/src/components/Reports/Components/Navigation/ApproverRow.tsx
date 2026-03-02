import CustomChip from '@/components/Common/Chip';
import { reportOptions } from '@/constants/Reports/reports';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import { Group } from '@/types/Auth/Group.types';
import {
  alpha,
  Box,
  IconButton,
  Menu,
  MenuItem,
  styled,
} from '@mui/material';
import dayjs from 'dayjs';
import { EllipsisVerticalIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo, useState, type JSX } from 'react';
import { useReport } from '../../../../contexts/Reports/CurrentReportContext';
import { useUser } from '../../../../contexts/UserContext';
import { useZeroDashSdk } from '../../../../contexts/ZeroDashSdkContext';
import { IUser } from '../../../../types/Auth/User.types';
import { ApprovalStatus, IApproval } from '../../../../types/Reports/Approvals.types';
import { mapGroupName } from '../../../../utils/functions/mapGroupName';
import CustomTypography from '../../../Common/Typography';
import { AvatarWithBadge } from '../../../CustomIcons/AvatarWithBadge';
import UsersMenu from '../../../UsersMenu/UsersMenu';
import { ChangeApproverModal } from './ChangeApproverModal';

interface IStyledProps {
  approvalStatus: ApprovalStatus;
  showOnReport?: boolean;
}

const ApprovalDot = styled(Box)<IStyledProps>(({ theme, approvalStatus }) => {
  let backgroundColor = theme.colours.core.yellow150;
  if (approvalStatus === 'approved') backgroundColor = theme.colours.core.green150;
  if (approvalStatus === 'cancelled') backgroundColor = theme.colours.core.grey50;
  return {
    width: '8px',
    height: '8px',
    backgroundColor,
    borderRadius: '50%',
    flex: 'none',
    order: 0,
    flexGrow: 0,
  };
});

const ApprovalRow = styled(Box)<IStyledProps>(({ theme, approvalStatus, showOnReport }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  padding: '8px 12px',
  gridGap: '16px',
  alignItems: 'center',
  backgroundColor: approvalStatus === 'approved' || approvalStatus === 'cancelled' || !showOnReport
    ? theme.colours.core.white
    : alpha(theme.colours.core.yellow10, 0.4),
}));

interface IApproverRowProps {
  approval: IApproval;
}

export function ApproverRow({
  approval,
}: IApproverRowProps): JSX.Element {
  const {
    patientId,
    analysisSetId,
    reportType,
    setApprovals,
    isReadOnly,
  } = useReport();
  const zeroDashSdk = useZeroDashSdk();
  const {
    currentUser,
    users,
    groups,
    getGroupById,
  } = useUser();
  const { enqueueSnackbar } = useSnackbar();

  const [usersMenuAnchor, setUsersMenuAnchor] = useState<HTMLElement | null>(null);
  const [userGroup, setUserGroup] = useState<Group>();
  const [newUser, setNewUser] = useState<IUser | null>();
  const [oldApprovals, setOldApprovals] = useState<IApproval[]>();
  const [actionMenuAnchor, setActionMenuAnchor] = useState<HTMLElement | null>(null);

  const canAssignApprover = useIsUserAuthorised('report.assign') && !isReadOnly;

  const assignee = useMemo(() => (
    users.find((u) => u.id === approval.assigneeId)
  ), [approval.assigneeId, users]);

  const group = useMemo(() => (
    groups.find((g) => g.name === approval.groupName)
  ), [approval.groupName, groups]);

  const handleAvatarClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    avatarGroup?: Group,
  ): void => {
    if (avatarGroup) {
      setUsersMenuAnchor(event.currentTarget);
      setUserGroup(avatarGroup);
    }
  };

  const getNewApprovals = (): IApproval[] | undefined => {
    if (oldApprovals) {
      const index = oldApprovals.findIndex((a) => a.groupName === approval.groupName);
      if (index > -1) {
        const newApprovals = [...oldApprovals];
        newApprovals[index] = {
          ...newApprovals[index],
          assigneeId: newUser?.id || null,
        };
        return newApprovals;
      }
    }
    return oldApprovals;
  };

  const handleSetApprover = useCallback(async (user: IUser | null) => {
    await zeroDashSdk.services.reports.updateApproval(
      approval.id,
      {
        assigneeId: user?.id || null,
      },
    );

    setApprovals((prev) => prev.map((a) => ({
      ...a,
      assigneeId: a.id === approval.id
        ? user?.id || null
        : a.assigneeId,
    })));

    setUsersMenuAnchor(null);
  }, [approval.id, setApprovals, zeroDashSdk.services.reports]);

  const handleApproverChange = async (user: IUser | null): Promise<void> => {
    setUsersMenuAnchor(null);
    const prevReports = await zeroDashSdk.services.reports.getReports({
      analysisSetIds: [analysisSetId],
      types: [reportType],
      statuses: ['approved'],
    });
    if (approval.assigneeId && prevReports[0]) {
      const prevApprovals = await zeroDashSdk.services.reports.getApprovals({
        reportId: prevReports[0].id,
      })
        .then((resp) => resp.map((a) => ({
          ...a,
          groupName: getGroupById(a.groupId),
        })));

      if (prevApprovals.every((a) => a.status === 'approved')) {
        const sameApproval = prevApprovals.find(
          (a) => a.groupName === approval.groupName && a.label === approval.label,
        );
        if (
          approval.assigneeId === sameApproval?.approvedBy
          && user?.id !== sameApproval?.approvedBy
        ) {
          // approver is changing open modal
          setNewUser(user);
          setOldApprovals(prevApprovals);
          return;
        }
      }
    }

    await handleSetApprover(user);
  };

  const getUserTitle = (): string => {
    if (typeof approval.label === 'string') return approval.label;

    if (assignee?.title) return assignee.title;

    if (group) return mapGroupName(group.name).replace(/s$/, '');

    return '';
  };

  const handleSubmit = useCallback(() => {
    if (newUser || newUser === null) {
      handleSetApprover(newUser);
      setNewUser(undefined);
      setOldApprovals(undefined);
    }
  }, [handleSetApprover, newUser]);

  const handleCancelApproval = async (): Promise<void> => {
    if (approval.status === 'pending') {
      await zeroDashSdk.services.reports.updateApproval(
        approval.id,
        {
          status: 'cancelled',
          assigneeId: null,
        },
      );

      setApprovals((prev) => prev.map((a) => (
        a.id === approval.id
          ? { ...a, status: 'cancelled', assigneeId: null }
          : a
      )));
    } else {
      await zeroDashSdk.services.reports.updateApproval(
        approval.id,
        {
          status: 'pending',
        },
      );

      setApprovals((prev) => prev.map((a) => (
        a.id === approval.id
          ? { ...a, status: 'pending' }
          : a
      )));
    }
  };

  const handleNotifyUser = async (): Promise<void> => {
    if (approval.assigneeId) {
      try {
        const reportOption = reportOptions.find((r) => r.value === reportType);
        await zeroDashSdk.services.notifications.createNotifications({
          type: 'REPORT_ASSIGNED',
          title: `${patientId}: ${reportOption?.name} assigned`,
          description: `You have been assigned as an approver to the ${reportOption?.name} for ${patientId} by ${currentUser?.givenName} ${currentUser?.familyName}`,
          entityMetadata: {
            analysisSetId,
            patientId,
            reportId: approval.reportId,
          },
          notifyUserIds: [approval.assigneeId],
          modes: ['EMAIL'],
          emailTemplate: 'ZERO_DASH',
        });
        if (!approval.notifiedAt) {
          await zeroDashSdk.services.reports.updateApproval(
            approval.id,
            { notifiedAt: dayjs().subtract(1, 'hour').toISOString() },
          );
        }
        enqueueSnackbar('Notification sent', { variant: 'success' });
      } catch {
        enqueueSnackbar('Could not notify approver, please try again.', { variant: 'error' });
      }
    }
  };

  return (
    <ApprovalRow approvalStatus={approval.status} showOnReport={approval.showOnReport}>
      {approval.showOnReport && (
        <ApprovalDot approvalStatus={approval.status} />
      )}
      <Box
        display="flex"
        alignItems="center"
        gap="8px"
        width={`calc(100% - ${approval.status !== 'approved' && approval.showOnReport ? 84 : 0}px)`}
      >
        <IconButton
          style={{ padding: '0px', height: 'fit-content' }}
          onClick={(e): void => handleAvatarClick(
            e,
            approval.groupName || undefined,
          )}
          disabled={!canAssignApprover || approval.status === 'cancelled'}
        >
          <AvatarWithBadge
            badgeText=""
            user={assignee}
            sx={{ visibility: approval.status === 'cancelled' ? 'hidden' : undefined }}
          />
        </IconButton>
        <Box
          display="flex"
          flexDirection="column"
          gap="4px"
          justifyContent="center"
          width="calc(100% - 40px)"
        >
          {assignee && (
            <CustomTypography truncate sx={{ maxWidth: '155px' }}>
              {assignee.givenName}
              {' '}
              {assignee.familyName}
            </CustomTypography>
          )}
          {approval.status === 'cancelled' && (
            <CustomTypography truncate>
              Not required
            </CustomTypography>
          )}
          <CustomChip
            label={getUserTitle()}
            backgroundColour={corePalette.grey30}
            maxWidth="100%"
            sx={{
              width: 'fit-content',
            }}
          />
          {!approval.showOnReport && !approval.assigneeId && (
            <CustomTypography variant="bodyTiny">
              Assigned
              {' '}
              {group ? mapGroupName(group.name).replace(/s$/, '') : 'user'}
              {' '}
              can draft the report but won&apos;t appear as a signatory in the report.
            </CustomTypography>
          )}
        </Box>
      </Box>
      {approval.status !== 'approved' && approval.showOnReport && (
        <IconButton
          style={{
            padding: '6px',
            color: '#022034',
          }}
          onClick={(e): void => setActionMenuAnchor(e.currentTarget)}
        >
          <EllipsisVerticalIcon />
        </IconButton>
      )}
      <UsersMenu
        anchorEl={usersMenuAnchor}
        onClose={(): void => setUsersMenuAnchor(null)}
        group={userGroup}
        handleUserSelect={handleApproverChange}
        selectedUserId={approval.assigneeId || null}
      />
      <ChangeApproverModal
        open={newUser !== undefined && oldApprovals !== undefined}
        onClose={(): void => {
          setNewUser(undefined);
          setOldApprovals(undefined);
        }}
        handleSubmit={handleSubmit}
        oldApprovals={oldApprovals || []}
        newApprovals={getNewApprovals() || []}
      />
      <Menu
        id="long-menu"
        anchorEl={actionMenuAnchor}
        keepMounted
        open={Boolean(actionMenuAnchor)}
        onClose={(): void => setActionMenuAnchor(null)}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
      >
        <MenuItem
          key="dismiss-or-revert"
          onClick={(): void => {
            handleCancelApproval();
            setActionMenuAnchor(null);
          }}
          disabled={!canAssignApprover}
        >
          {approval.status === 'cancelled'
            ? 'Restore approval'
            : 'Dismiss approval'}
        </MenuItem>
        <MenuItem
          key="notify-user"
          onClick={(): void => {
            handleNotifyUser();
            setActionMenuAnchor(null);
          }}
          disabled={
            !canAssignApprover
            || !approval.assigneeId
            || approval.assigneeId === currentUser?.id
          }
        >
          Notify approver
        </MenuItem>
      </Menu>
    </ApprovalRow>
  );
}
