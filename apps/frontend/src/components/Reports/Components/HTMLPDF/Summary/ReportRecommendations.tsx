import { Box } from '@mui/material';
import * as motion from 'motion/react-client';
import { useSnackbar } from 'notistack';
import {
  JSX, ReactNode, useCallback, useEffect, useRef,
} from 'react';
import AddRecommendationButton from '@/components/MTB/Views/Components/Recommendations/Common/AddRecommendationButton';
import { RecommendationSection } from '@/components/MTB/Views/Components/Recommendations/Common/RecommendationSection';
import DiagnosisRecommendationActions from '@/components/MTB/Views/Components/Recommendations/Diagnosis/DiagnosisRecommendationActions';
import GermlineRecommendationActions from '@/components/MTB/Views/Components/Recommendations/Germline/GermlineRecommendationActions';
import GroupRecommendationActions from '@/components/MTB/Views/Components/Recommendations/Group/GroupRecommendationActions';
import TextRecommendationActions from '@/components/MTB/Views/Components/Recommendations/Text/TextRecommendationActions';
import TherapyRecommendationActions from '@/components/MTB/Views/Components/Recommendations/Therapy/TherapyRecommendationActions';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { RecommendationCountChips } from '@/components/MTB/Views/Components/Recommendations/Common/RecommendationCountChips';
import { useUser } from '@/contexts/UserContext';
import { errorFetchingDataMsg } from '@/constants/Reports/reports';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { useReport } from '../../../../../contexts/Reports/CurrentReportContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { IUpdateOrder } from '../../../../../types/Common.types';
import { IFetchRecommendation, RecommendationLinkEntity, RecommendationType } from '../../../../../types/MTB/Recommendation.types';
import CustomTypography from '../../../../Common/Typography';
import { ErrorMessageBox } from '../Components/ErrorMessageBox';
import ClinicalReportCommentInput from '../Comments/TextBox/ClinicalReportCommentInput';
import { failedRecommendationVal } from '@/constants/Reports/preclinicalReport';

interface IProps {
  recommendationTypes: RecommendationType[];
  canEditRec: boolean;
  preclinicalFailed?: boolean;
}

export default function ReportRecommendations({
  recommendationTypes,
  canEditRec = false,
  preclinicalFailed,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { clinicalVersion } = useClinical();
  const { enqueueSnackbar } = useSnackbar();
  const {
    isGeneratingReport,
    reportType,
    isApproving,
    pendingReport,
  } = useReport();
  const {
    reportMolAlterations,
    recommendations,
    setRecommendations,
    getRecommendations,
    errorLoadingItems,
  } = useReportData();
  const { currentUser } = useUser();

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const isPreclinicalReport = reportType === 'PRECLINICAL_REPORT';
  const isMolecularReport = reportType === 'MOLECULAR_REPORT';
  const isMTBReport = reportType === 'MTB_REPORT';

  const updateRecommendationOrder = useCallback(async (
    data: IUpdateOrder[],
  ): Promise<void> => {
    await zeroDashSdk.mtb.recommendation.updateRecommendationOrder(
      clinicalVersion.id,
      'REPORT',
      reportType,
      data,
    );
  }, [clinicalVersion.id, reportType, zeroDashSdk.mtb.recommendation]);

  const onRecommendationMove = useCallback((
    recommendation: IFetchRecommendation,
    direction: 'up' | 'down',
  ): void => {
    setRecommendations((prev) => {
      const newRecommendations = [...prev];
      const index = prev.findIndex((r) => r.id === recommendation.id);
      if (direction === 'up' && index > 0) {
        [
          newRecommendations[index - 1],
          newRecommendations[index],
        ] = [
          newRecommendations[index],
          newRecommendations[index - 1],
        ];
      } else if (direction === 'down' && index < newRecommendations.length - 1) {
        [
          newRecommendations[index + 1],
          newRecommendations[index],
        ] = [
          newRecommendations[index],
          newRecommendations[index + 1],
        ];
      }
      updateRecommendationOrder(newRecommendations.map((r, i) => ({
        id: r.id,
        order: i + 1,
      })));
      return newRecommendations;
    });
  }, [setRecommendations, updateRecommendationOrder]);

  const handleDeleteRecommendation = useCallback(async (
    recommendation: IFetchRecommendation,
  ): Promise<void> => {
    try {
      await zeroDashSdk.mtb.recommendation.deleteRecommendation(
        clinicalVersion.id,
        recommendation.id,
      );
      if (setRecommendations) {
        setRecommendations((prev) => {
          const newRecommendations = prev
            .filter((r) => r.id !== recommendation.id)
            .map((r, i) => ({ ...r, slideOrder: i + 1 }));

          updateRecommendationOrder([
            ...newRecommendations.map((r, i) => ({
              id: r.id,
              order: i + 1,
            })),
          ]);

          return newRecommendations;
        });
      }
      enqueueSnackbar('Deleted recommendation successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Cannot delete recommendation, please try again later', { variant: 'error' });
    }
  }, [
    clinicalVersion.id,
    enqueueSnackbar,
    setRecommendations,
    updateRecommendationOrder,
    zeroDashSdk.mtb.recommendation,
  ]);

  const handleAddRecommendation = (newRec: IFetchRecommendation): void => {
    setRecommendations((prev) => ([
      ...prev,
      newRec,
    ]));
  };

  const handleUpdateRecommendation = useCallback((
    oldRec: IFetchRecommendation,
    newRec: IFetchRecommendation,
  ): void => {
    setRecommendations(
      (prev) => prev.map((prevRec) => (
        prevRec.id === oldRec.id
          ? newRec
          : prevRec
      )),
    );
  }, [setRecommendations]);

  const getActionProps = useCallback((r: IFetchRecommendation) => ({
    recommendation: r,
    onSubmitRecommendation:
      (newRec: IFetchRecommendation): void => handleUpdateRecommendation(r, newRec),
    actions: {
      edit: true,
      delete: true,
      order: true,
    },
    permissions: {
      edit: canEditRec,
      delete: canEditRec,
      order: canEditRec,
    },
    onDelete: (): Promise<void> => handleDeleteRecommendation(r),
    onOrder: (dir: 'up' | 'down'): void => onRecommendationMove(r, dir),
    entity: {
      entityType: 'REPORT',
      entityId: reportType,
    } as RecommendationLinkEntity,
  }), [
    canEditRec,
    handleDeleteRecommendation,
    handleUpdateRecommendation,
    onRecommendationMove,
    reportType,
  ]);

  const getActionsMapping = (r: IFetchRecommendation): ReactNode => {
    switch (r.type) {
      case 'TEXT':
        return (
          <TextRecommendationActions
            {...getActionProps(r)}
          />
        );
      case 'CHANGE_DIAGNOSIS':
        return (
          <DiagnosisRecommendationActions
            alterations={reportMolAlterations}
            {...getActionProps(r)}
          />
        );
      case 'GERMLINE':
        return (
          <GermlineRecommendationActions
            {...getActionProps(r)}
          />
        );
      case 'THERAPY':
        return (
          <TherapyRecommendationActions
            alterations={isPreclinicalReport ? [] : reportMolAlterations}
            {...getActionProps(r)}
          />
        );
      case 'GROUP':
        return (
          <GroupRecommendationActions
            {...getActionProps(r)}
          />
        );
      default:
        return null;
    }
  };

  const showErrorMsg = errorLoadingItems.includes('recommendations');

  useEffect(() => {
    if (wrapperRef.current && showErrorMsg && isApproving === 'Finalise') {
      wrapperRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isApproving, showErrorMsg]);

  const getClinicalReportCommentInput = (): JSX.Element | null => {
    if (!isMTBReport && !isPreclinicalReport) return null;
    const isFailedPreclinicalReport = isPreclinicalReport && preclinicalFailed;

    return (
      <Box marginBottom="16px">
        <ClinicalReportCommentInput
          title={isFailedPreclinicalReport ? 'MTB recommendation(s)' : ''}
          threadType="REPORTS"
          entityType={reportType}
          entityId={pendingReport?.id ?? ''}
          type="RECOMMENDATIONS"
          removeArchive
          disabled={!canEditRec || !pendingReport?.id}
          initialText={isFailedPreclinicalReport ? failedRecommendationVal : undefined}
        />
      </Box>
    );
  };

  return (
    <Box
      ref={wrapperRef}
      sx={
        isMolecularReport
          ? {
            '& .MuiTypography-root': {
              opacity: '60%',
            },
          } : undefined
      }
    >
      <Box
        display="flex"
        flexDirection="row"
        gap="8px"
        paddingBottom={!isGeneratingReport ? '16px' : undefined}
      >
        <CustomTypography
          variant="bodyRegular"
          fontWeight="bold"
          tooltipText={
            isMolecularReport
              ? 'The recommendations will not show in the finalised report'
              : undefined
          }
        >
          {
            isMolecularReport
              ? 'Recommendation(s)'
              : 'MTB recommendation(s)'
          }
        </CustomTypography>
        {!(currentUser?.groups ?? []).some((g) => g.name === 'MTBChairs')
            && !isGeneratingReport
            && <RecommendationCountChips recs={recommendations} isTotalCount />}
      </Box>
      {getClinicalReportCommentInput()}
      <Box display="flex" flexDirection="column" gap={isGeneratingReport ? undefined : '16px'}>
        {recommendations.map((r) => (
          <motion.div
            key={r.id}
            layout={!isGeneratingReport}
            transition={!isGeneratingReport ? {
              ease: [0.19, 1, 0.22, 1],
              duration: 0.4,
            } : undefined}
          >
            <RecommendationSection
              recommendation={r}
              actions={!isGeneratingReport ? getActionsMapping(r) : undefined}
              isGeneratingReport={Boolean(isGeneratingReport)}
              isReport
              chips={<RecommendationCountChips recs={[r]} />}
              onDrugValidationModalClose={(): void => {
                getRecommendations();
              }}
            />
          </motion.div>
        ))}
      </Box>
      {!isGeneratingReport && (
        <Box display="flex" justifyContent="center" gap="16px" padding="16px">
          {/* TODO: ZDP2-693 - add archive to recommendations */}
          {/* <SearchRecommendationsButton
            inReport
            onArchiveClose={(): void => getAllRecommendations()}
            disabled={!canEditRec}
          /> */}
          <AddRecommendationButton
            alterations={isPreclinicalReport ? [] : reportMolAlterations}
            onSubmitRecommendation={handleAddRecommendation}
            recommendationTypes={recommendationTypes}
            entity={{
              entityType: 'REPORT',
              entityId: reportType,
            }}
            order={recommendations.length + 1}
            disabled={!canEditRec}
          />
        </Box>
      )}
      {showErrorMsg && (
        <ErrorMessageBox
          message={errorFetchingDataMsg}
        />
      )}
    </Box>
  );
}
