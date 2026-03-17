import { IBiosample } from '@/types/Analysis/Biosamples.types';

export function getTumourBiosample(biosamples: IBiosample[]): IBiosample | undefined {
  const wgsTumour = biosamples.find(
    (biosample) => (
      biosample.sampleType === 'wgs'
      && biosample.biosampleStatus === 'tumour'
      && biosample.biosampleType === 'dna'
    ),
  );
  const panelTumour = biosamples.find(
    (biosample) => (
      biosample.sampleType === 'panel'
      && biosample.biosampleStatus === 'tumour'
      && biosample.biosampleType === 'dna'
    ),
  );

  return wgsTumour || panelTumour;
}
