import { Global, Module } from '@nestjs/common';
import { CacheService } from 'Services/Cache/Cache.service';

export const CACHE_SERVICE = 'cache-service';
const cacheService = new CacheService();

@Global()
@Module({
  providers: [
    { provide: CACHE_SERVICE, useValue: cacheService },
  ],
  exports: [CACHE_SERVICE],
})
export class CacheModule {}
