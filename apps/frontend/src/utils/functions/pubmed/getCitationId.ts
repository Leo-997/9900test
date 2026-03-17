import { CitationSource } from '@/types/Evidence/Citations.types';

export const getCitationId = (
  source: CitationSource,
  pubMedId: string | undefined,
): string => {
  let id = '';

  if (source === 'PUBMED' || source === 'PMC') {
    if (pubMedId) {
      id = `, ${source === 'PUBMED' ? 'PMID' : 'PMCID'}: ${pubMedId}`;
    }
  }

  return id;
};
