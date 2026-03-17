import { IQuickFilter } from '@/types/Common.types';
import { ISVGermlineSearchOptions, ISVSearchOptions } from '@/types/Search.types';
import { Dispatch, SetStateAction } from 'react';

export function getInframeFusionQFilter<T extends ISVSearchOptions | ISVGermlineSearchOptions>(
  svFilters: T,
  setSvFilters: Dispatch<SetStateAction<T>>,
): IQuickFilter<T> {
  const inframeValue = ['W', 'WR', 'R', 'RP'];
  const isInframeValueSelected = inframeValue.every(
    (item) => svFilters.inframe.some((filter) => filter === item),
  );

  return {
    label: 'Inframe fusion',
    onClick: () => setSvFilters((prev) => ({
      ...prev,
      inframe: [
        ...prev.inframe.filter((i) => !inframeValue.includes(i)),
        ...(isInframeValueSelected ? [] : inframeValue),
      ],
    })),
    checkIsActive: () => isInframeValueSelected,
  };
}
