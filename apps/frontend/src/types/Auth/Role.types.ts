export const mappedRoles = [
  'ZeroDash Admin',
  'ZeroDash Curator',
  'ZeroDash Clinician',
  'ZeroDash Viewer',
  'ZeroDash MTB Chair',
  'ZeroDash DAC',
  'ZeroDash PDTC',
] as const;
export type MappedRole = typeof mappedRoles[number];

export const pseudoRoles = [
  'ZeroDash Assigned Curator',
  'ZeroDash Assigned Clinician',
] as const;
export type PseudoRole = typeof pseudoRoles[number];

export const zerodashRoles = [
  ...mappedRoles,
  ...pseudoRoles,
] as const;
export type Role = typeof zerodashRoles[number];
