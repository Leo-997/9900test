import { IGeneList } from '@/types/Reports/GeneLists.types';

export const defaultEmptyList: IGeneList = {
  id: '',
  versionId: '',
  name: '',
  version: '',
  type: 'other',
  isHighRisk: false,
  isActive: false,
  archiveNotes: '',
  genes: [],
  titleAbbreviation: '',
  codeAbbreviation: '',
  geneCount: 0,
};
