import CustomModal from '@/components/Common/CustomModal';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useMemo, type JSX } from 'react';
import { useClinical } from '../../../../../contexts/ClinicalContext';
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
  textMargin: {
    paddingTop: 24,
  },
  warning: {
    height: 'fit-content',
    padding: '12px',
    border: '1px solid #F8CA19',
    borderRadius: '8px',
    backgroundColor: '#FFFAE8',
  },
}));

interface IFinaliseConfirmationModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function FinaliseConfirmationModal({
  isOpen,
  setIsOpen,
}: IFinaliseConfirmationModalProps): JSX.Element {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const {
    clinicalVersion,
    updateClinicalVersionStatus,
  } = useClinical();

  const isReviewed = useMemo(() => (
    clinicalVersion.reviewers.filter((r) => r.status === 'Completed').length > 0
  ), [clinicalVersion.reviewers]);

  const updateVersionStatus = async (): Promise<void> => {
    try {
      updateClinicalVersionStatus('Done');
    } catch (error) {
      enqueueSnackbar('Could not finalise case, please try again', { variant: 'error' });
    }
    setIsOpen(false);
  };

  return (
    <CustomModal
      open={isOpen}
      onClose={(): void => setIsOpen(false)}
      title="Finalise slides"
      buttonText={{
        cancel: 'Keep editing',
        confirm: !isReviewed ? 'Finalise without review' : 'Finalise',
      }}
      onConfirm={updateVersionStatus}
      content={(
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
        >
          {!isReviewed && (
            <Box className={classes.warning}>
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="flex-start"
              >
                <Box>
                  <CustomTypography
                    variant="bodySmall"
                    fontWeight="bold"
                    style={{ paddingBottom: '3px' }}
                  >
                    There are no finalised reviews for this case.
                  </CustomTypography>
                  <CustomTypography variant="bodySmall">
                    High-risk cases need to be reviewed before they are finalised.
                    Reviewers can be added from the Avatars on the top right, or
                    from the Dashboard. You may ignore this message if this is a
                    low-risk case.
                  </CustomTypography>
                </Box>
              </Box>
            </Box>
          )}

          <Box>
            <CustomTypography className={classes.textMargin}>
              {`Are you sure you want to finalise ${clinicalVersion.patientId}?`}
            </CustomTypography>
            <CustomTypography className={classes.textMargin}>
              The slides will be locked from further edits.
            </CustomTypography>
          </Box>
        </Box>
      )}
    />
  );
}
