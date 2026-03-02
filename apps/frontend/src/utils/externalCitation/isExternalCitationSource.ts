import { externalCitationSources } from '@/constants/Common/evidence';
import { CitationSource, ExternalCitationSource } from '@/types/Evidence/Citations.types';

export function isExternalCitationSource(
  source: CitationSource,
): source is ExternalCitationSource {
  return externalCitationSources.includes(source as ExternalCitationSource);
}
