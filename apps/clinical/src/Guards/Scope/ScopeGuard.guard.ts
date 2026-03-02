import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPES_KEY, Scope } from 'Models/Scope/Scope.model';
import { IAuthenticatedRequest } from '../../Models';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // this will get scopes from either controller or method, merge both of them if both are defined
    const requiredScopes = this.reflector.getAllAndMerge<Scope[]>(SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredScopes || requiredScopes.length === 0) {
      return true;
    }

    const { user }: IAuthenticatedRequest = context.switchToHttp().getRequest();

    return requiredScopes.some(
      (scope) => user
        && user.scopes
        && Array.isArray(user.scopes)
        && user.scopes.map((s) => s.name).includes(scope),
    );
  }
}
