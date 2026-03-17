import { HttpService } from '@nestjs/axios';
import { reportOptions } from 'Constants/Reports/Reports.constants';
import dayjs from 'dayjs';
import knex from 'knex';
import { NotificationsService } from 'Services/Notifications/Notifications.service';
import { UserService } from 'Services/User/User.service';
import { CacheService } from 'Services/Cache/Cache.service';
import { knexConnectionConfig } from '../../../knexfile';
import getBearerToken from '../Functions/getBearerToken';

async function sendNotificationReminders(): Promise<void> {
  const zdKnex = knex(knexConnectionConfig);

  const pendingApprovals = await zdKnex
    .select({
      id: 'approval.id',
      sampleId: 'report.sample_id',
      type: 'report.type',
      assigneeId: 'approval.assignee_id',
      notifiedAt: 'approval.notified_at',
    })
    .from({ approval: 'zcc_approvals' })
    .innerJoin({ report: 'zcc_reports' }, 'approval.report_id', 'report.id')
    .where('approval.status', 'pending')
    .andWhere('report.status', 'pending')
    .andWhere('approval.notified_at', '<', zdKnex.raw('NOW() - INTERVAL 1 WEEK'));

  const assigneeIds = new Set(pendingApprovals.map((a) => a.assigneeId));
  await Promise.all(
    Array.from(assigneeIds).map((assigneeId) => {
      if (assigneeId) {
        const assigneeApprovals = pendingApprovals.filter((a) => a.assigneeId === assigneeId);
        return getBearerToken()
          .then(async (tokenResp) => {
            const userService = new UserService(new HttpService(), new CacheService());
            const userResp = await userService.getCurrentUser(tokenResp.access_token);
            const notificationService = new NotificationsService(new HttpService());
            return notificationService.sendNotification(
              { authorization: `Bearer ${tokenResp.access_token}` },
              userResp,
              {
                type: 'REPORT_REMINDER',
                title: 'You have reports pending your approval',
                description: assigneeApprovals.map((a) => (
                  `${a.sampleId}: ${reportOptions.find((o) => o.value === a.type)?.name} approval pending since ${dayjs(a.notifiedAt).format('DD/MM/YYYY')}.`
                ))
                  .join('\n'),
                notifyUserIds: [assigneeId],
                modes: ['EMAIL'],
                emailTemplate: 'ZERO_DASH',
              },
            );
          });
      }

      return undefined;
    }),
  );

  process.exit(0);
}

sendNotificationReminders();
