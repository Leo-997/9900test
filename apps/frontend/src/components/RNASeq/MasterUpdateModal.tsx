import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '@/contexts/CurationContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';
import {
  Box,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import { useState, type JSX } from 'react';
import CustomModal from '../Common/CustomModal';
import RNAMasterUpdateModalContent from './RNAMasterUpdateModalContent';

const useStyles = makeStyles(() => ({
  wrapper: {
    gap: '20px',
    padding: '30px',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

interface IProps {
  open: boolean;
  onClose(): void;
}

export default function MasterUpdateModal({
  open,
  onClose,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { rnaBiosample, analysisSet } = useAnalysisSet();
  const { isAssignedCurator, isReadOnly: isCaseReadOnly } = useCuration();
  const isBiosampleReadOnly = useIsPatientReadOnly({ biosampleId: rnaBiosample?.biosampleId });
  const isReadOnly = isBiosampleReadOnly || isCaseReadOnly;
  const { enqueueSnackbar } = useSnackbar();

  const [selectedSubcat2, setSelectedSubcat2] = useState<string | undefined>(
    analysisSet?.zero2Subcategory2,
  );

  const canEdit = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator) && !isReadOnly;

  const regeneratePlots = async (): Promise<void> => {
    if (rnaBiosample?.biosampleId && selectedSubcat2) {
      zeroDashSdk.rna.regenerateTPMPlots(rnaBiosample.biosampleId, selectedSubcat2).catch(() => {
        enqueueSnackbar('Cannot update plots, please try again.', { variant: 'error' });
      });
      onClose();
      enqueueSnackbar('Updating plots! Please refresh the page in a few seconds to view.', { variant: 'success' });
    }
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      variant="create"
      buttonText={{
        confirm: 'Confirm',
      }}
      confirmDisabled={!selectedSubcat2 || !canEdit}
      onConfirm={regeneratePlots}
      title={`Update all RNASeq TPM plots for ${rnaBiosample?.biosampleId}?`}
      content={(
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="flex-start"
          align-content="space-around"
          className={classes.wrapper}
        >
          <RNAMasterUpdateModalContent
            setSelectedSubcat2={setSelectedSubcat2}
          />
        </Box>
      )}
    />
  );
}
