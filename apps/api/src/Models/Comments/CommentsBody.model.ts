import { Type } from 'class-transformer';
import {
  IsBoolean, IsIn, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested,
} from 'class-validator';
import { commentTypes, threadEntityTypes, threadTypes } from 'Constants/Comments/Comments.constants';
import { IUpdateOrder, UpdateOrderDTO } from 'Models/Common/Common.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import {
  CommentTypes, ThreadEntityTypes, ThreadTypes,
} from './Comments.model';

export interface ICreateCommentThreadBody {
  threadType: ThreadTypes;
  analysisSetId: string;
  biosampleId?: string;
  entityId?: string;
  entityType?: ThreadEntityTypes;
}

export interface ICreateCommentBody extends ICreateCommentThreadBody {
  comment: string;
  type: CommentTypes;
  isHiddenInArchive?: boolean;
  isHiddenInThread?: boolean;
  reportOrder?: number;
}

export class CreateCommentThreadBodyDTO implements ICreateCommentThreadBody {
  @IsIn(threadTypes)
    threadType: ThreadTypes;

  @IsString()
    analysisSetId: string;

  @IsOptional()
  @IsString()
    biosampleId?: string;

  @IsOptional()
  @IsString()
    entityId?: string;

  @IsOptional()
  @IsIn(threadEntityTypes)
    entityType?: ThreadEntityTypes;
}

export class CreateCommentBodyDTO extends CreateCommentThreadBodyDTO implements ICreateCommentBody {
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
  @IsNumber()
  @Type(() => Number)
    reportOrder?: number;
}

export interface IUpdateCommentBody {
  comment?: string;
  type?: CommentTypes;
  isHidden?: boolean;
  reportOrder?: number | null;
  reportLineBreak?: boolean;
}

export class UpdateCommentBodyDTO implements IUpdateCommentBody {
  @IsOptional()
  @IsString()
    comment: string;

  @IsOptional()
  @IsIn(commentTypes)
    type: CommentTypes;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isHidden?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ValidateIf((o, v) => v !== null)
    reportOrder?: number | null;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    reportLineBreak?: boolean;
}

export interface IUpdateReportOrder {
  threadId: string;
  order: IUpdateOrder[];
}

export class UpdateReportOrderDTO implements IUpdateReportOrder {
  @IsString()
    threadId: string;

  @ValidateNested({ each: true })
  @Type(() => UpdateOrderDTO)
    order: UpdateOrderDTO[];
}

export class CreateCommentVersionBodyDTO {
  @IsString()
    comment: string;
}

export interface IUpdateCommentVersionBody {
  comment?: string;
}
