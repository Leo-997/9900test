import {
  Body, Controller, Delete,
  Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import {
  CreateCommentBodyDTO,
  CreateCommentThreadBodyDTO,
  CreateCommentVersionBodyDTO,
  UpdateCommentBodyDTO,
  UpdateCommentVersionBodyDTO,
} from 'Models/Comment/CommentBody.model';
import { CommentsQueryDTO, CommentThreadQueryDTO, CommentThreadsQueryDTO } from 'Models/Comment/CommentQuery.model';
import { CurrentUser } from '../../Decorators/CurrentUser.decorator';
import {
  IComment,
  ICommentThread,
  IUserWithMetadata,
} from '../../Models';
import { CommentService } from '../../Services';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
  ) {}

  @Get('threads')
  @Scopes('clinical.sample.read')
  public async getCommentThreads(
    @Query() query: CommentThreadsQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ICommentThread[]> {
    return this.commentService.getCommentThreads(query, user);
  }

  @Get('threads/:threadId')
  @Scopes('clinical.sample.read')
  public async getCommentThreadById(
    @Param('threadId') threadId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ICommentThread> {
    return this.commentService.getCommentThreadById(threadId, user);
  }

  @Get()
  @Scopes('clinical.sample.read')
  public async getComments(
    @Query() query: CommentsQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IComment[]> {
    return this.commentService.getComments(query, user);
  }

  @Get('count')
  @Scopes('clinical.sample.read')
  public async getCommentsCount(
    @Query() query: CommentsQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.commentService.getCommentsCount(query, user);
  }

  @Get('threads/:threadId/comments')
  @Scopes('clinical.sample.read')
  public async getCommentsInThread(
    @Param('threadId') threadId: string,
    @Query() query: CommentsQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IComment[]> {
    return this.commentService.getCommentsInThread(threadId, query, user);
  }

  @Get(':commentId')
  @Scopes('clinical.sample.read')
  public async getCommentById(
    @Param('commentId') commentId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IComment> {
    return this.commentService.getCommentById(commentId, user);
  }

  @Post('thread')
  @Scopes('common.sample.suggestion.write')
  @IsWriteEndpoint()
  public async createCommentThread(
    @Body() body: CreateCommentThreadBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string> {
    return this.commentService.createCommentThread(body, user);
  }

  @Delete('thread/:threadId')
  @Scopes('common.sample.suggestion.write')
  @IsWriteEndpoint()
  public async deleteCommentThread(
    @Param('threadId') threadId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.commentService.deleteCommentThread(threadId, user);
  }

  @Post()
  @Scopes('common.sample.suggestion.write')
  @IsWriteEndpoint()
  public async createComment(
    @Body() body: CreateCommentBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string> {
    return this.commentService.createComment(body, user);
  }

  @Post('threads/link/:commentId')
  @IsWriteEndpoint()
  public async linkCommentToThread(
    @Param('commentId') commentId: string,
    @Body() body: CreateCommentThreadBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.commentService.linkCommentToThread(
      commentId,
      body,
      user,
    );
  }

  @Delete(':commentId')
  @Scopes('common.sample.suggestion.write')
  @IsWriteEndpoint()
  public async deleteComment(
    @Param('commentId') commentId: string,
    @Query() query: CommentThreadQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.commentService.deleteComment(commentId, query, user);
  }

  @Post(':commentId/versions')
  @Scopes('common.sample.suggestion.write')
  @IsWriteEndpoint()
  public async createCommentVersion(
    @Param('commentId') commentId: string,
    @Body() body: CreateCommentVersionBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string> {
    return this.commentService.createCommentVersion(commentId, body, user);
  }

  @Patch(':commentId/versions/:versionId')
  @Scopes('common.sample.suggestion.write')
  @IsWriteEndpoint()
  public async updateCommentVersion(
    @Param('commentId') commentId: string,
    @Param('versionId') versionId: string,
    @Body() body: UpdateCommentVersionBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.commentService.updateCommentVersion(
      commentId,
      versionId,
      body,
      user,
    );
  }

  @Patch(':commentId')
  @Scopes('common.sample.suggestion.write')
  @IsWriteEndpoint()
  public async updateComment(
    @Param('commentId') commentId: string,
    @Body() body: UpdateCommentBodyDTO,
    @Query() query: CommentThreadQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string> {
    return this.commentService.updateComment(commentId, body, query, user);
  }

  @Delete(':commentId/versions/keep-latest')
  @Scopes('common.sample.suggestion.write')
  @IsWriteEndpoint()
  public async keepLatestVersion(
    @Param('commentId') commentId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.commentService.keepLatestVersion(commentId, user);
  }
}
