import CustomButton from '@/components/Common/Button';
import CustomTypography from '@/components/Common/Typography';
import ReportRecommendationButton from '@/components/MTB/CommonButtons/ReportRecommendationButton';
import { useRecommendationCountingChipHelpers } from '@/hooks/useRecommendationHelpers';
import { corePalette } from '@/themes/colours';
import { Box } from '@mui/material';
import { MinusIcon } from 'lucide-react';
import { ReactNode, useCallback, type JSX } from 'react';
import { useClinical } from '../../../../../../contexts/ClinicalContext';
import { useGroupRecommendation } from '../../../../../../contexts/GroupRecommendationContext';
import { useZeroDashSdk } from '../../../../../../contexts/ZeroDashSdkContext';
import { IFetchRecommendation } from '../../../../../../types/MTB/Recommendation.types';
import TabContentWrapper from '../../../../../PreCurationTabs/TabContentWrapper';
import { CustomAddButton } from '../../../../CommonButtons/CustomAddButton';
import { RecommendationSection } from '../Common/RecommendationSection';
import { getOptionType, getRecommendationKey } from '../Common/recommendationUtils';

export default function RecommendationRightPanel(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { clinicalVersion } = useClinical();
  const { getOptionTypeChip } = useRecommendationCountingChipHelpers();
  const {
    entity,
    selectedSlideRecs,
    setSelectedSlideRecs,
    setNewReportRecs,
    newReportRecs,
    reportRecs,
    setReportRecs,
  } = useGroupRecommendation();

  const fetchSlideRecs = useCallback(async (page: number, limit: number) => {
    try {
      const recs = await zeroDashSdk.mtb.recommendation.getAllRecommendations(
        clinicalVersion.id,
        {
          types: ['THERAPY', 'CHANGE_DIAGNOSIS', 'GERMLINE', 'TEXT'],
          entityType: 'SLIDE',
        },
        page,
        limit,
      );
      return recs.sort((a, b) => getRecommendationKey(a).localeCompare(getRecommendationKey(b)));
    } catch (err) {
      return [];
    }
  }, [zeroDashSdk.mtb.recommendation, clinicalVersion.id]);

  const newReportRecsMapping = useCallback((
    item: IFetchRecommendation,
  ): ReactNode => (
    <Box
      key={item.id}
      padding="8px 0"
    >
      <RecommendationSection
        recommendation={item}
        actions={(
          <Box display="flex" gap="16px">
            <CustomButton
              variant="outline"
              label="Remove"
              startIcon={<MinusIcon />}
              size="small"
              onClick={():void => setNewReportRecs((prev) => prev.filter((r) => r.id !== item.id))}
            />
            <ReportRecommendationButton
              existingRec={item}
              handleSubmit={(newRec): void => setNewReportRecs(
                (prev) => prev.map((r) => (r.id === item.id ? newRec : r)),
              )}
            />
          </Box>
          )}
        isChildRec
        chips={getOptionTypeChip(getOptionType(item))}
      />
    </Box>
  ), [getOptionTypeChip, setNewReportRecs]);

  const reportRecsMapping = useCallback((
    item: IFetchRecommendation,
  ): ReactNode => (
    <Box
      key={item.id}
      padding="8px 0"
    >
      <RecommendationSection
        recommendation={item}
        actions={(
          <Box display="flex" gap="16px">
            <CustomButton
              variant="outline"
              label="Remove"
              startIcon={<MinusIcon />}
              size="small"
              onClick={():void => setReportRecs((prev) => prev.filter((r) => r.id !== item.id))}
            />
            <ReportRecommendationButton
              existingRec={item}
              handleSubmit={(newRec): void => setReportRecs(
                (prev) => prev.map((r) => (r.id === item.id ? newRec : r)),
              )}
            />
          </Box>
        )}
        isChildRec
        chips={getOptionTypeChip(getOptionType(item))}
      />
    </Box>
  ), [getOptionTypeChip, setReportRecs]);

  const slideRecsMapping = useCallback((
    item: IFetchRecommendation,
  ): ReactNode => (
    <Box
      key={item.id}
      padding="8px 0"
    >
      <RecommendationSection
        recommendation={item}
        actions={(
          <Box display="flex" gap="16px">
            {entity.entityType === 'SLIDE' && (
              <CustomAddButton
                isAdded={selectedSlideRecs.some((r) => r.id === item.id)}
                onAdd={(): void => setSelectedSlideRecs((prev) => [item, ...prev])}
                onRemove={():void => setSelectedSlideRecs(
                  (prev) => prev.filter((r) => r.id !== item.id),
                )}
              />
            )}
            {entity.entityType === 'REPORT' && (
              <ReportRecommendationButton
                existingRec={item}
                handleSubmit={(newRec): void => setNewReportRecs((prev) => [newRec, ...prev])}
              />
            )}
          </Box>
        )}
        isChildRec
        chips={getOptionTypeChip(getOptionType(item))}
      />
    </Box>
  ), [
    getOptionTypeChip,
    entity.entityType,
    selectedSlideRecs,
    setNewReportRecs,
    setSelectedSlideRecs,
  ]);

  const beforeMappingContent = (
    <Box
      display="flex"
      flexDirection="column"
      gap="16px"
      width="100%"
    >
      {entity.entityType === 'REPORT'
        && (newReportRecs.length + reportRecs.length + selectedSlideRecs.length) > 0
        && (
        <Box
          display="flex"
          flexDirection="column"
        >
          <CustomTypography
            variant="h5"
            fontWeight="medium"
            position="sticky"
            top={0}
            bgcolor={corePalette.white}
            zIndex={2}
            paddingBottom="8px"
          >
            Options added to group
          </CustomTypography>
          {[...newReportRecs, ...reportRecs]
            .sort((a, b) => getRecommendationKey(a).localeCompare(getRecommendationKey(b)))
            .map((r) => (r.id.startsWith('temp/') ? newReportRecsMapping(r) : reportRecsMapping(r)))}
        </Box>
        )}
      <CustomTypography
        variant="h5"
        fontWeight="medium"
      >
        {entity.entityType === 'REPORT' ? 'Recommendations from MTB slides' : 'Slide Recommendations'}
      </CustomTypography>
    </Box>
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      width="50%"
      height="100%"
      position="relative"
      borderRadius="16px 0px 0px 0px"
      padding="24px"
      bgcolor={corePalette.white}
    >
      <TabContentWrapper
        fetch={fetchSlideRecs}
        mapping={slideRecsMapping}
        beforeMappingContent={beforeMappingContent}
      />
    </Box>
  );
}
