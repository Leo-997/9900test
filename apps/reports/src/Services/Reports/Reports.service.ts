import {
  BadRequestException, ForbiddenException, forwardRef, Inject, Injectable,
} from '@nestjs/common';
import { ReportsClient } from 'Clients/Reports/Reports.client';
import { IUserWithMetadata } from 'Models/User/User.model';
import {
  CreateReportsBodyDTO, Report, ReportFiltersDTO, UpdateReportMetadataKey, UpdateReportsBodyDTO,
} from '@zero-dash/types';
import { Knex } from 'knex';
import { ApprovalsService } from '../Approvals/Approvals.service';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(ReportsClient) private reportsClient: ReportsClient,
    @Inject(forwardRef(() => ApprovalsService)) private approvalsService: ApprovalsService,
  ) {}

  public async getReports(
    filters: ReportFiltersDTO,
    page: number,
    limit: number,
    currentUser: IUserWithMetadata,
  ): Promise<Report[]> {
    let reports = await this.reportsClient.getReports(
      filters,
      page,
      limit,
      currentUser,
    );
    reports = await Promise.all(
      reports.map(async (report) => ({
        ...report,
        metadata: await this.reportsClient.getReportMetadata(report.id),
      })),
    );
    if (filters.includeApprovals) {
      return Promise.all(
        reports.map(async (report) => ({
          ...report,
          approvals: await this.approvalsService.getApprovals(
            { reportId: report.id },
            currentUser,
          ),
        })),
      );
    }
    return reports;
  }

  public async getReportsCount(
    filters: ReportFiltersDTO,
    currentUser: IUserWithMetadata,
  ): Promise<number> {
    return this.reportsClient.getReportsCount(filters, currentUser);
  }

  public async getReportById(
    id: string,
    user: IUserWithMetadata,
    options: {
      includeApprovals?: boolean;
      checkWriteAccess?: boolean;
    } = {},
    trx?: Knex.Transaction,
  ): Promise<Report> {
    const {
      includeApprovals = false,
      checkWriteAccess = false,
    } = options;

    const report = await this.reportsClient.getReportById(
      id,
      user,
      checkWriteAccess,
      trx,
    );
    if (!report) {
      throw new BadRequestException('Report not found or inaccessible');
    }

    report.metadata = await this.reportsClient.getReportMetadata(report.id);

    if (includeApprovals) {
      return {
        ...report,
        approvals: await this.approvalsService.getApprovals(
          { reportId: report.id },
          user,
        ),
      };
    }

    return report;
  }

  public async createReport(
    body: CreateReportsBodyDTO,
    currentUser: IUserWithMetadata,
  ): Promise<string> {
    try {
      const trx = await this.reportsClient.getTransaction();
      const id = await this.reportsClient.createReport(body, currentUser, trx);
      const report = await this.getReportById(
        id,
        currentUser,
        { checkWriteAccess: true },
        trx,
      );
      if (!report) {
        trx.rollback();
        throw new ForbiddenException();
      }
      trx.commit();
      return id;
    } catch {
      throw new BadRequestException('Could not create report, please try again');
    }
  }

  public async updateReport(
    id: string,
    body: UpdateReportsBodyDTO,
    currentUser: IUserWithMetadata,
  ): Promise<void> {
    if (Object.values(body).every((v) => v === undefined)) {
      throw new BadRequestException('At least one property must be set on the body to update');
    }
    const report = await this.getReportById(
      id,
      currentUser,
      { checkWriteAccess: true },
    );
    if (!report) {
      throw new ForbiddenException();
    }
    try {
      await this.reportsClient.updateReport(id, body, currentUser);
    } catch {
      throw new BadRequestException('Could not update report, please try again');
    }
  }

  public async updateReportMetadata(
    reportId: string,
    body: UpdateReportMetadataKey[],
    currentUser: IUserWithMetadata,
  ): Promise<void> {
    const report = await this.getReportById(
      reportId,
      currentUser,
      { checkWriteAccess: true },
    );
    if (!report) {
      throw new ForbiddenException();
    }
    try {
      await this.reportsClient.updateReportMetadata(
        reportId,
        body,
        currentUser,
      );
    } catch {
      throw new BadRequestException('Could not update report, please try again');
    }
  }
}
