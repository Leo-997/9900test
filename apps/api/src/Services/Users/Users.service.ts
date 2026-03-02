import { Inject, Injectable } from '@nestjs/common';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { CACHE_SERVICE } from 'Modules/Cache/Cache.module';
import { CacheService } from 'Services/Cache/Cache.service';
import { currentUser } from './currentUser';

@Injectable()
export class UsersService {
  constructor(
    // private readonly httpService: HttpService,
    @Inject(CACHE_SERVICE) private readonly cacheService: CacheService,
  ) {}

  public async getCurrentUser(token: string): Promise<IUserWithMetadata | null> {
    const cachePrefix = `${UsersService.name}.getCurrentUser`;
    const cacheObj = {
      token,
    };
    // Check cache first
    const cachedResult = await this.cacheService.getResults<IUserWithMetadata>(
      cachePrefix,
      cacheObj,
    );

    if (cachedResult) {
      return cachedResult;
    }

    const resp = currentUser;

    if (resp) {
      await this.cacheService.setResults(
        cachePrefix,
        cacheObj,
        resp,
      );
      return resp;
    }

    return null;
  }
}
