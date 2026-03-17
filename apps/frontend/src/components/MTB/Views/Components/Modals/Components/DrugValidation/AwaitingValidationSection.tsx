import { Box } from '@mui/material';
import CustomButton from '@/components/Common/Button';
import CustomTypography from '@/components/Common/Typography';
import { useCallback, useState, type JSX } from 'react';
import { IExternalDrug } from '@/types/Drugs/Drugs.types';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useSnackbar } from 'notistack';
import { useClinical } from '@/contexts/ClinicalContext';
import { makeStyles } from '@mui/styles';
import RejectDrugWarningModal from './RejectDrugWarningModal';

const useStyles = makeStyles(() => ({
  messageDot: {
    width: '8px',
    height: '8px',
    background: '#F8CA19',
    borderRadius: '50%',
  },
}));

interface IProps {
  drug: IExternalDrug;
  removeActiveDrug: () => void;
}

export default function AwaitingValidationSection({
  drug,
  removeActiveDrug,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { clinicalVersion } = useClinical();
  const { enqueueSnackbar } = useSnackbar();
  const [openWarningModal, setOpenWarningModal] = useState<boolean>(false);

  const handleApproveDrug = useCallback(async ():Promise<void> => {
    try {
      await zeroDashSdk.services.drugs.updateDrug(drug.versionId, { isValidated: true });
      removeActiveDrug();
      enqueueSnackbar(`Drug ${drug.name} is validated.`, { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not validate the drug, please try again', { variant: 'error' });
    }
  }, [
    drug.name,
    drug.versionId,
    enqueueSnackbar,
    removeActiveDrug,
    zeroDashSdk.services.drugs,
  ]);

  const handleRejectDrug = useCallback(async (): Promise<void> => {
    try {
      const newLatestVersionId = await zeroDashSdk.services.drugs.rejectDrug(drug.id);
      if (newLatestVersionId) {
        await zeroDashSdk.mtb.drugs
          .downgradeClinicalDrugVersion(
            clinicalVersion.id,
            {
              drugVersionId: drug.versionId,
              newDrugVersionId: newLatestVersionId,
            },
          );
      } else {
        await zeroDashSdk.mtb.recommendation
          .deleteRecommendationsWithRejectedDrug(clinicalVersion.id, drug.versionId);
      }
      removeActiveDrug();
      setOpenWarningModal(false);
      enqueueSnackbar(`Drug ${drug.name} is rejected.`, { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not reject the drug, please try again', { variant: 'error' });
    }
  }, [drug.id,
    drug.name,
    drug.versionId,
    clinicalVersion.id,
    enqueueSnackbar,
    removeActiveDrug,
    zeroDashSdk.mtb.drugs,
    zeroDashSdk.mtb.recommendation,
    zeroDashSdk.services.drugs,
  ]);

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      bgcolor="#FFFAE8"
      padding="16px"
      borderRadius="8px"
      border="1px solid #F8CA19"
    >
      <Box>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap="8px"
        >
          <Box className={classes.messageDot} />
          <CustomTypography variant="h5" fontWeight="medium">
            Awaiting validation
          </CustomTypography>
        </Box>
        <CustomTypography style={{ marginLeft: '16px' }}>
          Validate and approve the drug for usage
        </CustomTypography>
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        gap="8px"
        alignItems="center"
      >
        <CustomButton
          variant="warning"
          label="Reject and delete drug"
          size="small"
          onClick={():void => setOpenWarningModal(true)}
        />
        <CustomButton
          variant="bold"
          label="Approve drug"
          size="small"
          onClick={handleApproveDrug}
        />
      </Box>
      <RejectDrugWarningModal
        open={openWarningModal}
        setOpen={setOpenWarningModal}
        drugName={drug.name}
        onReject={handleRejectDrug}
      />
    </Box>
  );
}
