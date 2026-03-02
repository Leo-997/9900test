import { defaultTier } from '../../constants/MTB/tier';
import { TierType } from '../../types/MTB/Recommendation.types';

export default function getTierFromString(tier?: string): TierType {
  if (tier) {
    if (tier === 'No tier') {
      return {
        ...defaultTier,
        noTier: true,
      };
    }

    const level = tier.match(/^[0-9]/);
    return {
      level: level ? level[0] : undefined,
      class: {
        m: tier.includes('M') || false,
        i: tier.includes('I') || false,
        p: tier.includes('P') || false,
      },
      noTier: false,
    };
  }

  return defaultTier;
}
