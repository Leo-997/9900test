import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '@/contexts/CurationContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { ClinicalStatus } from '@/types/MTB/ClinicalStatus.types';
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import CustomModal from '../Common/CustomModal';
import ExportModalContent from './ExportModalContent';

interface IFinaliseCurationModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  updateToNextState: () => void;
}

export function FinaliseCurationModal({
  isOpen,
  setIsOpen,
  updateToNextState,
}: IFinaliseCurationModalProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    analysisSet,
  } = useAnalysisSet();
  const { curationStatus } = useCuration();
  const [clinicalStatus, setClinicalStatus] = useState<ClinicalStatus | 'N/A'>(
    analysisSet.cohort
    && (analysisSet.cohort.startsWith('Cohort 1 ') || analysisSet.cohort.startsWith('Cohort 2 '))
      ? 'Ready to Start'
      : 'N/A',
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCompleteCuration = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await zeroDashSdk.curation.analysisSets.triggerExport(analysisSet.analysisSetId, 'CASE', clinicalStatus);
      enqueueSnackbar('Sample export has started', { variant: 'success' });
      if (curationStatus?.status !== 'Done') {
        updateToNextState();
      }
      setIsOpen(false);
    } catch {
      enqueueSnackbar('There was an issue updating the sample', { variant: 'error' });
    }
    setIsLoading(false);
  };

  return (
    <CustomModal
      title={curationStatus?.status === 'Done' ? 'Re-export clinical data' : 'Complete Curation'}
      open={isOpen}
      onClose={(): void => setIsOpen(false)}
      onConfirm={handleCompleteCuration}
      buttonText={{
        confirm: curationStatus?.status === 'Done'
          ? 'Re-export clinical data'
          : 'Complete Curation',
      }}
      confirmDisabled={isLoading}
      content={(
        <ExportModalContent
          clinicalStatus={clinicalStatus}
          setClinicalStatus={setClinicalStatus}
        />
      )}
    />
  );
}
