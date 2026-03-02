export const activeCurationStatuses = [
  'Sequencing',
  'In Pipeline',
  'Ready to Start',
  'In Progress',
] as const;

export const curationStatuses = [
  ...activeCurationStatuses,
  'Done',
  'Failed',
  'Withdrawn',
] as const;

export const failedStatusReasons = [
  'No Tumour',
  'Contaminated Germline',
  'No Donor',
] as const;
