import { Inject, Injectable } from '@nestjs/common';

import { GenesClient } from 'Clients/Curation/Genes/Genes.client';
import {
  IExtendedGene, IFilteredGenes, IGene, IGeneList,
} from 'Models/Curation/Genes/Gene.model';
import { AddGeneListBodyDTO } from 'Models/Curation/Genes/Requests/AddGeneListBody.model';
import {
  IGetAllGeneListsQuery, IGetAllGenesQuery,
  IGetGenesByIdsQuery,
} from 'Models/Curation/Genes/Requests/GetAllGenesQuery.model';
import { IUser } from 'Models/Users/Users.model';
import { CACHE_SERVICE } from 'Modules/Cache/Cache.module';
import { CacheService } from 'Services/Cache/Cache.service';

@Injectable()
export class GenesService {
  constructor(
    private readonly genesClient: GenesClient,
    @Inject(CACHE_SERVICE) private readonly cacheService: CacheService,
  ) {}

  public async getGenes(
    filters: IGetAllGenesQuery,
    page: number,
    limit: number,
  ): Promise<IGene[]> {
    return this.genesClient.getGenes(filters, page, limit);
  }

  public async getGene(geneId: number): Promise<IExtendedGene> {
    return this.genesClient.getGene(geneId);
  }

  public async getFilteredGenes(genes: string[]): Promise<IFilteredGenes> {
    return this.genesClient.getFilteredGenes(genes);
  }

  public async getGeneLists(
    filters: IGetAllGeneListsQuery,
    page: number,
    limit: number,
  ): Promise<IGeneList[]> {
    if (filters.namesOnly) {
      return this.genesClient.getGeneListNames(filters, page, limit);
    }
    return this.genesClient.getGeneLists(filters, page, limit);
  }

  public async addGeneList(geneListData: AddGeneListBodyDTO, user: IUser): Promise<void> {
    return this.genesClient.addGeneList(geneListData, user);
  }

  public async getGenesByIds(filters: IGetGenesByIdsQuery): Promise<IGene[]> {
    const cachePrefix = `${GenesService.name}.${this.getGenesByIds.name}`;
    const cacheObj = {
      geneIds: filters.geneIds.sort(),
    };
    // Check cache first
    const cachedResult = await this.cacheService.getResults<IGene[]>(
      cachePrefix,
      cacheObj,
    );
    if (cachedResult) {
      return cachedResult;
    }
    const res = await this.genesClient.getGenesByIds(filters);
    await this.cacheService.setResults(
      cachePrefix,
      cacheObj,
      res,
    );
    return res;
  }
}
