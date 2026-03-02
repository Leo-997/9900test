import { ISortMenuOption } from '../../types/misc.types';

export const cnvGermlineSortMenuOptions: ISortMenuOption<string>[] = [
  {
    name: 'Copy Number (CN): High to Low',
    value: 'Copy Number (CN):desc',
  },
  {
    name: 'Copy Number (CN): Low to High',
    value: 'Copy Number (CN):asc',
  },
  {
    name: 'Chromosome: Ascending',
    value: 'Chromosome:asc;Gene Start:asc',
  },
  {
    name: 'Chromosome: Descending',
    value: 'Chromosome:desc;Gene Start:desc',
  },
];
