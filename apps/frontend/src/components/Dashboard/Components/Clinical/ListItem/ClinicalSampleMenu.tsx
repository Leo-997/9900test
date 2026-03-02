import { Menu, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import {
  Dispatch, SetStateAction, useState, type JSX,
} from 'react';
import { clinicalStatuses } from '@/constants/MTB/navigation';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IClinicalDashboardSample } from '@/types/Dashboard.types';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import { IClinicalCommentWithBody } from '../../../../../types/Comments/ClinicalComments.types';
import { ClinicalStatus } from '../../../../../types/MTB/ClinicalStatus.types';
import StatusChip from '../../../../Chips/StatusChip';
import CommentModal from '../../Common/Modals/CommentModal';
import StatusModal from '../../Common/Modals/StatusModal';
import { IChipProps } from '@/types/Samples/Sample.types';

const useStyles = makeStyles(() => ({
  menu: {

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

    '&:hover': {
      background: '#F3F7FF',
    },
  },
}));

interface IMenuData extends IClinicalDashboardSample {
  gender: string;
}

interface IClinicalSampleMenuProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
  sampleData: IMenuData;
  updateSamples?: (newItem: IClinicalDashboardSample) => void;
}

export function ClinicalSampleMenu({
  anchorEl,
  setAnchorEl,
  sampleData,
  updateSamples,
}: IClinicalSampleMenuProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();

  const [isCommentOpen, setIsCommentOpen] = useState<boolean>(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState<boolean>(false);

  const isAsetReadOnly = useIsPatientReadOnly({ analysisSetId: sampleData.analysisSetId });
  const canViewSample = useIsUserAuthorised('clinical.sample.read');
  const canWrite = useIsUserAuthorised('clinical.sample.write');
  const canEditSample = canWrite && !isAsetReadOnly;

  const handleClinicalExpedite = async (): Promise<void> => {
    try {
      await zeroDashSdk.mtb.clinical.updateClinicalVersionData(
        sampleData.clinicalVersionId,
        {
          expedite: sampleData.expedite ? !sampleData.expedite : true,
        },
      );

      if (updateSamples) {
        updateSamples({
          ...sampleData,
          expedite: sampleData.expedite ? !sampleData.expedite : true,
        });
      }
      enqueueSnackbar(`Expedite status updated for ${sampleData.patientId}`, { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to update expedite status, please try again', { variant: 'error' });
    }
  };

  const handleGermlineOnly = async ():Promise<void> => {
    try {
      await zeroDashSdk.mtb.clinical.updateClinicalVersionData(
        sampleData.clinicalVersionId,
        {
          isGermlineOnly: !sampleData.isGermlineOnly,
        },
      );
      if (updateSamples) {
        updateSamples({
          ...sampleData,
          isGermlineOnly: !sampleData.isGermlineOnly,
        });
      }
      enqueueSnackbar(`Germline only status updated for ${sampleData.patientId}`, { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to update germline only status, please try again', { variant: 'error' });
    }
  };

  const addClinicalComment = async (comment: string): Promise<void> => {
    await zeroDashSdk.mtb.comment.createComment({
      comment,
      type: 'SAMPLE',
      thread: {
        clinicalVersionId: sampleData.clinicalVersionId,
        entityType: 'SAMPLE',
        threadType: 'SAMPLE',
      },
    });
  };

  const fetchClinicalComments = async (): Promise<IClinicalCommentWithBody[]> => (
    zeroDashSdk.mtb.comment.getCommentThreads({
      clinicalVersionId: sampleData.clinicalVersionId,
      entityType: ['SAMPLE'],
      threadType: ['SAMPLE'],
    })
      .then(async (resp) => {
        if (resp.length > 0) {
          const comments = await zeroDashSdk.mtb.comment.getCommentsInThread(
            resp[0].id,
          );
          return comments.map((c) => ({
            ...c,
            comment: c.versions[0].comment,
            thread: resp[0],
          }));
        }
        return [];
      })
  );

  const updateClinicalStatus = async (comment: string, newStatus: string): Promise<void> => {
    await zeroDashSdk.mtb.clinical.updateClinicalVersionData(
      sampleData.clinicalVersionId,
      {
        status: newStatus as ClinicalStatus,
      },
    );
    if (updateSamples) {
      updateSamples({
        ...sampleData,
        clinicalStatus: newStatus as ClinicalStatus,
        pseudoStatus: null,
      });
    }
  };

  const getClinicalStatuses = (): JSX.Element[] => {
    const items: JSX.Element[] = [];
    for (const status in clinicalStatuses) {
      if (Object.hasOwn(clinicalStatuses, status)) {
        items.push(
          <MenuItem value={status} className={classes.selectItem}>
            {clinicalStatuses[status].chips.map((chip: { chipProps: IChipProps }) => (
              <StatusChip
                key={chip.chipProps.status}
                {...chip.chipProps}
              />
            ))}
          </MenuItem>,
        );
      }
    }
    return items;
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
        disabled={!canViewSample}
      >
        Add/view sample comments
      </MenuItem>

      <MenuItem
        onClick={(): void => {
          handleClinicalExpedite();
          setAnchorEl(null);
        }}
        disabled={!canEditSample}
      >
        {sampleData.expedite ? 'Cancel expedite status' : 'Expedite'}
      </MenuItem>

      <MenuItem
        onClick={():void => {
          handleGermlineOnly();
          setAnchorEl(null);
        }}
        disabled={!canEditSample}
      >
        {sampleData.isGermlineOnly ? 'Remove germline only tag' : 'Tag as germline only'}
      </MenuItem>

      <MenuItem
        onClick={(): void => {
          setIsUpdateStatusOpen(true);
          setAnchorEl(null);
        }}
        disabled={!canEditSample}
      >
        Update status
      </MenuItem>

      {isCommentOpen && (
        <CommentModal
          data={sampleData}
          isOpen={isCommentOpen}
          setIsOpen={setIsCommentOpen}
          addComment={addClinicalComment}
          fetchComments={fetchClinicalComments}
          disabled={!canEditSample}
        />
      )}
      {isUpdateStatusOpen && (
        <StatusModal
          data={sampleData}
          type="Clinical"
          isOpen={isUpdateStatusOpen}
          setIsOpen={setIsUpdateStatusOpen}
          updateStatus={updateClinicalStatus}
          getStatuses={getClinicalStatuses}
        />
      )}
    </Menu>
  );
}
