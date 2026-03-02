import {
  ArgsType, Directive, Field, ID, InputType, ObjectType,
} from '@nestjs/graphql';
import {
  IsBoolean, IsIn, IsOptional, IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Type } from 'class-transformer';
import {
  reportTypes, reportPseudoStatuses, reportMetadataKeys,
  reportSortColumns,
} from './Reports.constants';
import { Approval, ApprovalStatus } from '../approvals/Approvals.types';
import { approvalStatuses } from '../approvals/Approvals.constants';
import { PaginationDTO } from '../common/Pagination.types';
import { ToBoolean } from '../utils/ToBoolean.util';

export type ReportType = typeof reportTypes[number];
export type ReportPseudoStatus = typeof reportPseudoStatuses[number];
export type ReportMetadataKey = typeof reportMetadataKeys[number];
export type ReportSortColumns = typeof reportSortColumns[number];
export type ReportMetadata = Partial<Record<ReportMetadataKey, string>>;

@ObjectType()
@Directive('@key(fields: "id")')
export class Report {
  @Field(() => ID, { nullable: false })
    id: string;

  @Field(() => String, { nullable: false })
    analysisSetId: string;

  @Field(() => String, { nullable: false })
    type: ReportType;

  @Field(() => String, { nullable: false })
    status: ApprovalStatus;

  @Field(() => String, { nullable: true })
    pseudoStatus: ReportPseudoStatus | null;

  @Field(() => String, { nullable: true })
    approvedAt: string | null;

  @Field(() => String, { nullable: true })
    fileId?: string | null;

  @Field(() => [Approval], { nullable: true })
    approvals?: Approval[];

  @Field(() => GraphQLJSONObject, { nullable: true })
    metadata?: ReportMetadata;

  @Field(() => String, { nullable: false })
    createdAt: string;

  @Field(() => String, { nullable: false })
    createdBy: string;

  @Field(() => String, { nullable: true })
    updatedAt: string | null;

  @Field(() => String, { nullable: true })
    updatedBy: string;
}

@ArgsType()
export class ReportFiltersDTO extends PaginationDTO {
  @IsOptional()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
    analysisSetIds?: string[];

  @IsOptional()
  @IsIn(reportTypes, { each: true })
  @Field(() => [String], { nullable: true })
    types?: ReportType[];

  @IsOptional()
  @IsIn(approvalStatuses, { each: true })
  @Field(() => [String], { nullable: true })
    statuses?: ApprovalStatus[];

  @IsOptional()
  @IsIn(reportPseudoStatuses, { each: true })
  @Field(() => [String], { nullable: true })
    pseudoStatuses?: ReportPseudoStatus[];

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
    fileId?: string;

  @IsOptional()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
    approvers?: string[];

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    includeApprovals?: boolean;

  @IsOptional()
  @IsIn(reportSortColumns, { each: true })
  @Field(() => [String], { nullable: true })
    sortColumns?: ReportSortColumns[];

  @IsOptional()
  @IsIn(['asc', 'desc'], { each: true })
  @Field(() => [String], { nullable: true })
    sortDirections?: ('asc' | 'desc')[];
}

@InputType()
export class CreateReportsBodyDTO {
  @IsString()
  @Field(() => String, { nullable: false })
    analysisSetId: string;

  @IsIn(reportTypes)
  @Field(() => String, { nullable: false })
    type: ReportType;

  @IsIn(approvalStatuses)
  @Field(() => String, { nullable: false })
    status: ApprovalStatus;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
    fileId?: string;
}

@InputType()
export class UpdateReportsBodyDTO {
  @IsOptional()
  @IsIn(approvalStatuses)
  @Field(() => String, { nullable: true })
    status?: ApprovalStatus;

  @IsOptional()
  @IsIn(reportPseudoStatuses)
  @ValidateIf((o, v) => v !== null)
  @Field(() => String, { nullable: true })
    pseudoStatus?: ReportPseudoStatus | null;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
    fileId?: string;
}

@InputType()
export class UpdateReportMetadataKey {
  @IsIn(reportMetadataKeys)
  @Field(() => String, { nullable: false })
    key: ReportMetadataKey;

  @IsString()
  @Field(() => String, { nullable: false })
    value: string;
}

@InputType()
export class UpdateReportMetadataDTO {
  @ValidateNested({ each: true })
  @Type(() => UpdateReportMetadataKey)
  @Field(() => [UpdateReportMetadataKey])
    metadata: UpdateReportMetadataKey[];
}
