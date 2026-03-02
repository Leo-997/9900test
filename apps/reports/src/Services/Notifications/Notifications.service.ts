import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import { INotificationBody } from 'Models/Notifications/Notifications.model';
import { IUser } from 'Models/User/User.model';
import { normalizeString } from 'Utils/string.util';

@Injectable()
export class NotificationsService {
  private readonly baseUrl = `${normalizeString(process.env.VITE_NOTIFICATIONS_URL)}/notifications`;

  private readonly zeroDashAppId = normalizeString(process.env.ZERO_DASH_APP_ID);

  constructor(
    private readonly httpService: HttpService,
  ) {}

  public async sendNotification(
    headers: IncomingHttpHeaders,
    currentUser: IUser,
    notification: Omit<INotificationBody, 'applicationId'>,
  ): Promise<void> {
    const filteredNotify = notification.notifyUserIds.filter((id) => id !== currentUser.id);
    if (filteredNotify.length) {
      try {
        await this.httpService.axiosRef.post<void>(
          this.baseUrl,
          {
            ...notification,
            applicationId: this.zeroDashAppId,
            notifyUserIds: filteredNotify,
          },
          {
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              Authorization: headers.authorization,
            },
          },
        );
      } catch (error) {
        console.log(JSON.stringify(error));
      }
    }
  }
}
