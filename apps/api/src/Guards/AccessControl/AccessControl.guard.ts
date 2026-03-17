import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_WRITE_ENDPOINT_KEY } from 'Models/AccessControl/AccessControl.model';
import { IAuthenticatedRequest } from 'Models/Misc/Auth/AuthenticatedRequest.model';
import { AccessControlService } from 'Services/AccessControl/AccessControl.service';

@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly accessControlService: AccessControlService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isWriteEndoint = this.reflector.get<boolean>(IS_WRITE_ENDPOINT_KEY, context.getHandler());

    const { user, params }: IAuthenticatedRequest = context.switchToHttp().getRequest();

    return this.accessControlService.canAccessResource(isWriteEndoint, user, params);
  }
}
