import { ISortMenuOption } from '../../types/misc.types';

export const leftPanelSortMenuOptions: ISortMenuOption<string>[] = [
  {
    name: 'Earliest meeting date',
    value: 'MTB Meeting:asc',
  },
  {
    name: 'Latest meeting date',
    value: 'MTB Meeting:desc',
  },
];
