import { ITherapyDrug } from '@/types/Drugs/Drugs.types';
import { IFetchRecommendation } from '@/types/MTB/Recommendation.types';

export type OptionType = 1 | 2 | 3 | 4;

export function isTargetedDrug(drug: ITherapyDrug): boolean {
  return !drug.class.name.includes('chemo only rec') && drug.class.name !== 'Unguided';
}

export function getOptionType(option: IFetchRecommendation): OptionType {
  const drugs = option.therapy?.drugs ?? [];
  const hasChemoOrRadioTherapy = Boolean(
    option.therapy?.chemotherapy || option.therapy?.radiotherapy,
  );

  if (!hasChemoOrRadioTherapy && drugs.length === 1 && isTargetedDrug(drugs[0])) {
    return 1; // Targeted monotherapy
  }
  if (
    drugs.filter(isTargetedDrug).length === 1
    && (hasChemoOrRadioTherapy || drugs.some((d) => d.class.name.includes('chemo only rec')))
  ) {
    return 2; // Combination: Single targeted + non-targeted
  }
  if (drugs.filter(isTargetedDrug).length >= 1) {
    return 3; // 1 or more targeted agents +/- non-targeted
  }
  return 4; // none of the above 3
}

export function getRecommendationKey(option: IFetchRecommendation): string {
  const optionType = getOptionType(option);
  const drugs = option.therapy?.drugs ?? [];
  const normalizedClassNames = drugs.map((drug) => {
    const className = drug.class.name;
    if (className.includes('chemo only rec') || className === 'Unguided') {
      return 'chemo-unguided';
    }
    return className;
  }).sort();

  const drugClassKey = normalizedClassNames.length > 0 ? normalizedClassNames.join('|') : 'no-class';
  return `${optionType}:${drugClassKey}`;
}

export const typeLabel: string[] = [
  'Targeted monotherapy',
  'Combination: Single targeted + non-targeted (chemotherapy or other)',
  'Combination: 1 or more targeted agents +/- non-targeted (chemotherapy or other) [second targeted agent: guided or unguided]',
  'Other (e.g. non-targeted, germline, change of diagnosis, text)',
];
