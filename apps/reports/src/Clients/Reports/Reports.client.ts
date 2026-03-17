import { Inject, Injectable } from '@nestjs/common';
import {
  ReportMetadata, ReportMetadataKey, Report, approvalStatuses,
  ReportSortColumns,
  ReportFiltersDTO,
  CreateReportsBodyDTO,
  UpdateReportsBodyDTO,
  UpdateReportMetadataKey,
} from '@zero-dash/types';
import { Knex } from 'knex';
import { IUser, IUserWithMetadata } from 'Models/User/User.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withReports } from 'Utils/Query/accessControl/withReports';
import { withPagination } from 'Utils/Query/pagination.util';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ReportsClient {
  private readonly reportsTable = 'zcc_reports';

  private readonly reportsMetadataTable = 'zcc_reports_metadata';

  private readonly approvalsTable = 'zcc_approvals';

  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) {}

  public async getReports(
    filters: ReportFiltersDTO,
    page: number,
    limit: number,
    currentUser: IUserWithMetadata,
  ): Promise<Report[]> {
    const assignedApprovalsSorted: string[] = await this.knex
      .select('report_id')
      .from(this.approvalsTable)
      .where('assignee_id', currentUser.id)
      .orderByRaw(
        // Converting the array into a list of bindings as like ?,?,?...
        // Then passing in the values as a second argument to prevent SQL injection
        `field(status, ${Array(approvalStatuses.length).fill('?').join(',')})`,
        approvalStatuses,
      )
      .pluck('report_id');

    const query = this.baseReportSelect(currentUser)
      .modify(this.withFilters, filters, this)
      .orderBy([
        ...(filters.sortColumns || []).map((c, i) => ({
          column: this.mapSortColumns(c),
          order: filters.sortDirections[i] || 'desc',
        })),
      ]);
    if (assignedApprovalsSorted.length) {
      query.orderByRaw(
        `field(id, ${Array(assignedApprovalsSorted.length).fill('?').join(',')}) desc`,
        assignedApprovalsSorted.reverse(),
      );
    }
    return query.orderBy([
      {
        column: 'reports.created_at',
        order: 'desc',
      },
    ])
      .modify(withPagination, page, limit);
  }

  public async getReportsCount(
    filters: ReportFiltersDTO,
    user: IUserWithMetadata,
  ): Promise<number> {
    const data = await this.baseReportSelect(user)
      .clearSelect()
      .count<Record<string, number>>('* as count')
      .modify(this.withFilters, filters, this)
      .first();

    return data ? data.count : 0;
  }

  public async getReportById(
    id: string,
    user: IUserWithMetadata,
    checkWriteAccess = false,
    trx?: Knex.Transaction,
  ): Promise<Report> {
    const query = this.baseReportSelect(
      user,
      checkWriteAccess,
      trx,
    );

    return query
      .where('reports.id', id)
      .first();
  }

  public async createReport(
    body: CreateReportsBodyDTO,
    currentUser: IUser,
    trx: Knex.Transaction,
  ): Promise<string> {
    const id = uuid();
    await trx.insert({
      id,
      analysis_set_id: body.analysisSetId,
      type: body.type,
      status: body.status,
      file_id: body.fileId,
      created_by: currentUser.id,
    })
      .into(this.reportsTable);

    return id;
  }

  public async updateReport(
    id: string,
    body: UpdateReportsBodyDTO,
    currentUser: IUser,
  ): Promise<void> {
    await this.knex.update({
      status: body.status,
      pseudo_status: body.pseudoStatus,
      approved_at: body.status === 'approved' ? new Date() : undefined,
      file_id: body.fileId,
      updated_by: currentUser.id,
      updated_at: this.knex.fn.now(),
    })
      .from(this.reportsTable)
      .where('id', id);
  }

  public async updateReportMetadata(
    reportId: string,
    body: UpdateReportMetadataKey[],
    user: IUserWithMetadata,
  ): Promise<void> {
    const report = await this.baseReportSelect(
      user,
    )
      .where('reports.id', reportId)
      .first();

    if (!report) {
      throw new Error('Report not found or inaccessible');
    }

    await this.knex.delete()
      .from(this.reportsMetadataTable)
      .where('report_id', reportId);

    if (body.length) {
      await this.knex.insert(
        body
          .map(({ key, value }) => ({
            report_id: reportId,
            key,
            value,
          })),
      )
        .into(this.reportsMetadataTable)
        .onConflict(['report_id', 'key'])
        .merge(['value']);
    }
  }

  public async getReportMetadata(reportId: string): Promise<ReportMetadata> {
    return this.knex
      .select({
        key: 'key',
        value: 'value',
      })
      .from(this.reportsMetadataTable)
      .where('report_id', reportId)
      .then((rows: Record<'key' | 'value', string>[]) => (
        rows.reduce((prev, current) => ({
          ...prev,
          [current.key as ReportMetadataKey]: current.value,
        }), {})
      ));
  }

  public getReportsWithApprovers(approvers: string[]): Knex.QueryBuilder {
    return this.knex.select('approval.report_id')
      .from({ approval: this.approvalsTable })
      .whereIn('approval.assignee_id', approvers);
  }

  public getTransaction(): Promise<Knex.Transaction> {
    return this.knex.transaction();
  }

  private mapSortColumns(col: ReportSortColumns): string {
    const map: Record<ReportSortColumns, string> = {
      drafted: 'reports.created_at',
      finalised: 'reports.approved_at',
    };
    return map[col];
  }

  private baseReportSelect(
    user: IUserWithMetadata,
    checkWriteAccess = false,
    trx?: Knex.Transaction,
  ): Knex.QueryBuilder {
    const db = trx ?? this.knex;
    const query = db.select({
      id: 'reports.id',
      analysisSetId: 'reports.analysis_set_id',
      type: 'reports.type',
      status: 'reports.status',
      pseudoStatus: 'reports.pseudo_status',
      approvedAt: 'reports.approved_at',
      fileId: 'reports.file_id',
      createdAt: 'reports.created_at',
      createdBy: 'reports.created_by',
      updatedAt: 'reports.updated_at',
      updatedBy: 'reports.updated_by',
    })
      .modify(withReports, 'from', user, undefined, checkWriteAccess);

    return query;
  }

  private withFilters(
    qb: Knex.QueryBuilder,
    filters: ReportFiltersDTO,
    reportsClient: ReportsClient,
  ): void {
    qb.where(function filterFunction() {
      if (filters.analysisSetIds?.length > 0) {
        this.whereIn('reports.analysis_set_id', filters.analysisSetIds);
      }

      if (filters.types && filters.types.length > 0) {
        this.whereIn('reports.type', filters.types);
      }

      if (filters.pseudoStatuses?.length || filters.statuses?.length) {
        this.where(function pseudoStatusQuery() {
          if (filters.pseudoStatuses?.length) {
            this.orWhereIn('reports.pseudo_status', filters.pseudoStatuses);
          }

          if (filters.statuses?.length) {
            this.orWhere(function reportStatusQuery() {
              this.whereIn('reports.status', filters.statuses);
              this.whereNull('reports.pseudo_status');
            });
          }
        });
      }

      if (filters.fileId) {
        this.where('reports.file_id', filters.fileId);
      }

      if (filters.approvers && filters.approvers.length > 0) {
        this.whereIn('reports.id', reportsClient.getReportsWithApprovers(filters.approvers));
      }
    });
  }
}
