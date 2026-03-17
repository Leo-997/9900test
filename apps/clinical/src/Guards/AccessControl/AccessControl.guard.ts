import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AccessControlService } from 'Services/AccessControl/AccessControl.service';

@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(
    private readonly accessControlService: AccessControlService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.accessControlService.canAccessResource(context);
  }
}
