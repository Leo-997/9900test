import { ISortMenuOption } from '@/types/misc.types';

export const therapiesSortMenuOptions: ISortMenuOption<string>[] = [
  {
    name: 'Created At: Newest to oldest',
    value: 'Original Created At:desc',
  },
  {
    name: 'Created At: Oldest to newest',
    value: 'Original Created At:asc',
  },
];
