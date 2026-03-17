import { IBiosample } from '@/types/Analysis/Biosamples.types';

export function getMethBiosample(biosamples: IBiosample[]): IBiosample | undefined {
  return biosamples.find(
    (biosample) => biosample.sampleType === 'methylation',
  );
}
