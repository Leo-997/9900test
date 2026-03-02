import { IBiosample } from '@/types/Analysis/Biosamples.types';
import { getGermlineBiosample } from './getGermlineBiosample';
import { getHtsBiosamples } from './getHtsBiosamples';
import { getMethBiosample } from './getMethBiosample';
import { getRnaBiosample } from './getRnaBiosample';
import { getTumourBiosample } from './getTumourBiosample';

const getPrimaryBiosample = (biosamples: IBiosample[]): IBiosample | undefined => {
  const tumour = getTumourBiosample(biosamples);
  const normal = getGermlineBiosample(biosamples);
  const rna = getRnaBiosample(biosamples);
  const meth = getMethBiosample(biosamples);
  const hts = getHtsBiosamples(biosamples)[0];

  return tumour || normal || rna || meth || hts;
};

export default getPrimaryBiosample;
