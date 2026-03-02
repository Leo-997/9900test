export const mappedGroups = [
  'Admins',
  'Curators',
  'Clinicians',
  'Viewers',
  'DACs',
  'MTBChairs',
  'PDTCUsers',
] as const;
export type MappedGroup = typeof mappedGroups[number];

export const metaGroups = [
  'MolecularOncologists',
  'CancerGeneticists',
  'ClinicalFellows',
] as const;
export type MetaGroup = typeof metaGroups[number];

export const groups = [
  ...mappedGroups,
  ...metaGroups,
] as const;
export type Group = typeof groups[number];
