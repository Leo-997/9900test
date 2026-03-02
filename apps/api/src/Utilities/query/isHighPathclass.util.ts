import { Pathclass } from 'Models/Curation/Misc.model';

export default function isHighPathclass(
  pathclass: Pathclass,
): boolean {
  return [
    'C5: Pathogenic',
    'C4: Likely Pathogenic',
    'C3.8: VOUS',
    'GUS',
  ].includes(pathclass);
}
