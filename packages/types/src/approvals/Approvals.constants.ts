// IMPORTANT: The sorting of these statuses here is important for the query
// For getting all reports.
export const approvalStatuses = [
  'pending',
  'approved',
  'cancelled',
  'rejected',
] as const;

export const approvalLabels = [
  'Reported by',
  'Authorised by',
] as const;
