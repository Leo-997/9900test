import { Dispatch, SetStateAction, useState, type JSX } from 'react';

import CustomModal from '@/components/Common/CustomModal';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { ClinicalMeetingType } from '@/types/Meetings/Meetings.types';
import { DashboardMeetingType } from '../../../../types/Dashboard.types';
import ClinicalPopupDashboardTabContent from '../../Clinical/PopupDashboardTabContent';
import CurationPopupTabContent from '../../Curation/PopupTabContent';

interface IProps {
  date: string;
  type: DashboardMeetingType;
  clinicalMeetingType: ClinicalMeetingType;
  assignSamples: (samples: string[]) => Promise<void>;
  isUpdateStatusOpen: boolean;
  setUpdateStatusOpen: Dispatch<SetStateAction<boolean>>;
}

export default function AssignSamplePopup({
  date,
  type,
  clinicalMeetingType,
  assignSamples,
  isUpdateStatusOpen,
  setUpdateStatusOpen,
}: IProps): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();

  const [selectedCases, setSelectedCases] = useState<string[]>([]);

  const handleClose = (): void => setUpdateStatusOpen(false);

  const assignMultipleCases = async (): Promise<void> => {
    try {
      await assignSamples(selectedCases);
      handleClose();
    } catch {
      enqueueSnackbar('There was an error while updating samples.', { variant: 'error' });
    }
  };

  const addSampleId = (sampleId: string): void => (
    setSelectedCases((prev) => {
      prev.push(sampleId);
      return [...prev];
    })
  );

  const removeSampleId = (sampleId): void => (
    setSelectedCases((prev) => {
      const index = prev.indexOf(sampleId);
      if (index > -1) prev.splice(index, 1);
      return [...prev];
    })
  );

  return (
    <CustomModal
      open={isUpdateStatusOpen}
      onClose={handleClose}
      title={`Add cases to the ${dayjs(date).format('dddd Do of MMMM')} meeting`}
      buttonText={{ confirm: 'Add cases', cancel: 'Discard' }}
      onConfirm={assignMultipleCases}
      content={(
        type === 'Curation' ? (
          <CurationPopupTabContent
            assignedSample={selectedCases}
            addSampleId={addSampleId}
            removeSampleId={removeSampleId}
          />
        ) : (
          <ClinicalPopupDashboardTabContent
            date={date}
            selectedCases={selectedCases}
            setSelectedCases={setSelectedCases}
            clinicalMeetingType={clinicalMeetingType}
          />
        )
      )}
    />
  );
}
