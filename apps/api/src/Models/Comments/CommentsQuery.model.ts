import { Type } from 'class-transformer';
import {
  IsBoolean, IsIn, IsNumber, IsOptional, IsString,
} from 'class-validator';
import { commentTypes, threadEntityTypes, threadTypes } from 'Constants/Comments/Comments.constants';
import { SortString } from 'Models/Curation/Misc.model';
import { IPaginationRequest, PaginationRequestDTO } from 'Models/Misc/Requests/PaginationDto.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import {
  CommentTypes, ThreadEntityTypes, ThreadTypes,
} from './Comments.model';

export interface ICommentThreadsQuery extends IPaginationRequest {
  id?: string;
  analysisSetIds?: string[];
  biosampleIds?: string[];
  entityId?: string;
  entityType?: ThreadEntityTypes[];
  threadType?: ThreadTypes[];
  genes?: number[];
  zero2Category?: string[];
  zero2Subcat1?: string[];
  zero2Subcat2?: string[];
  zero2FinalDiagnosis?: string[];
  includeComments?: boolean;
}

export interface ICommentsQuery extends Omit<ICommentThreadsQuery, 'includeComments'> {
  searchQuery?: string;
  type?: CommentTypes[];
  isHiddenInThread?: boolean;
  isHiddenInArchive?: boolean;
  sortColumns?: string[];
  sortDirections?: SortString[];
}

export class CommentThreadsBodyDTO extends PaginationRequestDTO implements ICommentThreadsQuery {
  @IsOptional()
  @IsIn(threadTypes, { each: true })
    threadType?: ThreadTypes[];

  @IsOptional()
  @IsString({ each: true })
    analysisSetIds?: string[];

  @IsOptional()
  @IsString({ each: true })
    biosampleIds?: string[];

  @IsOptional()
  @IsString()
    entityId?: string;

  @IsOptional()
  @IsIn(threadEntityTypes, { each: true })
    entityType?: ThreadEntityTypes[];

  @IsOptional()
  @IsNumber(undefined, { each: true })
  @Type(() => Number)
    genes?: number[];

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
  @IsBoolean()
  @ToBoolean()
    includeComments?: boolean;
}

export class CommentsBodyDTO extends CommentThreadsBodyDTO implements ICommentsQuery {
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
