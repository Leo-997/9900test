import { INotification, INotificationBody, INotificationQuery } from '@/types/Notifications/Notifications.types';
import { AxiosInstance } from 'axios';

export interface INotificationsClient {
  getNotifications(
    filters: INotificationQuery,
    page?: number,
    limit?: number,
  ): Promise<INotification[]>;
  getNotificationCount(
    filters: INotificationQuery,
  ): Promise<number>;
  createNotifications(body: Omit<INotificationBody, 'applicationId'>): Promise<void>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markNotificationAsUnread(notificationId: string): Promise<void>;
  markAllNotificationAsRead(applicationId: string): Promise<void>;
}

export function createNotificationsClient(instance: AxiosInstance): INotificationsClient {
  const zeroDashAppId = import.meta.env.VITE_ZERO_DASH_APP_ID;

  async function getNotifications(
    filters: INotificationQuery,
    page?: number,
    limit?: number,
  ): Promise<INotification[]> {
    const resp = await instance.get<INotification[]>(
      '/notifications',
      {
        params: {
          ...filters,
          page,
          limit,
        },
      },
    );

    return resp.data;
  }

  async function getNotificationCount(
    filters: INotificationQuery,
  ): Promise<number> {
    const resp = await instance.get<number>(
      '/notifications/count',
      {
        params: {
          ...filters,
        },
      },
    );

    return resp.data;
  }

  async function createNotifications(
    body: Omit<INotificationBody, 'applicationId'>,
  ): Promise<void> {
    await instance.post('/notifications', {
      ...body,
      applicationId: zeroDashAppId,
    });
  }

  async function markNotificationAsRead(notificationId: string): Promise<void> {
    await instance.patch(`/notifications/${notificationId}/read`);
  }

  async function markNotificationAsUnread(notificationId: string): Promise<void> {
    await instance.patch(`/notifications/${notificationId}/unread`);
  }

  async function markAllNotificationAsRead(
    applicationId: string,
  ): Promise<void> {
    await instance.patch(`/notifications/${applicationId}/read-all`);
  }

  return {
    getNotifications,
    getNotificationCount,
    createNotifications,
    markNotificationAsRead,
    markNotificationAsUnread,
    markAllNotificationAsRead,
  };
}
