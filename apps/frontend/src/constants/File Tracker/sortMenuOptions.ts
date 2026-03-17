import { ISortMenuOption } from '../../types/misc.types';

export const fileTrackerSortMenuOptions: ISortMenuOption<string>[] = [
  {
    name: 'File Name: A to Z',
    value: 'File Name:asc',
  },
  {
    name: 'File Name: Z to A',
    value: 'File Name:desc',
  },
  {
    name: 'Type: A to Z',
    value: 'Type:asc',
  },
  {
    name: 'Type: Z to A',
    value: 'Type:desc',
  },
  {
    name: 'Size: Ascending',
    value: 'Size:asc',
  },
  {
    name: 'Size: Descending',
    value: 'Size:desc',
  },
];
