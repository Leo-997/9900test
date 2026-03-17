import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useState, type JSX } from 'react';
import { corePalette } from '@/themes/colours';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useActiveSlide } from '../../../../../contexts/ActiveSlideContext';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { useMTBArchive } from '../../../../../contexts/MTBArchiveContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { ICreateTherapyDrug } from '../../../../../types/Drugs/Drugs.types';
import { IMolecularAlterationDetail } from '../../../../../types/MTB/MolecularAlteration.types';
import {
  ICreateDiagnosisRecommendation,
  ICreateGroupRecommendation,
  ICreateTherapyRecommendation,
  IFetchRecommendation,
} from '../../../../../types/MTB/Recommendation.types';
import { ISlide } from '../../../../../types/MTB/Slide.types';
import CustomModal from '../../../../Common/CustomModal';
import CustomTypography from '../../../../Common/Typography';
import { CustomAddButton } from '../../../CommonButtons/CustomAddButton';
import RoundedAlterationChip from '../Common/RoundedAlterationChip';
import { RecommendationCountChips } from '../Recommendations/Common/RecommendationCountChips';
import { RecommendationSection } from '../Recommendations/Common/RecommendationSection';

interface IProps {
  recommendation: IFetchRecommendation;
  alterations: IMolecularAlterationDetail[];
}

export default function ArchiveRecommendationActions({
  recommendation,
  alterations,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { slide: activeSlide } = useActiveSlide();
  const {
    setAddNewSlideCallback,
    isReportArchive,
  } = useMTBArchive();
  const {
    clinicalVersion,
    isReadOnly,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();

  const [recToAdd, setRecToAdd] = useState<IFetchRecommendation>();
  const [selectedTargets, setSelectedTargets] = useState<IMolecularAlterationDetail[]>([]);
  const [childRecIds, setChildRecIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const canEditSlide = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;
  const canEditReport = useIsUserAuthorised('report.mtb.content.write', false, isAssignedClinician);

  const addRecToSlide = useCallback(async (
    slideId: string,
    recId: string,
  ): Promise<void> => {
    await zeroDashSdk.mtb.recommendation.createRecommendationsLink(
      clinicalVersion.id,
      {
        recommendationId: recId,
        entityType: 'SLIDE',
        entityId: slideId,
      },
    );
  }, [clinicalVersion.id, zeroDashSdk.mtb.recommendation]);

  const addTherapyRecommendation = useCallback(async (
    rec: IFetchRecommendation,
    slide?: ISlide,
    molAlterationGroupId?: string,
  ): Promise<string | null> => {
    if (rec.therapy) {
      const newId = await zeroDashSdk
        .mtb
        .recommendation
        .addRecommendation<ICreateTherapyRecommendation>(clinicalVersion.id, {
          type: 'THERAPY',
          title: rec.title,
          tier: rec.tier,
          description: rec.description,
          molAlterationGroupId,
          targets: selectedTargets.map((t) => t.id),
          therapy: {
            chemotherapy: rec.therapy.chemotherapy,
            radiotherapy: rec.therapy.radiotherapy,
            chemotherapyNote: rec.therapy.chemotherapyNote,
            radiotherapyNote: rec.therapy.radiotherapyNote,
            drugs: rec.therapy.drugs.map<ICreateTherapyDrug>((therapyDrug) => ({
              externalDrugClassId: therapyDrug.class.id,
              externalDrugVersionId: therapyDrug.externalDrug?.versionId,
            })),
            trials: rec.therapy.trials.map(({ note, externalTrial }) => ({
              note,
              externalTrialId: externalTrial.id,
            })),
          },
          evidence: rec.evidence ?? [],
        });
      if (slide && newId) {
        await addRecToSlide(slide.id, newId);
      }
      return newId;
    }
    return null;
  }, [
    addRecToSlide,
    clinicalVersion.id,
    selectedTargets,
    zeroDashSdk.mtb.recommendation,
  ]);

  const addChangeDiagnosisRecommendation = useCallback(async (
    rec: IFetchRecommendation,
    slide?: ISlide,
    molAlterationGroupId?: string,
  ) => {
    const newId = await zeroDashSdk
      .mtb
      .recommendation
      .addRecommendation<ICreateDiagnosisRecommendation>(clinicalVersion.id, {
        type: 'CHANGE_DIAGNOSIS',
        molAlterationGroupId,
        title: rec.title,
        description: rec.description,
        zero2Category: rec.zero2Category,
        zero2Subcat1: rec.zero2Subcat1,
        zero2Subcat2: rec.zero2Subcat2,
        zero2FinalDiagnosis: rec.zero2FinalDiagnosis,
        targets: selectedTargets?.map((t) => t.id) || [],
        evidence: rec.evidence ?? [],
      });
    if (slide && newId) {
      await addRecToSlide(slide.id, newId);
    }
    return newId;
  }, [
    addRecToSlide,
    clinicalVersion.id,
    selectedTargets,
    zeroDashSdk.mtb.recommendation,
  ]);

  const addGermlineRecommendation = useCallback(async (
    rec: IFetchRecommendation,
    slide?: ISlide,
    molAlterationGroupId?: string,
  ) => {
    const newId = await zeroDashSdk.mtb.recommendation.addRecommendation(clinicalVersion.id, {
      type: 'GERMLINE',
      molAlterationGroupId,
      germlineRecOptions: rec.germlineRecOptions,
      title: rec.title,
      description: rec.description,
      evidence: rec.evidence ?? [],
    });
    if (slide && newId) {
      await addRecToSlide(slide.id, newId);
    }
    return newId;
  }, [
    clinicalVersion?.id,
    zeroDashSdk.mtb.recommendation,
    addRecToSlide,
  ]);

  const addTextRecommendation = useCallback(async (
    rec: IFetchRecommendation,
    slide?: ISlide,
    molAlterationGroupId?: string,
  ) => {
    const newId = await zeroDashSdk.mtb.recommendation.addRecommendation(clinicalVersion.id, {
      type: 'TEXT',
      molAlterationGroupId,
      title: rec.description,
      description: rec.description,
      evidence: rec.evidence ?? [],
    });
    if (slide && newId) {
      await addRecToSlide(slide.id, newId);
    }
    return newId;
  }, [
    addRecToSlide,
    clinicalVersion?.id,
    zeroDashSdk.mtb.recommendation,
  ]);

  const addGroupRecommendation = useCallback(async (
    rec: IFetchRecommendation,
  ) => {
    const newId = zeroDashSdk
      .mtb
      .recommendation
      .addRecommendation<ICreateGroupRecommendation>(clinicalVersion.id, {
        type: 'GROUP',
        tier: rec.tier,
        title: rec.title,
        description: rec.description,
        recommendations: childRecIds,
        targets: selectedTargets?.map((t) => t.id) || [],
        evidence: rec.evidence ?? [],
        showIndividualTiers: rec.showIndividualTiers,
      });
    // TODO: ZDP2-693 add to appropriate report
    return newId;
  }, [
    childRecIds,
    selectedTargets,
    clinicalVersion?.id,
    zeroDashSdk.mtb.recommendation,
  ]);

  const addRecommendation = useCallback(async () => {
    let molAlterationGroupId: string | undefined;
    setLoading(true);
    if (selectedTargets.length) {
      try {
        molAlterationGroupId = await zeroDashSdk.mtb.molAlteration.createMolAlterationsGroup(
          clinicalVersion.id,
          selectedTargets.map((t) => t.id),
        );
      } catch {
        setLoading(false);
        enqueueSnackbar('Could not add recommendation to the slide, please try again');
        return;
      }
    }

    try {
      let newId: string | null = null;
      const slide = isReportArchive
        ? undefined
        : activeSlide;
      switch (recToAdd?.type) {
        case 'THERAPY':
          newId = await addTherapyRecommendation(recToAdd, slide, molAlterationGroupId);
          break;
        case 'CHANGE_DIAGNOSIS':
          newId = await addChangeDiagnosisRecommendation(recToAdd, slide, molAlterationGroupId);
          break;
        case 'GERMLINE':
          newId = await addGermlineRecommendation(recToAdd, slide, molAlterationGroupId);
          break;
        case 'TEXT':
          newId = await addTextRecommendation(recToAdd, slide, molAlterationGroupId);
          break;
        case 'GROUP':
          newId = await addGroupRecommendation(recToAdd);
          setChildRecIds([]);
          break;
        default:
      }
      if (recommendation.id === recToAdd?.id && newId) {
        await zeroDashSdk.mtb.recommendation.getRecommendationById(
          clinicalVersion.id,
          newId,
        );
        setSelectedTargets([]);
        setRecToAdd(undefined);
        enqueueSnackbar('Recommendation added successfully', { variant: 'success' });
        return;
      }

      // go to the next child recommendation
      if (newId) {
        setChildRecIds((prev) => ([...prev, newId || '']));
        const currentIndex = recommendation.recommendations?.findIndex(
          (r) => r.id === recToAdd?.id,
        ) ?? -1;
        if (
          currentIndex > -1
          && recommendation.recommendations
          && currentIndex + 1 < recommendation.recommendations?.length
        ) {
          setRecToAdd(recommendation.recommendations[currentIndex + 1]);
          return;
        }
        if (currentIndex + 1 === recommendation.recommendations?.length) {
          setRecToAdd(recommendation);
          return;
        }
      }

      setRecToAdd(undefined);
    } catch {
      if (molAlterationGroupId) {
        zeroDashSdk.mtb.molAlteration.deleteMolAlterationsGroup(
          clinicalVersion.id,
          molAlterationGroupId,
        );
      }
      enqueueSnackbar('Could not create recommendation, please try again', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [
    activeSlide,
    isReportArchive,
    clinicalVersion.id,
    addGroupRecommendation,
    addTherapyRecommendation,
    addChangeDiagnosisRecommendation,
    addTextRecommendation,
    addGermlineRecommendation,
    enqueueSnackbar,
    recToAdd,
    recommendation,
    selectedTargets,
    zeroDashSdk.mtb.recommendation,
    zeroDashSdk.mtb.molAlteration,
  ]);

  return (
    <Box display="flex" gap="16px" flexWrap="nowrap">
      {!isReportArchive ? (
        <>
          {activeSlide && canEditSlide && (
            <CustomAddButton
              // difficult to check if a recommendation is added since we are creating a copy
              isAdded={false}
              onAdd={(): void => setRecToAdd(recommendation)}
              buttonLabel="Add to current slide"
            />
          )}
          {canEditSlide && (
            <CustomAddButton
              isAdded={false}
              onAdd={(): void => (
                setAddNewSlideCallback(() => (
                  () => setRecToAdd(recommendation)
                ))
              )}
              buttonLabel="Add to a new slide"
            />
          )}
        </>
      ) : (
        canEditReport && (
          <CustomAddButton
            isAdded={false}
            onAdd={(): void => setRecToAdd(recommendation.recommendations?.[0])}
            buttonLabel="Add to report"
          />
        )
      )}
      {recToAdd && (
        <CustomModal
          open={Boolean(recToAdd)}
          onClose={(): void => setRecToAdd(undefined)}
          title="Select recommendation targets"
          variant="create"
          buttonText={{ confirm: 'Submit' }}
          onConfirm={addRecommendation}
          confirmDisabled={loading}
          content={(
            <Box display="flex" flexDirection="column" gap="24px">
              {alterations.length > 0 && (
                <Box display="flex" flexDirection="column" width="100%">
                  <CustomTypography variant="titleRegular" fontWeight="medium">
                    Target
                  </CustomTypography>
                  <CustomTypography variant="bodyRegular" style={{ color: corePalette.grey100 }}>
                    Select an alteration to target for this recommendation.
                  </CustomTypography>
                  <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    flexWrap="wrap"
                    width="100%"
                  >
                    {alterations.map((a) => (
                      <RoundedAlterationChip
                        key={a.id}
                        alteration={a}
                        isSelected={selectedTargets.map((t) => t.id).includes(a.id)}
                        setTargets={setSelectedTargets}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              <RecommendationSection
                recommendation={recToAdd}
                isArchive
                chips={<RecommendationCountChips recs={[recToAdd]} />}
              />
            </Box>
          )}
        />
      )}
    </Box>
  );
}
