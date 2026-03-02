import { IQuickFilter } from '@/types/Common.types';
import { ISVGermlineSearchOptions, ISVSearchOptions } from '@/types/Search.types';
import { Dispatch, SetStateAction } from 'react';

export function getRNAConfidenceQuickFilter<T extends ISVSearchOptions | ISVGermlineSearchOptions>(
  svFilters: T,
  setSvFilters: Dispatch<SetStateAction<T>>,
): IQuickFilter<T> {
  const isSelected = svFilters.rnaConfidence.some((r) => r === 'High');

  return {
    label: 'RNA high confidence',
    onClick: () => setSvFilters((prev) => ({
      ...prev,
      rnaConfidence: [
        ...prev.rnaConfidence.filter((r) => r !== 'High'),
        ...(isSelected ? [] : ['High']),
      ],
    })),
    checkIsActive: () => isSelected,
  };
}
