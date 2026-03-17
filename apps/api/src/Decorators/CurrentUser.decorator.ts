import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuthenticatedRequest } from 'Models/Misc/Auth/AuthenticatedRequest.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { cacheService } from 'Modules/Cache/Cache.module';

export const CurrentUser = createParamDecorator(
  async (data: string, ctx: ExecutionContext): Promise<IUserWithMetadata> => {
    const request: IAuthenticatedRequest = ctx.switchToHttp().getRequest();
    const { user } = request;

    const cachePrefix = 'CurrentUser';
    const cacheObj = {
      userId: user.id,
    };
    // Check cache first
    const cachedResult = await cacheService.getResults<IUserWithMetadata>(
      cachePrefix,
      cacheObj,
    );

    if (cachedResult) {
      return cachedResult;
    }

    const userWithMetadata = data ? user && user[data] : user;
    await cacheService.setResults(
      cachePrefix,
      cacheObj,
      userWithMetadata,
    );
    return userWithMetadata;
  },
);
