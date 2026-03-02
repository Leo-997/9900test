import { IBiosample } from '@/types/Analysis/Biosamples.types';

export function getGermlineBiosample(biosamples: IBiosample[]): IBiosample | undefined {
  const wgsNormal = biosamples.find(
    (biosample) => (
      biosample.sampleType === 'wgs'
      && biosample.biosampleStatus === 'normal'
      && biosample.biosampleType === 'dna'
    ),
  );
  const panelNormal = biosamples.find(
    (biosample) => (
      biosample.sampleType === 'panel'
      && biosample.biosampleStatus === 'normal'
      && biosample.biosampleType === 'dna'
    ),
  );

  return wgsNormal || panelNormal;
}
