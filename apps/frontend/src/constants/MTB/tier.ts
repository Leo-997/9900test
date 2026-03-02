import { TierType } from '../../types/MTB/Recommendation.types';

export const defaultTier: TierType = {
  level: undefined,
  class: {
    m: false,
    i: false,
    p: false,
  },
  noTier: false,
};
