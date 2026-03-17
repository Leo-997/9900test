import { AxiosInstance } from 'axios';
import { IDrugsClient, createDrugsClient } from './Drugs';
import { createEvidenceClient, IEvidenceClient } from './Evidence';
import { IReportsClient, createReportsClient } from './Reports/reports';
import { IAuthClient, createAuthClient } from './Auth';
import { createNotificationsClient, INotificationsClient } from './Notifications';

export interface IServicesSdk {
  drugs: IDrugsClient;
  evidence: IEvidenceClient;
  reports: IReportsClient;
  auth: IAuthClient;
  notifications: INotificationsClient;
}

export function createServicesSdk(
  instance: AxiosInstance,
  authInstance: AxiosInstance,
  notificationsInstance: AxiosInstance,
): IServicesSdk {
  return {
    drugs: createDrugsClient(instance),
    evidence: createEvidenceClient(instance),
    reports: createReportsClient(instance),
    auth: createAuthClient(authInstance),
    notifications: createNotificationsClient(notificationsInstance),
  };
}
