import {
  BadRequestException, ForbiddenException, forwardRef, Inject, Injectable,
} from '@nestjs/common';
import { ApprovalsClient } from 'Clients/Approvals/Approvals.client';
import { reportOptions } from 'Constants/Reports/Reports.constants';
import { IncomingHttpHeaders } from 'http';
import { IUserWithMetadata } from 'Models/User/User.model';
import {
  Approval, CreateApprovalsBodyDTO, GetApprovalsQueryDTO, UpdateApprovalDTO,
} from '@zero-dash/types';
import { NotificationsService } from '../Notifications/Notifications.service';
import { ReportsService } from '../Reports/Reports.service';
import { UserService } from '../User/User.service';

@Injectable()
export class ApprovalsService {
  constructor(
    @Inject(ApprovalsClient) private readonly approvalsClient: ApprovalsClient,
    @Inject(forwardRef(() => ReportsService)) private readonly reportsService: ReportsService,
    @Inject(NotificationsService) private readonly notificationsService: NotificationsService,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  public async getApprovals(
    query: GetApprovalsQueryDTO,
    user: IUserWithMetadata,
  ): Promise<Approval[]> {
    return this.approvalsClient.getApprovals(
      query,
      user,
    );
  }

  public async getApprovalById(
    id: string,
    user: IUserWithMetadata,
  ): Promise<Approval> {
    const approvals = await this.approvalsClient.getApprovals(
      { id },
      user,
    );
    if (approvals.length > 0) {
      return approvals[0];
    }
    return null;
  }

  public async createApprovals(
    approvals: CreateApprovalsBodyDTO,
    user: IUserWithMetadata,
  ): Promise<void> {
    const report = await this.reportsService.getReportById(
      approvals.reportId,
      user,
      { checkWriteAccess: true },
    );
    if (!report) {
      throw new ForbiddenException();
    }
    try {
      await this.approvalsClient.createApprovals(
        approvals,
        user,
      );
    } catch {
      throw new BadRequestException('Could not create approvals, check your request body');
    }
  }

  public async updateApproval(
    id: string,
    body: UpdateApprovalDTO,
    user: IUserWithMetadata,
    headers: IncomingHttpHeaders,
  ): Promise<number> {
    const approval = await this.getApprovalById(id, user);
    if (!approval) {
      throw new BadRequestException('Approval not found or inaccessible');
    }
    const report = await this.reportsService.getReportById(
      approval.reportId,
      user,
      {
        checkWriteAccess: true,
        includeApprovals: true,
      },
    );

    if (!report) {
      throw new ForbiddenException();
    }

    const rowsUpdated = await this.approvalsClient.updateApproval(id, body, user);
    this.userService.getGroups(headers)
      .then(async (groups): Promise<void> => {
        if (body.status === 'approved' && body.sendNotifications) {
          const reportOption = reportOptions.find((r) => r.value === report.type);
          await this.notificationsService.sendNotification(headers, user, {
            type: 'REPORT_APPROVED',
            title: `${body.patientId}: ${reportOption?.name} approved`,
            description: `${reportOption?.name} for ${body.patientId} has been approved by ${user?.givenName} ${user?.familyName}`,
            entityMetadata: {
              analysisSetId: report.analysisSetId,
              patientId: body.patientId,
              reportId: approval.reportId,
            },
            notifyUserIds: report.approvals.filter((a) => {
              if (report.type === 'MOLECULAR_REPORT') {
                return a.groupId === groups.find((g) => g.name === 'Curators').id;
              }

              if (report.type === 'MTB_REPORT') {
                return a.groupId === groups.find((g) => g.name === 'ClinicalFellows').id;
              }

              return a.label === 'Reported by';
            })
              .map((a) => a.assigneeId),
            modes: report.type === 'MOLECULAR_REPORT' ? ['INTERNAL'] : ['EMAIL'],
            emailTemplate: 'ZERO_DASH',
          });
        }
      });

    return rowsUpdated;
  }
}
