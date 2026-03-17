import { ISortMenuOption } from '../types/misc.types';

export const PUBMED_BASE_URL = 'https://pubmed.ncbi.nlm.nih.gov';

export const evidenceSortMenuOptions: ISortMenuOption<string>[] = [
  {
    name: 'Upload date: Newest to oldest',
    value: 'Upload date:desc',
  },
  {
    name: 'Upload date: Oldest to newest',
    value: 'Upload date:asc',
  },
  {
    name: 'Publication date: Newest to oldest',
    value: 'Publication date:desc',
  },
  {
    name: 'Publication date: Oldest to newest',
    value: 'Publication date:asc',
  },
];
