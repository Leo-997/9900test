import {
    emailTemplates,
    notificationModes,
    notificationTypes,
    slackTemplates,
} from 'Constants/Notifications/Notifications.constant';

export type NotificationType = typeof notificationTypes[number];
export type NotificationMode = typeof notificationModes[number];
export type SlackTemplate = typeof slackTemplates[number];
export type EmailTemplate = typeof emailTemplates[number];

export interface IZeroDashReportMeta {
  analysisSetId: string;
  patientId: string;
  reportId: string;
}

export interface IZeroDashFlagMeta {
  assignedResolverId: string;
  reason: string;
}

export interface INotificationBody {
  type: NotificationType;
  applicationId: string;
  title: string;
  description?: string;
  entityMetadata?: IZeroDashReportMeta;
  notifyUserIds: string[];
  modes: NotificationMode[];
  emailTemplate?: EmailTemplate;
  slackChannel?: string;
  slackTemplate?: SlackTemplate;
}
