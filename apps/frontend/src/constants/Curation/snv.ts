import { ISortMenuOption } from '../../types/misc.types';

export const zygosity = [
  'Heterozygous',
  'Homozygous',
  'Hemizygous',
  'Compound heterozygous',
  'Subclonal',
  'Not determined',
  'Not present',
] as const;

export const snvSortMenuOptions: ISortMenuOption<string>[] = [
  {
    name: 'Helium Score: High to Low',
    value: 'Helium Score:desc',
  },
  {
    name: 'Helium Score: Low to High',
    value: 'Helium Score:asc',
  },
  {
    name: 'Chromosome: Ascending',
    value: 'Chromosome:asc;Gene Start:asc',
  },
  {
    name: 'Chromosome: Descending',
    value: 'Chromosome:desc;Gene Start:desc',
  },
  {
    name: 'VAF: Low to High',
    value: 'VAF:asc',
  },
  {
    name: 'VAF: High to Low',
    value: 'VAF:desc',
  },
  {
    name: 'Reads: Low to High',
    value: 'Reads:asc',
  },
  {
    name: 'Reads: High to Low',
    value: 'Reads:desc',
  },
];
