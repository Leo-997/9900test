import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import { ICommonResp } from 'Models/Common/Response.model';
import { Group } from 'Models/Group/Group.model';
import { IUserWithMetadata } from 'Models/User/User.model';
import { CACHE_SERVICE } from 'Modules/Cache/Cache.module';
import { CacheService } from 'Services/Cache/Cache.service';
import { normalizeString } from 'Utils/string.util';
import { currentUser } from './currentUser';

@Injectable()
export class UserService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_SERVICE) private readonly cacheService: CacheService,
  ) {}

  public async getCurrentUser(token: string): Promise<IUserWithMetadata | null> {
    const cachePrefix = `${UserService.name}.getCurrentUser`;
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

    return resp || null;
  }

  public async getGroups(headers: IncomingHttpHeaders): Promise<ICommonResp<Group>[]> {
    const baseurl = `${normalizeString(process.env.VITE_AUTH_URL)}/auth/groups`;
    const resp = await this.httpService.axiosRef.get<ICommonResp<Group>[]>(baseurl, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: headers.authorization,
      },
    });

    return resp.data || null;
  }
}
