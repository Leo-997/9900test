import { Type } from 'class-transformer';
import {
    IsBoolean, IsIn, IsNumber, IsOptional, IsString,
} from 'class-validator';
import { commentTypes, threadEntityTypes, threadTypes } from 'Constants/Comment/Comment.constant';
import { reportTypes } from 'Constants/Reports/Reports.constant';
import { ToBoolean } from 'Utils/Transformers/ToBoolean.util';
import { SortString } from '../Common/Order.model';
import { IPagination, PaginationDTO } from '../Common/Pagination.model';
import { ReportType } from '../Reports/Reports.model';
import {
    CommentTypes, ThreadEntityTypes, ThreadTypes,
} from './Comment.model';

export interface ICommentThreadsQuery extends IPagination {
  clinicalVersionId?: string;
  entityId?: string;
  entityType?: ThreadEntityTypes[];
  threadType?: ThreadTypes[];
  interpretationReportType?: ReportType[]
  zero2Category?: string[];
  zero2Subcat1?: string[];
  zero2Subcat2?: string[];
  zero2FinalDiagnosis?: string[];
  geneIds?: number[];
  geneMutations?: string[];
  classifier?: string[];
  includeComments?: boolean;
}

export interface ICommentsQuery extends ICommentThreadsQuery {
  searchQuery?: string;
  type?: CommentTypes[];
  isHiddenInThread?: boolean;
  isResolved?: boolean;
  isHiddenInArchive?: boolean;
  sortColumns?: string[];
  sortDirections?: SortString[];
}

export class CommentThreadsQueryDTO extends PaginationDTO implements ICommentThreadsQuery {
  @IsOptional()
  @IsIn(reportTypes, { each: true })
    interpretationReportType?: ReportType[];

  @IsOptional()
  @IsIn(threadTypes, { each: true })
    threadType?: ThreadTypes[];

  @IsOptional()
  @IsString()
    clinicalVersionId?: string;

  @IsOptional()
  @IsString()
    entityId?: string;

  @IsOptional()
  @IsIn(threadEntityTypes, { each: true })
    entityType?: ThreadEntityTypes[];

  @IsOptional()
  @IsString({ each: true })
    zero2Category?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2Subcat1?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2Subcat2?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2FinalDiagnosis?: string[];

  @IsOptional()
  @IsNumber(undefined, { each: true })
  @Type(() => Number)
    geneIds?: number[];

  @IsOptional()
  @IsString({ each: true })
    geneMutations?: string[];

  @IsOptional()
  @IsString({ each: true })
    classifiers?: string[];

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    includeComments?: boolean;
}

export class CommentsQueryDTO extends CommentThreadsQueryDTO implements ICommentsQuery {
  @IsOptional()
  @IsString()
    searchQuery?: string;

  @IsOptional()
  @IsIn(commentTypes, { each: true })
    type?: CommentTypes[];

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isHiddenInThread?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isResolved?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isHiddenInArchive?: boolean;

  @IsOptional()
  @Type(() => String)
  @IsString({ each: true })
    sortColumns?: string[];

  @IsOptional()
  @Type(() => String)
  @IsString({ each: true })
    sortDirections?: SortString[];
}

export interface ICommentThreadQuery {
  threadId?: string;
}

export class CommentThreadQueryDTO implements ICommentThreadQuery {
  @IsOptional()
  @IsString()
    threadId?: string;
}
