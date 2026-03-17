import { ArchiveTabs } from '../../types/MTB/Archive.types';
import { ISelectOption } from '../../types/misc.types';

export const archiveTabs = [
  'SLIDES',
  'RECOMMENDATIONS',
  'SECTIONS',
] as const;

export const archiveTabOptions: ISelectOption<ArchiveTabs>[] = [
  {
    name: 'Slides',
    value: 'SLIDES',
  },
  {
    name: 'Recommendations',
    value: 'RECOMMENDATIONS',
  },
  {
    name: 'Germline Sections',
    value: 'SECTIONS',
  },
];
