import { Inject, Injectable } from '@nestjs/common';
import {
  Approval, CreateApprovalsBodyDTO, GetApprovalsQueryDTO, UpdateApprovalDTO,
} from '@zero-dash/types';
import { Knex } from 'knex';
import { IUser, IUserWithMetadata } from 'Models/User/User.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withReports } from 'Utils/Query/accessControl/withReports';
import { v4 } from 'uuid';

@Injectable()
export class ApprovalsClient {
  private readonly approvalsTable = 'zcc_approvals';

  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) {}

  public async getApprovals(
    query: GetApprovalsQueryDTO,
    user: IUserWithMetadata,
  ): Promise<Approval[]> {
    const qb = this.baseApprovalSelect(user)
      .modify(this.withFilters, query)
      .orderBy('approval.created_at', 'desc');

    return qb;
  }

  public async createApprovals(
    approvals: CreateApprovalsBodyDTO,
    user: IUser,
  ): Promise<number> {
    return this.knex
      .insert(approvals.approvals.map((approval) => {
        const id = v4();
        return {
          id,
          report_id: approvals.reportId,
          status: approval.status,
          group_id: approval.groupId,
          label: approval.label || null,
          show_on_report: approval.showOnReport,
          assignee_id: approval.assigneeId || null,
          approved_by: approval.approvedBy || null,
          approved_at: approval.approvedAt ? new Date(approval.approvedAt) : null,
          created_by: user.id,
          updated_by: user.id,
        };
      }))
      .into(this.approvalsTable)
      .then((result) => result.length);
  }

  public async updateApproval(
    id: string,
    body: UpdateApprovalDTO,
    user: IUser,
  ): Promise<number> {
    return this.knex
      .where('id', id)
      .update({
        status: body.status,
        show_on_report: body.showOnReport,
        assignee_id: body.assigneeId,
        approved_by: body.status === 'approved' ? user.id : undefined,
        approved_at: body.status === 'approved' ? new Date() : undefined,
        updated_by: user.id,
        updated_at: new Date(),
        notified_at: new Date(body.notifiedAt),
      })
      .from(this.approvalsTable);
  }

  private baseApprovalSelect(user: IUserWithMetadata): Knex.QueryBuilder {
    return this.knex.select({
      id: 'approval.id',
      reportId: 'approval.report_id',
      status: 'approval.status',
      groupId: 'approval.group_id',
      label: 'approval.label',
      showOnReport: 'approval.show_on_report',
      assigneeId: 'approval.assignee_id',
      approvedBy: 'approval.approved_by',
      approvedAt: 'approval.approved_at',
      createdAt: 'approval.created_at',
      createdBy: 'approval.created_by',
      updatedAt: 'approval.updated_at',
      updatedBy: 'approval.updated_at',
      notifiedAt: 'approval.notified_at',
    })
      .from({ approval: this.approvalsTable })
      .modify(
        withReports,
        'innerJoin',
        user,
        'approval.report_id',
      );
  }

  private withFilters(
    qb: Knex.QueryBuilder,
    filters: GetApprovalsQueryDTO,
  ): void {
    qb.where(function filterFunction() {
      if (filters.id) {
        this.where('approval.id', filters.id);
      }

      if (filters.reportId) {
        this.andWhere('approval.report_id', filters.reportId);
      }

      if (filters.status) {
        this.andWhere('approval.status', filters.status);
      }

      if (filters.groupId) {
        this.andWhere('approval.group_id', filters.groupId);
      }

      if (filters.label) {
        this.andWhere('approval.label', filters.label);
      }

      if (filters.showOnReport) {
        this.andWhere('approval.show_on_report', filters.showOnReport);
      }

      if (filters.assigneeId) {
        this.andWhere('approval.assignee_id', filters.assigneeId);
      }

      if (filters.approvedBy) {
        this.andWhere('approval.approved_by', filters.approvedBy);
      }

      if (filters.approvedAt) {
        this.andWhere('approval.approved_at', filters.approvedAt);
      }
    });
  }
}
