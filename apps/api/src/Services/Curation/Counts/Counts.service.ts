import { Inject } from '@nestjs/common';
import { CountsClient } from 'Clients/Curation/Counts/Counts.client';
import type { ICounts } from 'Models/Common/Common.model';
import type { IUserWithMetadata } from 'Models/Users/Users.model';

export class CountsService {
  constructor(
    @Inject(CountsClient) private readonly client: CountsClient,
  ) {}

  public async getCounts(
    tableName: string,
    variantIdCol: string,
    variantId: string,
    user: IUserWithMetadata,
  ): Promise<ICounts> {
    try {
      const counts = await this.client.getCounts(
        tableName,
        variantIdCol,
        variantId,
        user,
      );
      return counts;
    } catch {
      return {
        reportedCount: 0,
        targetableCount: 0,
      };
    }
  }
}
