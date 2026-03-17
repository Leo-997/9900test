import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { ISlide } from '@/types/MTB/Slide.types';
import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import * as motion from 'motion/react-client';
import { useSnackbar } from 'notistack';
import { ReactNode, useCallback, useMemo, type JSX } from 'react';
import { columnOptions } from '../../../../../../constants/options';
import { useActiveSlide } from '../../../../../../contexts/ActiveSlideContext';
import { useClinical } from '../../../../../../contexts/ClinicalContext';
import { useZeroDashSdk } from '../../../../../../contexts/ZeroDashSdkContext';
import LayoutInput from '../../../../../../layouts/LayoutInput';
import { IUpdateOrder } from '../../../../../../types/Common.types';
import { IFetchRecommendation, RecommendationLinkEntity } from '../../../../../../types/MTB/Recommendation.types';
import LoadingAnimation from '../../../../../Animations/LoadingAnimation';
import DiagnosisRecommendationActions from '../Diagnosis/DiagnosisRecommendationActions';
import GermlineRecommendationActions from '../Germline/GermlineRecommendationActions';
import TextRecommendationActions from '../Text/TextRecommendationActions';
import TherapyRecommendationActions from '../Therapy/TherapyRecommendationActions';
import { RecommendationCountChips } from './RecommendationCountChips';
import { RecommendationSection } from './RecommendationSection';

const useStyles = makeStyles(() => ({
  recommendationWrapper: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '& #hide-row-button': {
        visibility: 'visible',
        opacity: 1,
      },
    },
  },
}));

interface IRecommendationsProps {
  isPresentationMode: boolean;
}

export default function SlideRecommendations({
  isPresentationMode,
}: IRecommendationsProps): JSX.Element {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const zeroDashSdk = useZeroDashSdk();
  const {
    clinicalVersion,
    isReadOnly,
    isAssignedCurator,
    isAssignedClinician,
    getSlides,
  } = useClinical();
  const {
    slide,
    recommendations,
    setRecommendations,
    updateSlideData,
    loading,
  } = useActiveSlide();

  const canEditSlide = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;

  const slideRecommendationActions = useMemo(() => ({
    order: true,
    delete: true,
    edit: true,
    hide: true,
  }), []);

  const slideRecommendationPermissions = useMemo(() => ({
    order: canEditSlide,
    delete: canEditSlide,
    edit: canEditSlide,
    hide: canEditSlide,
  }), [canEditSlide]);

  const isRecHidden = useCallback((rec: IFetchRecommendation): boolean => (
    Boolean(rec.links?.find((l) => l.entityType === 'SLIDE' && l.entityId === slide?.id)?.hidden)
  ), [slide?.id]);

  const visibleRecommendations = useMemo(
    () => recommendations.filter((r) => !isPresentationMode || !isRecHidden(r)),
    [isPresentationMode, isRecHidden, recommendations],
  );

  const handleUpdateLayout = (value: string): void => {
    if (slide) {
      try {
        zeroDashSdk.mtb.slides.updateSlideSetting(clinicalVersion.id, slide.id, {
          setting: 'recColumns',
          value,
        });
        updateSlideData('settings', {
          ...slide.settings,
          recColumns: parseInt(value, 10),
        });
      } catch (err) {
        enqueueSnackbar('Could not update layout, please try again', { variant: 'error' });
      }
    }
  };

  const updateRecommendationOrder = useCallback(async (
    data: IUpdateOrder[],
  ): Promise<void> => {
    if (slide) {
      await zeroDashSdk.mtb.recommendation.updateRecommendationOrder(
        clinicalVersion.id,
        'SLIDE',
        slide.id,
        data,
      );
    }
  }, [clinicalVersion.id, slide, zeroDashSdk.mtb.recommendation]);

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
    recommendationId: string,
  ): Promise<void> => {
    try {
      await zeroDashSdk.mtb.recommendation.deleteRecommendation(
        clinicalVersion.id,
        recommendationId,
      );
      if (setRecommendations) {
        setRecommendations((prev) => {
          const newRecommendations = prev
            .filter((r) => r.id !== recommendationId)
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
    } catch (err) {
      enqueueSnackbar('Cannot delete recommendation, please try again later', { variant: 'error' });
    }
  }, [
    clinicalVersion.id,
    enqueueSnackbar,
    setRecommendations,
    updateRecommendationOrder,
    zeroDashSdk.mtb.recommendation,
  ]);

  const updateHidden = useCallback(async (
    recommendationId: string,
    isHidden: boolean,
  ): Promise<void> => {
    try {
      if (slide) {
        await zeroDashSdk.mtb.recommendation.createRecommendationsLink(
          clinicalVersion.id,
          {
            recommendationId,
            entityType: 'SLIDE',
            entityId: slide?.id,
            hidden: isHidden,
          },
        );
        if (setRecommendations) {
          setRecommendations((prev) => prev.map((r) => ({
            ...r,
            links: r.id === recommendationId
              ? r.links?.map((l) => ({
                ...l,
                hidden: l.entityType === 'SLIDE' && l.entityId === slide.id
                  ? isHidden
                  : l.hidden,
              }))
              : r.links,
          })));
        }
      }
    } catch {
      enqueueSnackbar('Cannot update hidden status, please try again later', { variant: 'error' });
    }
  }, [
    clinicalVersion.id,
    enqueueSnackbar,
    setRecommendations,
    slide,
    zeroDashSdk.mtb.recommendation,
  ]);

  const getActionProps = useCallback((r: IFetchRecommendation, s: ISlide) => ({
    recommendation: r,
    entity: {
      entityType: 'SLIDE',
      entityId: s.id,
    } as RecommendationLinkEntity,
    isCondensed: s.settings?.recColumns === 3,
    onSubmitRecommendation: (newRec: IFetchRecommendation) => setRecommendations(
      (prev) => prev.map((prevRec) => (prevRec.id === r.id ? newRec : prevRec)),
    ),
    actions: slideRecommendationActions,
    permissions: slideRecommendationPermissions,
    onDelete: () => handleDeleteRecommendation(r.id),
    onHide: (isHidden: boolean) => updateHidden(r.id, isHidden),
    onOrder: (dir: 'up' | 'down') => onRecommendationMove(r, dir),
  }), [
    handleDeleteRecommendation,
    onRecommendationMove,
    setRecommendations,
    slideRecommendationActions,
    slideRecommendationPermissions,
    updateHidden,
  ]);

  const getActionsMapping = (r: IFetchRecommendation, s: ISlide): ReactNode => {
    switch (r.type) {
      case 'THERAPY':
        return (
          <TherapyRecommendationActions
            alterations={s.alterations ?? []}
            {...getActionProps(r, s)}
          />
        );
      case 'CHANGE_DIAGNOSIS':
        return (
          <DiagnosisRecommendationActions
            alterations={s.alterations ?? []}
            {...getActionProps(r, s)}
          />
        );
      case 'GERMLINE':
        return (
          <GermlineRecommendationActions
            {...getActionProps(r, s)}
          />
        );
      case 'TEXT':
        return (
          <TextRecommendationActions
            {...getActionProps(r, s)}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <LoadingAnimation />
    );
  }

  return (
    <>
      {!isPresentationMode && visibleRecommendations.length > 0 && (
        <LayoutInput
          value={(slide?.settings?.recColumns || 1).toString()}
          onUpdate={handleUpdateLayout}
          options={columnOptions}
          disabled={!canEditSlide}
        />
      )}
      <Grid container spacing={2}>
        {visibleRecommendations.map((r) => (
          <Grid
            key={r.id}
            size={{ xs: 12 / (slide?.settings?.recColumns || 1) }}
          >
            <motion.div
              layout
              transition={{
                ease: [0.19, 1, 0.22, 1],
                duration: 0.4,
              }}
              className={clsx({
                [classes.recommendationWrapper]: canEditSlide && !isPresentationMode,
              })}
            >
              {slide && (
                <RecommendationSection
                  key={r.id}
                  recommendation={r}
                  isPresentationMode={isPresentationMode}
                  actions={getActionsMapping(r, slide)}
                  chips={<RecommendationCountChips recs={[r]} />}
                  onDrugValidationModalClose={getSlides}
                />
              )}
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
