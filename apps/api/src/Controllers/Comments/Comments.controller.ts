import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Scopes } from 'Decorators/Scope/Scope.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IComment, ICommentThread } from 'Models/Comments/Comments.model';
import {
  CreateCommentBodyDTO,
  CreateCommentThreadBodyDTO,
  CreateCommentVersionBodyDTO,
  UpdateCommentBodyDTO,
  UpdateReportOrderDTO,
} from 'Models/Comments/CommentsBody.model';
import { CommentsBodyDTO, CommentThreadQueryDTO, CommentThreadsBodyDTO } from 'Models/Comments/CommentsQuery.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AccessControlService } from 'Services/AccessControl/AccessControl.service';
import { CommentsService } from 'Services/Comments/Comments.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('/comments')
export class CommentsController {
  constructor(
    @Inject(CommentsService) private readonly commentsService: CommentsService,
    private readonly accessControlService: AccessControlService,
  ) {}

  @Get('threads/:id')
  @Scopes('curation.sample.read')
  public async getCommentThreadById(
    @Param('id') id: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<ICommentThread> {
    return this.commentsService.getCommentThreadById(id, user);
  }

  @Get(':id')
  @Scopes('curation.sample.read')
  public async getCommentById(
    @Param('id') id: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IComment> {
    return this.commentsService.getCommentById(id, user);
  }

  @Post('threads')
  @Scopes('curation.sample.read')
  public async getCommentThreads(
    @Body() filters: CommentThreadsBodyDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
  ): Promise<ICommentThread[]> {
    return this.commentsService.getCommentThreads(filters, currentUser);
  }

  @Post('threads/link/:commentId')
  public async linkCommentToThread(
    @Param('commentId') commentId: string,
    @Body() body: CreateCommentThreadBodyDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
  ): Promise<void> {
    const canAccess = await this.accessControlService.canAccessResource(
      true,
      currentUser,
      {
        analysisSetId: body.analysisSetId,
        biosampleId: body.biosampleId,
      },
      !body.biosampleId,
    );
    if (!canAccess) {
      throw new ForbiddenException();
    }
    return this.commentsService.linkCommentToThread(
      commentId,
      body,
      currentUser,
    );
  }

  @Post('threads/:threadId/comments')
  @Scopes('curation.sample.read')
  public async getCommentsInThread(
    @Param('threadId') threadId: string,
    @Body() filters: CommentsBodyDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
  ): Promise<IComment[]> {
    return this.commentsService.getCommentsInThread(threadId, filters, currentUser);
  }

  @Post('get-all')
  @Scopes('curation.sample.read')
  public async getComments(
    @Body() filters: CommentsBodyDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
  ): Promise<IComment[]> {
    return this.commentsService.getComments(filters, currentUser);
  }

  @Post('count')
  @Scopes('curation.sample.read')
  public async getCommentsCount(
    @Body() filters: CommentsBodyDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
  ): Promise<number> {
    return this.commentsService.getCommentsCount(filters, currentUser);
  }

  @Post()
  public async createComment(
    @Body() body: CreateCommentBodyDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
  ): Promise<string> {
    const canAccess = await this.accessControlService.canAccessResource(
      true,
      currentUser,
      {
        analysisSetId: body.analysisSetId,
        biosampleId: body.biosampleId,
      },
      !body.biosampleId,
    );
    if (!canAccess) {
      throw new ForbiddenException();
    }
    return this.commentsService.createComment(body, currentUser);
  }

  @Post(':commentId/versions')
  @IsWriteEndpoint()
  public async createCommentVersion(
    @Param('commentId') commentId: string,
    @Body() body: CreateCommentVersionBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string> {
    return this.commentsService.createCommentVersion(commentId, body, user);
  }

  @Put('report-order')
  public async updateCommentReportOrder(
    @Body() body: UpdateReportOrderDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
  ): Promise<void> {
    return this.commentsService.updateCommentReportOrder(body, currentUser);
  }

  @Patch(':id')
  public async updateComment(
    @Param('id') id: string,
    @Body() body: UpdateCommentBodyDTO,
    @Query() query: CommentThreadQueryDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
  ): Promise<string> {
    return this.commentsService.updateComment(id, body, query, currentUser);
  }

  @Delete(':id')
  public async deleteComment(
    @Param('id') id: string,
    @Query() query: CommentThreadQueryDTO,
    @CurrentUser() currentUser: IUserWithMetadata,
  ): Promise<void> {
    return this.commentsService.deleteComment(id, query, currentUser);
  }

  @Delete(':commentId/versions/keep-latest')
  @IsWriteEndpoint()
  public async keepLatestVersion(
    @Param('commentId') commentId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.commentsService.keepLatestVersion(commentId, user);
  }
}
