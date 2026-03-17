import { Type } from 'class-transformer';
import {
  IsBoolean, IsIn, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested,
} from 'class-validator';
import { commentTypes, threadEntityTypes, threadTypes } from 'Constants/Comment/Comment.constant';
import { ToBoolean } from 'Utils/Transformers/ToBoolean.util';
import { UpdateOrderDTO } from '../Common/Order.model';
import {
  CommentTypes, ThreadEntityTypes, ThreadTypes,
} from './Comment.model';

export interface ICreateCommentThreadBody {
  threadType: ThreadTypes;
  clinicalVersionId: string;
  entityId?: string;
  entityType?: ThreadEntityTypes;
}

export interface ICreateCommentBody {
  comment: string;
  type: CommentTypes;
  isHiddenInArchive?: boolean;
  isHiddenInThread?: boolean;
  isResolved?: boolean;
  reportOrder?: number;
  // create the comment and thread at once
  thread?: ICreateCommentThreadBody;
  // thread is created, just create and add the comment to the thread
  threadId?: string;
}

export interface ICreateCommentVersionBody {
  comment: string;
}

export interface IUpdateCommentVersionBody {
  comment?: string;
}

export class CreateCommentThreadBodyDTO implements ICreateCommentThreadBody {
  @IsIn(threadTypes)
    threadType: ThreadTypes;

  @IsString()
    clinicalVersionId: string;

  @IsOptional()
  @IsString()
    entityId?: string;

  @IsOptional()
  @IsIn(threadEntityTypes)
    entityType?: ThreadEntityTypes;
}

export class CreateCommentBodyDTO implements ICreateCommentBody {
  @IsString()
    comment: string;

  @IsIn(commentTypes)
    type: CommentTypes;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isHiddenInArchive?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isHiddenInThread?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isResolved?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
    reportOrder?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCommentThreadBodyDTO)
    thread?: ICreateCommentThreadBody;

  @IsOptional()
  @IsString()
    threadId?: string;
}

export class CreateCommentVersionBodyDTO implements ICreateCommentVersionBody {
  @IsString()
    comment: string;
}

export class UpdateCommentVersionBodyDTO implements IUpdateCommentVersionBody {
  @IsOptional()
  @IsString()
    comment?: string;
}

export interface IUpdateCommentBody {
  comment?: string;
  type?: CommentTypes;
  isHidden?: boolean;
  isResolved?: boolean;
  reportOrder?: number | null;
}

export class UpdateCommentBodyDTO implements IUpdateCommentBody {
  @IsOptional()
  @IsString()
    comment?: string;

  @IsOptional()
  @IsIn(commentTypes)
    type?: CommentTypes;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isHidden?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isResolved?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ValidateIf((o, v) => v !== null)
    reportOrder?: number | null;
}

export interface IUpdateReportOrder {
  threadId: string;
  order: UpdateOrderDTO[];
}

export class UpdateReportOrderDTO implements IUpdateReportOrder {
  @IsString()
    threadId: string;

  @ValidateNested({ each: true })
  @Type(() => UpdateOrderDTO)
    order: UpdateOrderDTO[];
}
