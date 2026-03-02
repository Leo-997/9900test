import CustomButton from '@/components/Common/Button';
import { IFetchRecommendation } from '@/types/MTB/Recommendation.types';
import { PencilIcon, PlusIcon } from 'lucide-react';
import { useMemo, useState, type JSX } from 'react';
import { TherapyRecommendationProvider } from '@/contexts/TherapyRecommendationContext';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import TherapyRecommendationDialog from '../Views/Components/Recommendations/Therapy/TherapyRecommendationDialog';
import TextRecommendationDialog from '../Views/Components/Recommendations/Text/TextRecommendationDialog';
import GermlineRecommendationDialog from '../Views/Components/Recommendations/Germline/GermlineRecommendationDialog';
import DiagnosisRecommendationDialog from '../Views/Components/Recommendations/Diagnosis/DiagnosisRecommendationDialog';

interface IProps {
  existingRec: IFetchRecommendation,
  handleSubmit: (newRec: IFetchRecommendation) => void;
}

export default function ReportRecommendationButton({
  existingRec,
  handleSubmit,
}: IProps): JSX.Element {
  const { reportMolAlterations } = useReportData();
  const { reportType } = useReport();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const isCopy = useMemo(
    () => existingRec.links?.length && existingRec.links?.length > 0,
    [existingRec.links?.length],
  );

  return (
    <>
      <CustomButton
        variant="outline"
        label={isCopy ? 'Add' : 'Edit'}
        startIcon={isCopy ? <PlusIcon /> : <PencilIcon />}
        size="small"
        onClick={(): void => setOpenModal(true)}
      />
      {openModal && existingRec.type === 'TEXT' && (
        <TextRecommendationDialog
          open={openModal}
          setOpen={setOpenModal}
          existingRec={existingRec}
          onSubmitRecommendation={handleSubmit}
        />
      )}
      {openModal && existingRec.type === 'CHANGE_DIAGNOSIS' && (
        <DiagnosisRecommendationDialog
          alterations={reportMolAlterations}
          open={openModal}
          setOpen={setOpenModal}
          existingRec={existingRec}
          onSubmitRecommendation={handleSubmit}
        />
      )}
      {openModal && existingRec.type === 'GERMLINE' && (
        <GermlineRecommendationDialog
          open={openModal}
          setOpen={setOpenModal}
          existingRec={existingRec}
          onSubmitRecommendation={handleSubmit}
        />
      )}
      {openModal && existingRec.type === 'THERAPY' && (
        <TherapyRecommendationProvider
          existingRec={existingRec}
        >
          <TherapyRecommendationDialog
            alterations={reportType === 'PRECLINICAL_REPORT' ? [] : reportMolAlterations}
            open={openModal}
            setOpen={setOpenModal}
            onSubmitRecommendation={handleSubmit}
          />
        </TherapyRecommendationProvider>
      )}
    </>

  );
}
