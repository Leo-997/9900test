import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuthenticatedRequest } from '../Models/Misc/Auth/AuthenticatedRequest.model';
import { IUserWithMetadata } from '../Models/User/User.model';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext): IUserWithMetadata => {
    const request: IAuthenticatedRequest = ctx.switchToHttp().getRequest();
    const { user } = request;

    return data ? user && user[data] : user;
  },
);
