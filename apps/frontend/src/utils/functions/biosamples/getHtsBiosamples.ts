import { IBiosample } from '@/types/Analysis/Biosamples.types';

export function getHtsBiosamples(biosamples: IBiosample[]): IBiosample[] {
  return biosamples.filter(
    (biosample) => biosample.sampleType === 'hts',
  );
}
