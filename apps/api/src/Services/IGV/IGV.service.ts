import { Injectable } from '@nestjs/common';
import { IGVClient } from 'Clients/IGV/IGV.client';
import {
  SampleResponse,
} from 'Models/IGV/Requests/IGV.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';

@Injectable()
export class IGVService {
  constructor(
    private readonly igvClient: IGVClient,
  ) {}

  public async getSampleLinks(
    sampleIds: string[],
    user: IUserWithMetadata,
  ): Promise<SampleResponse> {
    return this.igvClient.getSampleLinks(sampleIds, user);
  }
}
