import {
  ArgsType, Directive, Field, ID, InputType, ObjectType,
} from '@nestjs/graphql';
import {
  IsOptional, IsString, IsIn, IsBoolean,
  ValidateIf,
  ArrayNotEmpty,
  IsArray,
  ValidateNested,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';
import { approvalLabels, approvalStatuses } from './Approvals.constants';
import { ToBoolean } from '../utils/ToBoolean.util';

export type ApprovalStatus = typeof approvalStatuses[number];
export type ApprovalLabel = typeof approvalLabels[number];

@ObjectType()
@Directive('@key(fields: "id")')
export class Approval {
  @Field(() => ID, { nullable: false })
    id: string;

  @Field(() => String, { nullable: false })
    reportId: string;

  @Field(() => String, { nullable: false })
    status: ApprovalStatus;

  @Field(() => String, { nullable: true })
    groupId: string | null;

  @Field(() => String, { nullable: true })
    label: ApprovalLabel | null;

  @Field(() => Boolean, { nullable: true })
    showOnReport: boolean;

  @Field(() => String, { nullable: true })
    assigneeId: string | null;

  @Field(() => String, { nullable: true })
    approvedBy?: string;

  @Field(() => String, { nullable: true })
    approvedAt?: string;

  @Field(() => String, { nullable: false })
    createdAt: string;

  @Field(() => String, { nullable: false })
    createdBy: string;

  @Field(() => String, { nullable: true })
    updatedAt?: string;

  @Field(() => String, { nullable: true })
    updatedBy?: string;

  @Field(() => String, { nullable: true })
    notifiedAt?: string;
}

@ArgsType()
export class GetApprovalsQueryDTO {
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
    id?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
    reportId?: string;

  @IsOptional()
  @IsIn(approvalStatuses)
  @Field(() => String, { nullable: true })
    status?: ApprovalStatus;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
    groupId?: string | null;

  @IsIn([...approvalLabels, null])
  @IsOptional()
  @Field(() => String, { nullable: true })
    label?: ApprovalLabel;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @Field(() => Boolean, { nullable: true })
    showOnReport?: boolean;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
    assigneeId?: string | null;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
    approvedBy?: string | null;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
    approvedAt?: string | null;
}

@InputType()
export class CreateApprovalDTO {
  @IsIn(approvalStatuses)
  @Field(() => String, { nullable: false })
    status: ApprovalStatus;

  @IsString()
  @ValidateIf((o) => !o.assigneeId || o.groupId)
  @Field(() => String, { nullable: true })
    groupId?: string | null;

  @IsIn([...approvalLabels, null])
  @IsOptional()
  @Field(() => String, { nullable: true })
    label?: ApprovalLabel;

  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
    showOnReport?: boolean;

  @IsString()
  @ValidateIf((o) => !o.groupId || o.assigneeId)
  @Field(() => String, { nullable: true })
    assigneeId?: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
    approvedBy?: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
    approvedAt?: string | null;
}

@InputType()
export class CreateApprovalsBodyDTO {
  @IsString()
  @Field(() => String, { nullable: false })
    reportId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateApprovalDTO)
  @Field(() => [CreateApprovalDTO], { nullable: false })
    approvals: CreateApprovalDTO[];
}

@InputType()
export class UpdateApprovalDTO {
  @ValidateIf((o) => o.status === 'approved')
  @IsString()
  @Field(() => String, { nullable: true })
    patientId?: string;

  @IsOptional()
  @IsIn(approvalStatuses)
  @Field(() => String, { nullable: true })
    status?: ApprovalStatus;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @Field(() => Boolean, { nullable: true })
    showOnReport?: boolean;

  @IsOptional()
  @IsString()
  @ValidateIf((o, value) => value !== null)
  @Field(() => String, { nullable: true })
    assigneeId?: string | null;

  @IsOptional()
  @IsISO8601()
  @Field(() => String, { nullable: true })
    notifiedAt?: string;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @Field(() => Boolean, { nullable: true })
    sendNotifications?: boolean;
}
