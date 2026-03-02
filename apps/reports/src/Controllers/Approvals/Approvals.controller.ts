import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  Approval, CreateApprovalsBodyDTO, GetApprovalsQueryDTO, UpdateApprovalDTO,
} from '@zero-dash/types';
import { IsWriteEndpoint } from 'Decorators/AccessControl/IsWriteEndpoint.decorator';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { AccessControlGuard } from 'Guards/AccessControl/AccessControl.guard';
import { ScopeGuard } from 'Guards/Scope/ScopeGuard.guard';
import { IncomingHttpHeaders } from 'http';
import { IUserWithMetadata } from 'Models/User/User.model';
import { ApprovalsService } from 'Services/Approvals/Approvals.service';

@UseGuards(AuthGuard('http-bearer'), ScopeGuard, AccessControlGuard)
@Controller('approvals')
export class ApprovalsController {
  constructor(
    @Inject(ApprovalsService) private readonly approvalsService: ApprovalsService,
  ) {}

  @Get()
  public async getApprovals(
    @Query() query: GetApprovalsQueryDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<Approval[]> {
    return this.approvalsService.getApprovals(query, user);
  }

  @Get(':approvalId')
  public async getApprovalById(
    @Param('approvalId') approvalId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<Approval> {
    return this.approvalsService.getApprovalById(
      approvalId,
      user,
    );
  }

  @Post()
  @IsWriteEndpoint()
  public async createApprovals(
    @Body() body: CreateApprovalsBodyDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<void> {
    return this.approvalsService.createApprovals(body, user);
  }

  @Patch(':approvalId')
  public async updateApproval(
    @Param('approvalId') approvalId: string,
    @Body() body: UpdateApprovalDTO,
    @CurrentUser() user: IUserWithMetadata,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<number> {
    return this.approvalsService.updateApproval(approvalId, body, user, headers);
  }
}
