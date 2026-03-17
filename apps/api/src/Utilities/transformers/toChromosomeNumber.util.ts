import { Chromosome } from 'Models/Curation/Misc.model';

export function toChromosomeNumber(chr: Chromosome): number {
  switch (chr.replace('chr', '')) {
    case 'X':
      return 23;
    case 'Y':
      return 24;
    case 'M':
      return 25;
    default:
      return parseInt(chr.replace('chr', ''), 10);
  }
}
