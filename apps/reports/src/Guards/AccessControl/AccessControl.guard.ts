import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  IS_WRITE_ENDPOINT_KEY,
} from 'Models/AccessControl/AccessControl.model';
import { IAuthenticatedRequest } from 'Models/Misc/Auth/AuthenticatedRequest.model';
import { ApprovalsService } from 'Services/Approvals/Approvals.service';
import { ReportsService } from 'Services/Reports/Reports.service';

@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(forwardRef(() => ReportsService))
    private readonly reportsService: ReportsService,
    @Inject(forwardRef(() => ApprovalsService))
    private readonly approvalsService: ApprovalsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: IAuthenticatedRequest = context.switchToHttp().getRequest();
    const isWriteEndpoint = this.reflector.get<boolean>(
      IS_WRITE_ENDPOINT_KEY,
      context.getHandler(),
    );

    const reportId = this.resolveReportId(request);
    const approvalId = this.resolveApprovalId(request);

    if (!reportId && !approvalId) {
      return true;
    }

    if (reportId) {
      const report = await this.reportsService.getReportById(
        reportId,
        request.user,
        { checkWriteAccess: isWriteEndpoint },
      );
      return Boolean(report);
    }

    const approval = await this.approvalsService.getApprovalById(
      approvalId,
      request.user,
    );
    return Boolean(approval);
  }

  private resolveReportId(request: IAuthenticatedRequest): string | null {
    const { params = {}, body = {}, query = {} } = request;

    return body.reportId || query.reportId || params.reportId;
  }

  private resolveApprovalId(request: IAuthenticatedRequest): string | null {
    const { params = {}, body = {}, query = {} } = request;

    return body.approvalId || query.approvalId || params.approvalId;
  }
}
