export const userRoles = [
  'ZeroDash Admin',
  'ZeroDash Curator',
  'ZeroDash Clinician',
  'ZeroDash Viewer',
  'ZeroDash MTB Chair',
  'ZeroDash DAC',
  'ZeroDash PDTC',
] as const;

export type Role = typeof userRoles[number];
