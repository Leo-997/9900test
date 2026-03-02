import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { IncomingMessage } from 'http';
import { IUserWithMetadata } from 'Models/User/User.model';

@Injectable()
export class GraphQLAuthGuard extends AuthGuard('http-bearer') {
  getRequest(context: ExecutionContext): IncomingMessage {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext<{ req: IncomingMessage }>().req;
  }

  override handleRequest<TUser = IUserWithMetadata | null>(
    err: unknown,
    user: IUserWithMetadata | null,
    info: unknown,
    context: ExecutionContext,
    status?: unknown,
  ): TUser {
    const gqlCtx = GqlExecutionContext.create(context);
    gqlCtx.getContext().user = user;
    return super.handleRequest<TUser>(err, user, info, gqlCtx, status);
  }
}
