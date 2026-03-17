import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IUserWithMetadata } from '../Models/User/User.model';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext): IUserWithMetadata => {
    const gqlUser = GqlExecutionContext.create(ctx).getContext().user;
    const ctxUser = ctx.switchToHttp().getRequest()?.user;
    const user = gqlUser || ctxUser;

    return data ? user && user[data] : user;
  },
);
