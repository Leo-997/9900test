import { Box } from '@mui/material';
import { useCallback, useEffect, useState, type JSX } from 'react';
import { useActiveSlide } from '../../../../../contexts/ActiveSlideContext';
import { useMTBArchive } from '../../../../../contexts/MTBArchiveContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { IMolecularAlterationDetail } from '../../../../../types/MTB/MolecularAlteration.types';
import { IFetchRecommendation, IFetchRecommendationFilters } from '../../../../../types/MTB/Recommendation.types';
import LoadingAnimation from '../../../../Animations/LoadingAnimation';
import { RecommendationCountChips } from '../Recommendations/Common/RecommendationCountChips';
import { RecommendationSection } from '../Recommendations/Common/RecommendationSection';
import ArchiveRecommendationActions from './ArchiveRecommendationActions';

export interface IProps {
  filters: IFetchRecommendationFilters;
}

export default function ArchiveRecommendations({
  filters,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { isReportArchive, selectedSample } = useMTBArchive();
  const { slide: activeSlide } = useActiveSlide();

  const [recommendations, setRecommendations] = useState<IFetchRecommendation[]>([]);
  const [allMolAlterations, setAllMolAlterations] = useState<IMolecularAlterationDetail[]>();
  const [loading, setLoading] = useState<boolean>(false);

  const getActions = useCallback((r: IFetchRecommendation) => (
    <ArchiveRecommendationActions
      alterations={allMolAlterations || activeSlide?.alterations || []}
      recommendation={r}
    />
  ), [activeSlide?.alterations, allMolAlterations]);

  const getRecPriority = useCallback((recommendation: IFetchRecommendation) => {
    switch (recommendation.type) {
      case 'GROUP':
        return 1;
      case 'THERAPY':
        return 2;
      case 'CHANGE_DIAGNOSIS':
        return 3;
      case 'GERMLINE':
        return 4;
      case 'TEXT':
        return 5;
      default:
        return 6;
    }
  }, []);

  useEffect(() => {
    async function getRecommendations(): Promise<void> {
      if (selectedSample?.clinicalVersionId) {
        try {
          setLoading(true);
          const resp = await zeroDashSdk.mtb.recommendation.getAllRecommendations(
            selectedSample.clinicalVersionId,
            filters,
          );
          setRecommendations(resp.sort((a, b) => getRecPriority(a) - getRecPriority(b)));
        } catch (err) {
          setRecommendations([]);
        } finally {
          setLoading(false);
        }
      }
    }
    getRecommendations();
  }, [
    selectedSample?.clinicalVersionId,
    zeroDashSdk.mtb.recommendation,
    filters,
    getRecPriority,
  ]);

  useEffect(() => {
    if (selectedSample && isReportArchive) {
      zeroDashSdk.mtb.molAlteration.getMolAlterations(
        selectedSample.clinicalVersionId,
        {},
      )
        .then((resp) => setAllMolAlterations(resp));
    }
  }, [isReportArchive, selectedSample, zeroDashSdk.mtb.molAlteration]);

  return (
    <>
      {loading && (
        <Box paddingTop="20%">
          <LoadingAnimation />
        </Box>
      )}
      {recommendations.map((r) => (
        // setting this to hidden when loading as rerendering it as we usually do
        // causes issues for adding a recommendation to a new slide.
        (<Box
          key={r.id}
          visibility={loading ? 'hidden' : 'visible'}
        >
          <RecommendationSection
            recommendation={r}
            actions={!isReportArchive ? getActions(r) : undefined}
            isArchive
            chips={<RecommendationCountChips recs={[r]} />}
          />
        </Box>)
      ))}
    </>
  );
}
