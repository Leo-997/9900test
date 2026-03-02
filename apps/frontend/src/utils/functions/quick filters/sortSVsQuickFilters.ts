import { IQuickFilter } from '@/types/Common.types';
import { ISVGermlineSearchOptions, ISVSearchOptions } from '@/types/Search.types';

export const sortSVsQuickFilters = <T extends ISVSearchOptions | ISVGermlineSearchOptions>(
  a: IQuickFilter<T>,
  b: IQuickFilter<T>,
): number => {
  const calculateOrder = (item: IQuickFilter<T>): number => {
    if (item.label === 'Panel') return 0;
    if (item.label === 'High risk') return 1;
    if (item.label === 'Inframe fusion') return 2;
    return 3;
  };

  return calculateOrder(a) - calculateOrder(b);
};
