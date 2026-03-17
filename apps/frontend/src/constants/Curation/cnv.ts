import { ISortMenuOption } from '../../types/misc.types';

export const cnvCnTypes = [
  'AMP',
  'GAIN',
  'DEL',
  'HOM_DEL',
  'NEU',
  'SEGMENTAL_DEL',
  'GERMLINE_HET_DELETION',
  'GERMLINE_HOM_DELETION',
] as const;

export const cnvSortMenuOptions: ISortMenuOption<string>[] = [
  {
    name: 'Min Copy Number (CN): High to Low',
    value: 'Min Copy Number (CN):desc',
  },
  {
    name: 'Min Copy Number (CN): Low to High',
    value: 'Min Copy Number (CN):asc',
  },
  {
    name: 'Max Copy Number (CN): High to Low',
    value: 'Max Copy Number (CN):desc',
  },
  {
    name: 'Max Copy Number (CN): Low to High',
    value: 'Max Copy Number (CN):asc',
  },
  {
    name: 'Gene: A - Z',
    value: 'Gene:asc',
  },
  {
    name: 'Gene: Z - A',
    value: 'Gene:desc',
  },
  {
    name: 'RNA Z-Score: High to Low',
    value: 'RNA Z-Score:desc',
  },
  {
    name: 'RNA Z-Score: Low to High',
    value: 'RNA Z-Score:asc',
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
