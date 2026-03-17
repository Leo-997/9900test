import { useCallback, type JSX } from 'react';
import { corePalette } from '@/themes/colours';
import StatusChip from '@/components/Chips/StatusChip';
import {
  getOptionType, getRecommendationKey, OptionType, typeLabel,
} from '@/components/MTB/Views/Components/Recommendations/Common/recommendationUtils';
import { Tooltip } from '@mui/material';
import { IFetchRecommendation } from '../types/MTB/Recommendation.types';

interface IRecommendationCounts {
  type1Count: number;
  type2Count: number;
  type3Count: number;
  type4Count: number;
  totalRecommendations: number;
}

interface IRecommendationCountingChipHelpers {
  countRecommendationsAndOptions: (options: IFetchRecommendation[]) => IRecommendationCounts;
  getOptionTypeChip: (type: OptionType, count?: number) => JSX.Element;
}

export function useRecommendationCountingChipHelpers(): IRecommendationCountingChipHelpers {
  const countRecommendationsAndOptions = useCallback((
    options: IFetchRecommendation[],
  ): IRecommendationCounts => {
    const counts: IRecommendationCounts = {
      type1Count: 0,
      type2Count: 0,
      type3Count: 0,
      type4Count: 0,
      totalRecommendations: 0,
    };

    const uniqueRecommendationKeys = new Set<string>();

    for (const option of options) {
      const optionType = getOptionType(option);
      counts[`type${optionType}Count` as keyof IRecommendationCounts] += 1;

      const recommendationKey = getRecommendationKey(option);
      uniqueRecommendationKeys.add(recommendationKey);
    }
    counts.totalRecommendations = uniqueRecommendationKeys.size;
    return counts;
  }, []);

  const getOptionTypeChip = (type: OptionType, count?: number): JSX.Element => {
    const countStr = count ? `(${count}) ` : '';
    const optionTypeChips: Record<OptionType, JSX.Element> = {
      1: (
        <Tooltip title={count ? typeLabel[0] : ''} placement="top">
          <span>
            <StatusChip
              status={`${countStr}Type 1`}
              backgroundColor={corePalette.blue10}
              color={corePalette.blue300}
              size="small"
            />
          </span>
        </Tooltip>
      ),
      2: (
        <Tooltip title={count ? typeLabel[1] : ''} placement="top">
          <span>
            <StatusChip
              status={`${countStr}Type 2`}
              backgroundColor={corePalette.violet10}
              color={corePalette.violet300}
              size="small"
            />
          </span>
        </Tooltip>
      ),
      3: (
        <Tooltip title={count ? typeLabel[2] : ''} placement="top">
          <span>
            <StatusChip
              status={`${countStr}Type 3`}
              backgroundColor={corePalette.magenta10}
              color={corePalette.magenta300}
              size="small"
            />
          </span>
        </Tooltip>
      ),
      4: (
        <Tooltip title={count ? typeLabel[3] : ''} placement="top">
          <span>
            <StatusChip
              status={`${countStr}Type 4`}
              backgroundColor={corePalette.grey50}
              color={corePalette.offBlack100}
              size="small"
            />
          </span>
        </Tooltip>
      ),
    };
    return optionTypeChips[type];
  };

  return { countRecommendationsAndOptions, getOptionTypeChip };
}
