export const zeroDashClinicalTypes = [
  'CLINICAL_ASSIGNED',
  'CLINICAL_REVIEW',
] as const;

export const notificationTypes = [
  ...zeroDashClinicalTypes,
] as const;

export const notificationModes = [
  'EMAIL',
  'SLACK_DM',
  'SLACK_CHANNEL',
  'INTERNAL',
] as const;

export const emailTemplates = [
  'ZERO_DASH',
] as const;

export const slackTemplates = [
  'ZERO_DASH_FLAG',
] as const;
