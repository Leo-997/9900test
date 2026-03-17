import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  CreateReportsBodyDTO, Report, ReportFiltersDTO, UpdateReportMetadataDTO, UpdateReportsBodyDTO,
} from '@zero-dash/types';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IUserWithMetadata } from 'Models/User/User.model';
import { ReportsService } from 'Services/Reports/Reports.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('')
export class ReportsController {
  constructor(
    @Inject(ReportsService) private readonly reportsService: ReportsService,
  ) {}

  @Post()
  @IsWriteEndpoint()
  public async createReport(
    @Body() body: CreateReportsBodyDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
  ): Promise<string> {
    return this.reportsService.createReport(body, currentUser);
  }

  @Get(':reportId')
  public async getReportById(
    @Param('reportId') reportId: string,
    @CurrentUser() currentUser: IUserWithMetadata,
  ): Promise<Report> {
    return this.reportsService.getReportById(
      reportId,
      currentUser,
    );
  }

  @Post('get-all')
  public async getReports(
    @Body() { page, limit, ...filters }: ReportFiltersDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
  ): Promise<Report[]> {
    return this.reportsService.getReports(filters, page, limit, currentUser);
  }

  @Post('count')
  public async getReportsCount(
    @Body() filters: ReportFiltersDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
  ): Promise<number> {
    return this.reportsService.getReportsCount(filters, currentUser);
  }

  @Patch(':reportId')
  @IsWriteEndpoint()
  public async updateReport(
    @Param('reportId') reportId: string,
    @Body() body: UpdateReportsBodyDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
  ): Promise<void> {
    return this.reportsService.updateReport(reportId, body, currentUser);
  }

  @Patch(':reportId/metadata')
  @IsWriteEndpoint()
  public async updateReportMetadata(
    @Param('reportId') reportId: string,
    @Body() body: UpdateReportMetadataDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
  ): Promise<void> {
    return this.reportsService.updateReportMetadata(
      reportId,
      body.metadata,
      currentUser,
    );
  }
}
