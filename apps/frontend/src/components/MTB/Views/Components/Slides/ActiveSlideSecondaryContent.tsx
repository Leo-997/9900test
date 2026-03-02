import { useClinical } from '@/contexts/ClinicalContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { RecommendationType } from '@/types/MTB/Recommendation.types';
import { Box } from '@mui/material';
import { useActiveSlide } from '../../../../../contexts/ActiveSlideContext';
import AddGermlineSectionButton from '../Germline/AddGermlineSectionButton';
import AddRecommendationButton from '../Recommendations/Common/AddRecommendationButton';
import SlideRecommendations from '../Recommendations/Common/SlideRecommendations';
import SearchRecommendationsButton from '../Recommendations/Common/SearchRecommendationsButton';
import { GermlineContent } from './GermlineContent';

import type { JSX } from "react";

interface IProps {
  isPresentationMode: boolean;
}

export default function ActiveSlideSecondaryContent({
  isPresentationMode,
}: IProps): JSX.Element {
  const {
    getSlides,
    isAssignedClinician,
    isAssignedCurator,
    isReadOnly,
  } = useClinical();
  const {
    slide,
    isGermline,
    setRecommendations,
    recommendations,
  } = useActiveSlide();

  const canAddRecommendation = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      gap="16px"
      padding="16px 32px"
    >
      {isGermline && (
        <GermlineContent isPresentationMode={isPresentationMode} />
      )}
      <SlideRecommendations isPresentationMode={isPresentationMode} />
      {!isPresentationMode && slide && (
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          flexShrink="0"
          flexGrow="0"
          flexWrap="wrap"
          style={{ marginTop: '16px' }}
          gap="16px"
        >
          {isGermline && (
            <AddGermlineSectionButton />
          )}
          <SearchRecommendationsButton
            onArchiveClose={getSlides}
          />
          <AddRecommendationButton
            title={slide.title}
            alterations={slide.alterations ?? []}
            onSubmitRecommendation={(newRec): void => (
              setRecommendations((prev) => [...prev, newRec])
            )}
            recommendationTypes={[
              'TEXT',
              'CHANGE_DIAGNOSIS',
              ...(slide.alterations?.length ? ['THERAPY'] : []),
              ...(isGermline ? ['GERMLINE'] : []),
            ] as RecommendationType[]}
            entity={{
              entityType: 'SLIDE',
              entityId: slide.id,
            }}
            order={recommendations.length + 1}
            disabled={!canAddRecommendation}
          />
        </Box>
      )}
    </Box>
  );
}
