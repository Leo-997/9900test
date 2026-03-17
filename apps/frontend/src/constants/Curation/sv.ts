import { ISortMenuOption } from '../../types/misc.types';

export const svSortMenuOptions: ISortMenuOption<string>[] = [
  {
    name: 'Start Gene: A to Z',
    value: 'Start Gene:asc;End Gene:asc',
  },
  {
    name: 'Start Gene: Z to A',
    value: 'Start Gene:desc;End Gene:desc',
  },
  {
    name: 'Break Point 1: Ascending',
    value: 'Break Point 1:asc;Break Point 1 Position:asc',
  },
  {
    name: 'Break Point 1: Descending',
    value: 'Break Point 1:desc;Break Point 1 Position:desc',
  },
  {
    name: 'Helium Score: Ascending',
    value: 'Helium Score:asc',
  },
  {
    name: 'Helium Score: Descending',
    value: 'Helium Score:desc',
  },
];
