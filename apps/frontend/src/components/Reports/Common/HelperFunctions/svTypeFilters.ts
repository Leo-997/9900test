import { SVVariants } from '../../../../types/SV.types';

export const getFusionSVs = <T extends SVVariants>(svs: T[]): T[] => (
  svs.filter(
    (sv) => (
      sv.svType && sv.svType.toLowerCase() !== 'disruption'
      && (!sv.markDisrupted || (sv.markDisrupted && sv.markDisrupted === 'No'))
    ),
  )
);

export const getDisruptionSVs = <T extends SVVariants>(svs: T[]): T[] => (
  svs.filter((sv) => (
    sv.svType && (sv.svType.toLowerCase() === 'disruption'
    || (sv.markDisrupted && sv.markDisrupted !== 'No'))
  ))
);
