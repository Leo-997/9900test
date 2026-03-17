import { ISortMenuOption } from '../../types/misc.types';

export const rnaSortMenuOptions: ISortMenuOption<string>[] = [
  {
    name: 'TPM: Ascending',
    value: 'TPM:asc',
  },
  {
    name: 'TPM: Descending',
    value: 'TPM:desc',
  },
  {
    name: 'Mean Z-Score: Ascending',
    value: 'Mean Z-Score:asc',
  },
  {
    name: 'Mean Z-Score: Descending',
    value: 'Mean Z-Score:desc',
  },
  {
    name: 'Chromosome: Ascending',
    value: 'Chromosome:asc',
  },
  {
    name: 'Chromosome: Descending',
    value: 'Chromosome:desc',
  },
];
