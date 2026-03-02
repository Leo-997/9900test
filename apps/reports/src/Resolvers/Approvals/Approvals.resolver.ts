import { UseGuards } from '@nestjs/common';
import {
  Args, Context, Mutation, Query, Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {
  Approval, CreateApprovalsBodyDTO, GetApprovalsQueryDTO, UpdateApprovalDTO,
} from '@zero-dash/types';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { GraphQLVoid } from 'graphql-scalars';
import { GraphQLAuthGuard } from 'Guards/Auth/GraphQLAuth.guard';
import { IncomingMessage } from 'http';
import { IUserWithMetadata } from 'Models/User/User.model';
import { ApprovalsService } from 'Services/Approvals/Approvals.service';

@Resolver(() => Approval)
@UseGuards(GraphQLAuthGuard)
export class ApprovalsResolver {
  constructor(
    private approvalService: ApprovalsService,
  ) {}

  @Query(() => Approval)
  async approval(
    @Args('id') id: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<Approval> {
    return this.approvalService.getApprovalById(
      id,
      user,
    );
  }

  @Mutation(() => GraphQLVoid, { nullable: true })
  async createApprovals(
    @Args('createApprovalsBody') createApprovalsBody: CreateApprovalsBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.approvalService.createApprovals(createApprovalsBody, user);
  }

  @Mutation(() => Number)
  async updateApproval(
    @Args({ name: 'id', type: () => String }) id: string,
    @Args('updateApprovalBody') updateApprovalBody: UpdateApprovalDTO,
    @CurrentUser() user: IUserWithMetadata,
    @Context() ctx: { req: IncomingMessage },
  ): Promise<number> {
    const headers = ctx.req?.headers ?? {};
    return this.approvalService.updateApproval(id, updateApprovalBody, user, headers);
  }

  @Query(() => [Approval])
  async approvals(
    @Args() filters: GetApprovalsQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<Approval[]> {
    return this.approvalService.getApprovals(filters, user);
  }

  @ResolveReference()
  async resolveReference(
    // eslint-disable-next-line @typescript-eslint/naming-convention
    reference: { __typename: string; id: string },
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<Approval> {
    return this.approvalService.getApprovalById(reference.id, user);
  }
}
