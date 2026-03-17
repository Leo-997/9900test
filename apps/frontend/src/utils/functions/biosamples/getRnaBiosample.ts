import { IBiosample } from '@/types/Analysis/Biosamples.types';

export function getRnaBiosample(biosamples: IBiosample[]): IBiosample | undefined {
  const rna = biosamples.find(
    (biosample) => (
      biosample.sampleType === 'rnaseq'
      && biosample.biosampleType === 'rna'
    ),
  );

  const panelRNA = biosamples.find(
    (biosample) => (
      biosample.sampleType === 'panel'
      && biosample.biosampleType === 'rna'
    ),
  );

  return rna || panelRNA;
}
