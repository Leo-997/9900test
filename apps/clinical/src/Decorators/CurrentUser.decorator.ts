import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserWithMetadata } from 'Models';
import { IAuthenticatedRequest } from 'Models/Auth/AuthenticatedRequest.model';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext): IUserWithMetadata => {
    const request: IAuthenticatedRequest = ctx.switchToHttp().getRequest();
    const { user } = request;

    return data ? user && user[data] : user;
  },
);
