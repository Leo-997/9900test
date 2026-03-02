import { Inject, Injectable } from '@nestjs/common';
import { BiosamplesClient } from 'Clients/Analysis/Biosamples.client';
import {
  IBiosample, IBiosampleFilters, IPipeline, IPipelinesFilters,
} from 'Models/Analysis/Biosamples.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';

@Injectable()
export class BiosamplesService {
  constructor(
    @Inject(BiosamplesClient) private readonly biosamplesClient: BiosamplesClient,
  ) {}

  public async getBiosamples(
    filters: IBiosampleFilters,
    user: IUserWithMetadata,
  ): Promise<IBiosample[]> {
    return this.biosamplesClient.getBiosamples(filters, user)
      .then((biosamples) => Promise.all(biosamples.map(async (biosample) => ({
        ...biosample,
        aliases: await this.biosamplesClient.getBiosampleAliases(biosample.biosampleId, user),
      }))));
  }

  public async getBiosampleCount(
    filters: IBiosampleFilters,
    user: IUserWithMetadata,
  ): Promise<number> {
    return this.biosamplesClient.getBiosampleCount(filters, user);
  }

  public async getPipelines(
    filters: IPipelinesFilters,
    user: IUserWithMetadata,
  ): Promise<IPipeline[]> {
    return this.biosamplesClient.getPipelines(filters, user);
  }

  public async getBiosampleById(id: string, user: IUserWithMetadata): Promise<IBiosample> {
    return this.biosamplesClient.getBiosampleById(id, user);
  }
}
