import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { ICurationCommentWithBody } from '@/types/Comments/CurationComments.types';
import { Menu, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import copy from 'copy-to-clipboard';
import dayjs, { Dayjs } from 'dayjs';
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useCallback, useState, type JSX } from 'react';
import { curationStatuses } from '../../../../../constants/Curation/navigation';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { CurationStatus, FailedStatusReason } from '../../../../../types/Samples/Sample.types';
import StatusChip from '../../../../Chips/StatusChip';
import AssignMeetingDate from '../../CommentModal/AssignMeetingDate';
import CommentModal from '../../Common/Modals/CommentModal';
import StatusModal from '../../Common/Modals/StatusModal';

const useStyles = makeStyles(() => ({
  menu: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& > ul > li': {
      height: '48px',
    },
  },
  selectItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '8px',
    height: '44px',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      background: '#F3F7FF',
    },
  },
}));

interface ICurationSampleMenuProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
  data: IAnalysisSet;
  updateAnalysisSet?: (data: IAnalysisSet) => void;
}

export function CurationSampleMenu({
  anchorEl,
  setAnchorEl,
  data,
  updateAnalysisSet,
}: ICurationSampleMenuProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();

  const { analysisSetId, patientId, expedite } = data;

  const [isCommentOpen, setIsCommentOpen] = useState<boolean>(false);
  const [isAssignDateOpen, setAssignDateOpen] = useState<boolean>(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState<boolean>(false);

  const canEdit = useIsUserAuthorised('curation.sample.write');

  const handleCurationExpedite = async (): Promise<void> => {
    try {
      await zeroDashSdk.curation.analysisSets.updateAnalysisSetById(
        analysisSetId,
        { expedite: data.expedite ? !data.expedite : true },
      );
      if (updateAnalysisSet) {
        updateAnalysisSet({
          ...data,
          expedite: data.expedite ? !data.expedite : true,
        });
      }
    } catch {
      enqueueSnackbar('Could not update analysis set, please try again.', { variant: 'error' });
    }
  };

  const addCurationComment = async (comment: string): Promise<void> => {
    try {
      await zeroDashSdk.curationComments.createComment(
        {
          comment,
          type: 'ANALYSIS',
          threadType: 'ANALYSIS',
          entityId: analysisSetId,
          entityType: 'ANALYSIS',
          analysisSetId,
        },
      );
    } catch {
      enqueueSnackbar('Could not create a new comment, please try again.', { variant: 'error' });
    }
  };

  const fetchCurationComments = async (): Promise<ICurationCommentWithBody[]> => {
    const resp = await zeroDashSdk.curationComments.getCommentThreads({
      entityType: ['ANALYSIS'],
      entityId: analysisSetId,
      analysisSetIds: [analysisSetId],
      threadType: ['ANALYSIS'],
    })

    if (!resp.length) return [];

    const comments = await zeroDashSdk.curationComments.getCommentsInThread(resp[0].id);
    return comments.map((c) => ({
      ...c,
      comment: c.versions[0]?.comment || '',
      thread: resp[0] }));

  };

  const updateCurationStatus = async (
    comment: string,
    newStatus: CurationStatus,
    failedStatusReason?: FailedStatusReason,
  ): Promise<void> => {
    try {
      await addCurationComment(comment);

      await zeroDashSdk.curation.analysisSets.updateAnalysisSetById(
        analysisSetId,
        {
          curationStatus: newStatus,
          failedStatusReason,
        },
      );

      if (updateAnalysisSet) {
        updateAnalysisSet({
          ...data,
          curationStatus: newStatus as CurationStatus,
          failedStatusReason: failedStatusReason || data.failedStatusReason,
        });
      }
    } catch {
      enqueueSnackbar('Could not update status, please try again', { variant: 'error' });
    }
  };

  const getCurationStatuses = (): JSX.Element[] => {
    const items: JSX.Element[] = [];
    for (const status in curationStatuses) {
      if (Object.hasOwn(curationStatuses, status)) {
        items.push(
          <MenuItem key={status} value={status} className={classes.selectItem}>
            <StatusChip
              {...curationStatuses[status].chipProps}
            />
          </MenuItem>,
        );
      }
    }
    return items;
  };

  const getMeetingsInAMonth = useCallback(async (date: string): Promise<string[]> => {
    const meetings = await zeroDashSdk.meetings.getCurationMeetings({
      date,
      window: 'month',
      includeAnalysisSets: true,
    });

    return meetings
      .flatMap((meeting) => (meeting.analysisSets || [])
        .filter((a) => a.meetingDate)
        .map((a) => a.meetingDate as string));
  }, [zeroDashSdk.meetings]);

  const handleAssignMeetingDate = async (newDate: Dayjs | null): Promise<void> => {
    const date = newDate ? dayjs(newDate).format('YYYY-MM-DD') : null;
    try {
      await zeroDashSdk.meetings.assignCurationMeeting({
        analysisSets: [analysisSetId],
        date,
      });
      if (updateAnalysisSet) {
        updateAnalysisSet({
          ...data,
          meetingDate: date,
        });
      }
      setAssignDateOpen(false);
      enqueueSnackbar('Meeting assigned successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Unable to update the date', { variant: 'error' });
    }
  };

  return (
    <Menu
      id="sample-options"
      className={classes.menu}
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={(): void => setAnchorEl(null)}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      variant="menu"
      disableRestoreFocus
      keepMounted
    >
      <MenuItem
        onClick={(): void => {
          setIsCommentOpen(true);
          setAnchorEl(null);
        }}
      >
        Add/view sample comments
      </MenuItem>

      {canEdit && (
        <MenuItem
          onClick={(): void => {
            handleCurationExpedite();
            setAnchorEl(null);
          }}
        >
          {expedite ? 'Cancel expedite status' : 'Expedite'}
        </MenuItem>
      )}
      <MenuItem
        onClick={(): void => {
          copy(`${window.location.origin}/curation/${patientId}/${analysisSetId}`);
          setAnchorEl(null);
        }}
      >
        Copy link to case
      </MenuItem>
      {canEdit && (
        <MenuItem
          onClick={(): void => {
            setIsUpdateStatusOpen(true);
            setAnchorEl(null);
          }}
        >
          Update status
        </MenuItem>
      )}
      {canEdit && (
        <MenuItem
          onClick={(): void => {
            setAssignDateOpen(true);
            setAnchorEl(null);
          }}
        >
          {data.meetingDate
            ? 'Change curation date'
            : 'Assign curation date'}
        </MenuItem>
      )}
      {isCommentOpen && (
        <CommentModal
          key="comment-modal"
          data={{
            patientId: data.patientId,
            vitalStatus: data.vitalStatus,
            gender: data.gender,
          }}
          isOpen={isCommentOpen}
          setIsOpen={setIsCommentOpen}
          addComment={addCurationComment}
          fetchComments={fetchCurationComments}
          disabled={!canEdit}
        />
      )}
      {isUpdateStatusOpen && (
        <StatusModal
          key="status-modal"
          data={{
            patientId: data.patientId,
            vitalStatus: data.vitalStatus,
            gender: data.gender,
          }}
          type="Curation"
          isOpen={isUpdateStatusOpen}
          setIsOpen={setIsUpdateStatusOpen}
          updateStatus={updateCurationStatus}
          getStatuses={getCurationStatuses}
        />
      )}
      {isAssignDateOpen && (
        <AssignMeetingDate
          key="date-modal"
          date={data.meetingDate}
          open={isAssignDateOpen}
          setOpen={setAssignDateOpen}
          fetchMeetingsInMonth={getMeetingsInAMonth}
          updateSamples={handleAssignMeetingDate}
        />
      )}
    </Menu>
  );
}
