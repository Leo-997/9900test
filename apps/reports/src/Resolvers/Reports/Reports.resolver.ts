import { UseGuards } from '@nestjs/common';
import {
  Args, Mutation, Parent, Query, ResolveField, Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {
  Report, Approval, ReportFiltersDTO, CreateReportsBodyDTO,
  UpdateReportsBodyDTO,
  UpdateReportMetadataDTO,
} from '@zero-dash/types';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { GraphQLVoid } from 'graphql-scalars';
import { GraphQLAuthGuard } from 'Guards/Auth/GraphQLAuth.guard';
import { IUserWithMetadata } from 'Models/User/User.model';
import { ApprovalsService } from 'Services/Approvals/Approvals.service';
import { ReportsService } from 'Services/Reports/Reports.service';

@Resolver(() => Report)
@UseGuards(GraphQLAuthGuard)
export class ReportsResolver {
  constructor(
    private reportsService: ReportsService,
    private approvalService: ApprovalsService,
  ) {}

  @Query(() => Report)
  async report(
    @Args('id') id: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<Report> {
    return this.reportsService.getReportById(id, user);
  }

  @Query(() => [Report])
  async reports(
    @Args() { page, limit, ...filters }: ReportFiltersDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<Report[]> {
    return this.reportsService.getReports(filters, page, limit, user);
  }

  @Mutation(() => String)
  async createReport(
    @Args('createReportBody') createReportBody: CreateReportsBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string> {
    return this.reportsService.createReport(createReportBody, user);
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async updateReport(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('updateReportBody') updateReportBody: UpdateReportsBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.reportsService.updateReport(id, updateReportBody, user);
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async updateReportMetadata(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('updateReportMetadataBody') updateReportMetadataBody: UpdateReportMetadataDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.reportsService.updateReportMetadata(id, updateReportMetadataBody.metadata, user);
  }

  @ResolveField()
  async approvals(
    @Parent() report: Report,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<Approval[]> {
    const { id } = report;
    return this.approvalService.getApprovals(
      { reportId: id },
      user,
    );
  }

  @ResolveReference()
  async resolveReference(
    // eslint-disable-next-line @typescript-eslint/naming-convention
    reference: { __typename: string; id: string },
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<Report> {
    return this.reportsService.getReportById(reference.id, user);
  }
}
