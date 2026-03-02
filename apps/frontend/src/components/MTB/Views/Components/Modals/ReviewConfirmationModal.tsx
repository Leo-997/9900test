import CustomModal from '@/components/Common/CustomModal';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dispatch, SetStateAction, type JSX } from 'react';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { IReviewWithUser } from '../../../../../types/MTB/MTB.types';
import CustomTypography from '../../../../Common/Typography';

const useStyles = makeStyles(() => ({
  dialogRoot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '0px',
    position: 'absolute',
    minWidth: '768px',
    width: '768px',
    minHeight: '280px',
    background: '#FFFFFF',
    boxShadow: '0px 16px 32px rgba(18, 47, 92, 0.16)',
    borderRadius: '8px',
    overflowY: 'visible',
  },
  dialogHeader: {
    padding: '24px',
    gap: '8px',
    width: '768px',
    height: '76px',
    background: '#F3F5F7',
    borderRadius: '8px 8px 0px 0px',
  },
  header: {
    minWidth: '768px',
    color: '#022034',
  },
  dialogContent: {
    padding: '24px',
    minHeight: '124px',
  },
  closeButton: {
    position: 'absolute',
    width: '32px',
    height: '32px',
    right: '-16px',
    top: '-16px',
    zIndex: 4,
  },
  action: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '16px 24px',
    gap: '208px',
    minWidth: '768px',
    width: '768px',
    background: '#FFFFFF',
    borderRadius: '0px 0px 8px 8px',
  },
  btnBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '0px',
    gap: '16px',
    width: '500px',
    height: '48px',
  },
}));

interface IReviewConfirmationModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  activeReview: IReviewWithUser | null;
}

export default function ReviewConfirmationModal({
  isOpen,
  setIsOpen,
  activeReview,
}: IReviewConfirmationModalProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { updateReviewStatus, clinicalVersion } = useClinical();

  const updateReviewerStatus = (): void => {
    if (clinicalVersion.id && activeReview?.group) {
      zeroDashSdk.mtb.clinical.updateReviewStatus(
        clinicalVersion.id,
        activeReview?.group,
        'Completed',
      );
      if (updateReviewStatus) {
        updateReviewStatus(activeReview?.group, 'Completed');
      }
      setIsOpen(false);
    }
  };

  return (
    <CustomModal
      open={isOpen}
      onClose={(): void => setIsOpen(false)}
      title="Complete review"
      buttonText={{
        cancel: 'Keep adding comments',
        confirm: 'Complete Review',
      }}
      onConfirm={updateReviewerStatus}
      content={(
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          className={classes.dialogContent}
        >
          <Box>
            <CustomTypography>
              {`Are you sure you want to complete the review for ${clinicalVersion.patientId}?`}
            </CustomTypography>
          </Box>
        </Box>
      )}
    />
  );
}
