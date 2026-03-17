import { TierType } from '../../types/MTB/Recommendation.types';

const getTierString = (tier: TierType): string | undefined => {
  if (tier.noTier) return 'No tier';

  if (!tier.level && Object.values(tier.class).every((v) => !v)) return undefined;

  let classesStr = '';
  for (const [key, val] of Object.entries(tier.class)) {
    if (val) classesStr += key.toUpperCase();
  }

  return (tier.level || '') + classesStr.split('').join('/');
};

export default getTierString;
