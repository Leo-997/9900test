import MolAlterationsSelectModal from '@/components/MTB/Views/Components/Slides/GenerateSlides/MolAlterationsSelectModal';
import { defaultInterpretationGeneralSummaryVal } from '@/constants/Reports/mtbReport';
import { failedInterpretationVal } from '@/constants/Reports/preclinicalReport';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IMolecularAlterationDetail } from '@/types/MTB/MolecularAlteration.types';
import { Box } from '@mui/material';
import { PlusIcon } from 'lucide-react';
import * as motion from 'motion/react-client';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo, useState, type JSX } from 'react';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { useReport } from '../../../../../contexts/Reports/CurrentReportContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import CustomButton from '../../../../Common/Button';
import MTBInterpretation from './MTBInterpretation';
import ClinicalReportCommentInput from './TextBox/ClinicalReportCommentInput';

export default function MTBInterpretations(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    reportType,
    isGeneratingReport,
    pendingReport,
    isAssignedClinician,
    isAssignedCurator,
    isReadOnly,
  } = useReport();
  const {
    interpretations,
    getInterpretations,
    htsCombinations,
    htsResults,
    culture,
  } = useReportData();
  const {
    clinicalVersion,
  } = useClinical();

  const [newModalOpen, setNewModalOpen] = useState<boolean>(false);

  const canCreateInterpretations = useIsUserAuthorised(
    reportType === 'MTB_REPORT' ? 'report.mtb.write' : 'report.preclinical.write',
    isAssignedCurator,
    isAssignedClinician,
  ) && !isReadOnly;

  const preclinicalFailed = useMemo(() => (
    ((!htsCombinations || htsCombinations.length === 0)
      && (!htsResults || htsResults.length === 0))
      || culture?.screenStatus === 'FAIL'
  ), [htsCombinations, htsResults, culture?.screenStatus]);

  const getGeneralSummaryInitialText = (): string | undefined => {
    if (reportType === 'PRECLINICAL_REPORT' && preclinicalFailed) {
      return failedInterpretationVal;
    }
    if (reportType === 'MTB_REPORT') {
      return defaultInterpretationGeneralSummaryVal;
    }
    return undefined;
  };

  const handleReorderInterpretation = async (
    interpretationId: string,
    operation: 'up' | 'down',
  ): Promise<void> => {
    const newInterpretations = [...interpretations];
    const index = newInterpretations.findIndex(
      (interpretation) => interpretation.id === interpretationId,
    );
    if (operation === 'up' && index > 0) {
      [
        newInterpretations[index - 1],
        newInterpretations[index],
      ] = [
        newInterpretations[index],
        newInterpretations[index - 1],
      ];
    } else if (operation === 'down' && index < newInterpretations.length - 1) {
      [
        newInterpretations[index + 1],
        newInterpretations[index],
      ] = [
        newInterpretations[index],
        newInterpretations[index + 1],
      ];
    }
    try {
      await zeroDashSdk.mtb.interpretations.updateInterpretationOrder(
        clinicalVersion.id,
        newInterpretations.map((interpretation, i) => ({
          id: interpretation.id,
          order: i + 1,
        })),
      );
      getInterpretations();
    } catch {
      enqueueSnackbar('Could not update the report order, please try again', { variant: 'error' });
    }
  };

  const createInterpretation = useCallback(async (
    alterations?: IMolecularAlterationDetail[],
  ) => {
    const molAlterationGroupId = alterations
      ? await zeroDashSdk.mtb.molAlteration.createMolAlterationsGroup(
        clinicalVersion.id,
        alterations.map((a) => a.id),
      )
      : null;

    const interpretationId = await zeroDashSdk.mtb.interpretations.createInterpretation(
      clinicalVersion.id,
      {
        molAlterationGroupId,
        title: alterations
          ? alterations.filter((alt) => alt.description).map((alt) => alt.description).join('; ')
          : '',
        order: (interpretations?.length || 0) + 1,
        reportType,
      },
    );

    getInterpretations();

    const savedCommentsString = localStorage.getItem('interpretationComments');
    const savedComments = savedCommentsString ? JSON.parse(savedCommentsString) : {};
    const savedCommentId = `${clinicalVersion.id}-${interpretationId}`;
    const newSavedComments = {
      ...savedComments,
      [savedCommentId]: JSON.stringify({
        value: [{
          type: 'p',
          children: [{ text: '' }],
        }],
        comments: {},
      }),
    };
    localStorage.setItem('interpretationComments', JSON.stringify(newSavedComments));

    setNewModalOpen(false);
  }, [
    reportType,
    clinicalVersion.id,
    interpretations?.length,
    getInterpretations,
    zeroDashSdk.mtb.interpretations,
    zeroDashSdk.mtb.molAlteration,
  ]);

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      {pendingReport?.id && (
        <ClinicalReportCommentInput
          title="Interpretation and comments"
          threadType="REPORTS"
          entityType={reportType}
          entityId={pendingReport.id}
          type="GENERAL_SUMMARY"
          removeArchive
          initialText={getGeneralSummaryInitialText()}
          disabled={!canCreateInterpretations}
        />
      )}
      {interpretations
        .map((interpretation, index, self) => (
          <motion.div
            key={interpretation.id}
            layout={!isGeneratingReport ? 'position' : undefined}
            transition={!isGeneratingReport ? {
              ease: [0.19, 1, 0.22, 1],
              duration: 0.4,
            } : undefined}
          >
            <MTBInterpretation
              interpretation={interpretation}
              onOrder={(o): Promise<void> => handleReorderInterpretation(interpretation.id, o)}
              onUpdate={(): Promise<void> => getInterpretations()}
              onDelete={(): Promise<void> => getInterpretations()}
              isFirst={index === 0}
              isLast={index === self.length - 1}
            />
          </motion.div>
        ))}
      {!isGeneratingReport && (
        <Box display="flex" justifyContent="center" padding="16px">
          <CustomButton
            variant="outline"
            label="Add comments"
            startIcon={(
              <PlusIcon />
            )}
            disabled={!canCreateInterpretations}
            onClick={(): void => {
              if (reportType === 'MTB_REPORT') {
                setNewModalOpen(true);
              } else {
                createInterpretation();
              }
            }}
          />
        </Box>
      )}
      {newModalOpen && (
        <MolAlterationsSelectModal
          open={newModalOpen}
          onClose={(): void => setNewModalOpen(false)}
          onSave={createInterpretation}
          isNewSlide={false}
        />
      )}
    </Box>
  );
}
