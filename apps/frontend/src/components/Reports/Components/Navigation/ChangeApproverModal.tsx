import CustomModal from '@/components/Common/CustomModal';
import {
  Box, Chip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useUser } from '../../../../contexts/UserContext';
import { IApproval } from '../../../../types/Reports/Approvals.types';
import { mapGroupName } from '../../../../utils/functions/mapGroupName';
import CustomTypography from '../../../Common/Typography';

import type { JSX } from "react";

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: 8,
    overflowY: 'unset',
    margin: 0,
    width: 800,
  },
  closeButton: {
    position: 'absolute',
    right: '-15px',
    top: '-15px',
    width: '40px',
    height: '40px',
    padding: '0px',
    minWidth: '40px',
  },
  dialogTitle: {
    backgroundColor: '#F3F5F7',
    padding: '24px',
    borderRadius: '8px 8px 0px 0px',
  },
  dialogContent: {
    padding: '24px',
  },
  approvalRow: {
    display: 'flex',
    flexDirection: 'row',
    padding: '8px',
    paddingLeft: '0',
    gridGap: '16px',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#FFFFFF',
  },
  approvalChip: {
    borderRadius: '4px',
    padding: '2px 4px',
    height: 'unset',
    maxWidth: '180px',
    backgroundColor: '#ECF0F3',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiChip-label': {
      padding: 0,
    },
  },
}));

interface IProps {
  open: boolean;
  onClose: () => void;
  handleSubmit: () => void;
  oldApprovals: IApproval[];
  newApprovals: IApproval[];
}

export function ChangeApproverModal({
  open,
  onClose,
  handleSubmit,
  oldApprovals,
  newApprovals,
}: IProps): JSX.Element {
  const classes = useStyles();
  const {
    users,
    groups,
  } = useUser();

  const getUserTitle = (approval: IApproval): string => {
    const assignee = users.find((u) => u.id === approval.assigneeId);
    const group = groups.find((g) => g.name === approval.groupName);

    if (assignee?.title) return assignee.title;

    if (group) return mapGroupName(group.name).replace(/s$/, '');

    return '';
  };

  const getApproverRow = (approval: IApproval): JSX.Element => {
    const assignee = users.find((u) => u.id === approval.assigneeId);
    return (
      <Box className={classes.approvalRow}>
        <CustomTypography variant="bodyRegular" truncate>
          {assignee?.givenName}
          {' '}
          {assignee?.familyName}
        </CustomTypography>
        <Chip
          label={(
            <CustomTypography variant="label" truncate>
              {getUserTitle(approval)}
            </CustomTypography>
          )}
          className={classes.approvalChip}
        />
      </Box>
    );
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Changing an approver"
      buttonText={{
        cancel: 'Close',
        confirm: 'Proceed',
      }}
      onConfirm={handleSubmit}
      content={(
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          className={classes.dialogContent}
        >
          <CustomTypography variant="bodyRegular">
            You are about to change one of the approvers compared
            to the previous version of the report.
          </CustomTypography>
          <Box display="flex" flexDirection="row" padding="16px" gap="32px">
            <Box display="flex" flexDirection="column">
              <CustomTypography variant="label">
                Old Approvers
              </CustomTypography>
              {oldApprovals.map((a) => getApproverRow(a))}
            </Box>
            <Box display="flex" flexDirection="column">
              <CustomTypography variant="label">
                New Approvers
              </CustomTypography>
              {newApprovals.map((a) => getApproverRow(a))}
            </Box>
          </Box>
          <CustomTypography variant="bodyRegular">
            Are you sure you want to proceed?
          </CustomTypography>
        </Box>
      )}
    />
  );
}
