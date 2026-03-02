import { Injectable } from '@nestjs/common';

import { PathwaysCurationClient } from 'Clients/Curation/Pathways/Pathways.client';
import { IGetRnaPathwaysQuery } from 'Models/Curation/Pathways/Requests/GetRnaPathwaysQuery.model';
import { IRnaPathway } from 'Models/Curation/Pathways/RnaPathways.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';

@Injectable()
export class PathwaysCurationService {
  constructor(private readonly pathwaysClient: PathwaysCurationClient) {}

  public async getRnaPathways(
    biosampleId: string,
    filters: IGetRnaPathwaysQuery,
    user: IUserWithMetadata,
    page: number,
    limit: number,
  ): Promise<IRnaPathway[]> {
    return this.pathwaysClient.getRnaPathways(biosampleId, filters, user, page, limit);
  }

  public async getRnaPathwaysCount(
    biosampleId: string,
    filters: IGetRnaPathwaysQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    return this.pathwaysClient.getRnaPathwaysCount(biosampleId, filters, user);
  }
}
