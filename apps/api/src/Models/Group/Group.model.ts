export const userGroups = [
  'Admins',
  'Curators',
  'Clinicians',
  'Superusers',
  'Viewers',
  'DACs',
  'MTBChairs',
  'PDTCUsers',

  // Meta groups
  'MolecularOncologists',
  'CancerGeneticists',
  'ClinicalFellows',
] as const;
export type Group = typeof userGroups[number];
