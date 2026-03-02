import { Box, Divider } from '@mui/material';
import StatusChip from '@/components/Chips/StatusChip';
import { corePalette } from '@/themes/colours';
import { useRecommendationCountingChipHelpers } from '@/hooks/useRecommendationHelpers';
import { IFetchRecommendation } from '@/types/MTB/Recommendation.types';

import type { JSX } from "react";

interface IProps {
  recs: IFetchRecommendation[];
  isTotalCount?: boolean;
  hideOptionChips?: boolean;
}

export function RecommendationCountChips({
  recs,
  isTotalCount = false,
  hideOptionChips = false,
}: IProps): JSX.Element {
  const allOptions = recs.flatMap((rec) => (rec.type === 'GROUP' ? (rec.recommendations ?? []) : [rec]));
  const {
    countRecommendationsAndOptions,
    getOptionTypeChip,
  } = useRecommendationCountingChipHelpers();
  const {
    type1Count,
    type2Count,
    type3Count,
    type4Count,
    totalRecommendations,
  } = countRecommendationsAndOptions(allOptions);

  const chips = [
    type1Count > 0 ? getOptionTypeChip(1, type1Count) : null,
    type2Count > 0 ? getOptionTypeChip(2, type2Count) : null,
    type3Count > 0 ? getOptionTypeChip(3, type3Count) : null,
    type4Count > 0 ? getOptionTypeChip(4, type4Count) : null,
  ].filter(Boolean);

  return (
    <Box display="flex" flexDirection="row" gap="8px" alignItems="center">
      <StatusChip
        status={`${totalRecommendations} Recommendation${totalRecommendations !== 1 ? 's' : ''}, 
        ${allOptions.length} Option${(allOptions.length) !== 1 ? 's' : ''}`}
        backgroundColor={isTotalCount ? corePalette.grey30 : corePalette.green10}
        color={isTotalCount ? corePalette.grey200 : corePalette.green300}
        size="small"
      />
      {!isTotalCount && !hideOptionChips && chips.length > 0 && (
        <>
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              borderColor: corePalette.grey50,
            }}
          />
          <Box display="flex" flexDirection="row" gap="4px">
            {chips}
          </Box>
        </>
      )}
    </Box>
  );
}
