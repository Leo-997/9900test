import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import CustomModal from '../Common/CustomModal';
import CustomTypography from '../Common/Typography';

interface IFinaliseCurationModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  updateToNextState: () => void;
}

export function FinaliseHTSCurationModal({
  isOpen,
  setIsOpen,
  updateToNextState,
}: IFinaliseCurationModalProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    analysisSet,
  } = useAnalysisSet();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCompleteCuration = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await zeroDashSdk.curation.analysisSets.triggerExport(analysisSet.analysisSetId, 'HTS');
      enqueueSnackbar('HTS export has started', { variant: 'success' });
      updateToNextState();
      setIsOpen(false);
    } catch {
      enqueueSnackbar('There was an issue updating the case', { variant: 'error' });
    }
    setIsLoading(false);
  };

  return (
    <CustomModal
      title="Complete HTS Curation"
      open={isOpen}
      onClose={(): void => setIsOpen(false)}
      onConfirm={handleCompleteCuration}
      buttonText={{ confirm: 'Complete HTS curation' }}
      confirmDisabled={isLoading}
      content={(
        <>
          <CustomTypography>
            You are about to complete HTS curation for this sample.
          </CustomTypography>
          <CustomTypography>
            This action will copy all reportable drug hits to the Clinical module of ZeroDash.
          </CustomTypography>
          <CustomTypography>
            Would you like to proceed?
          </CustomTypography>
        </>
      )}
    />
  );
}
