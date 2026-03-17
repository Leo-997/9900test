export const zeroDashReportTypes = [
  'REPORT_ASSIGNED',
  'REPORT_APPROVED',
  'REPORT_REMINDER',
] as const;

export const notificationTypes = [
  ...zeroDashReportTypes,
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
