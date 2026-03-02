export const zeroDashCurationTypes = [
  'CURATION_READY',
  'CURATION_ASSIGNED',
  'CURATION_REVIEW',
] as const;

export const zeroDashFlagTypes = [
  'FLAG_CREATED',
  'FLAG_RESOLVED',
] as const;

export const notificationTypes = [
  ...zeroDashCurationTypes,
  ...zeroDashFlagTypes,
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
