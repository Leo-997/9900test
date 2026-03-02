import {
  emailTemplates,
  notificationModes,
  notificationTypes,
  slackTemplates,
} from '@/constants/Common/notifications';

export type NotificationType = typeof notificationTypes[number];
export type NotificationMode = typeof notificationModes[number];
export type SlackTemplate = typeof slackTemplates[number];
export type EmailTemplate = typeof emailTemplates[number];

export interface IZeroDashCommonMeta {
  analysisSetId: string;
  patientId: string;
}

export interface IZeroDashClinicalMeta extends IZeroDashCommonMeta {
  clinicalVersionId: string;
}

export interface IZeroDashReportMeta extends IZeroDashCommonMeta {
  reportId: string;
}

export interface IZeroDashFlagMeta extends IZeroDashCommonMeta {
  assignedResolverId: string;
  reason: string;
}

export interface INotificationType {
  id: string;
  applicationId: string;
  type: NotificationType;
  name: string;
  description: string;
}

export interface INotification<
  T = IZeroDashCommonMeta
  | IZeroDashClinicalMeta
  | IZeroDashFlagMeta
  | IZeroDashReportMeta
> {
  id: string;
  type: NotificationType;
  applicationId: string;
  mode: NotificationMode;
  title: string;
  description: string;
  entityMetadata: T;
  notifyUserId: string;
  readAt: string;
  createdAt: string;
  createdBy: string;
}

export interface INotificationBody {
  type: NotificationType;
  applicationId: string;
  title: string;
  description?: string;
  entityMetadata:
    | IZeroDashCommonMeta
    | IZeroDashClinicalMeta
    | IZeroDashFlagMeta
    | IZeroDashReportMeta;
  notifyUserIds?: string[];
  modes: NotificationMode[];
  emailTemplate?: EmailTemplate;
  slackChannel?: string;
  slackTemplate?: SlackTemplate;
}

export interface INotificationQuery {
  applicationId?: string;
  typeId?: string;
  read?: boolean;
}
