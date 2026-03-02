import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { GeneListsClient } from 'Clients/GeneLists/GeneLists.client';
import { IncomingHttpHeaders } from 'http';
import {
  ICreateGeneListBody, IGene, IGeneList, IGetGeneListFilters,
  IGetPanelReportableNotesQuery,
  IPanelReportableNote,
  IUpdateGeneNote,
  IUpdatePanelReprotableNote,
} from 'Models/GeneLists/GeneLists.model';
import { CACHE_SERVICE } from 'Modules/Cache/Cache.module';
import { normalizeString } from 'Utils/string.util';
import { CacheService } from '../Cache/Cache.service';

@Injectable()
export class GeneListsService {
  private readonly logger = new Logger(GeneListsService.name);

  constructor(
    @Inject(GeneListsClient) private readonly geneListsClient: GeneListsClient,
    @Inject(CACHE_SERVICE) private readonly cacheService: CacheService,
    private httpService: HttpService,
  ) {}

  public async getGeneLists(
    filters: IGetGeneListFilters,
    headers: IncomingHttpHeaders,
  ): Promise<IGeneList[]> {
    return this.geneListsClient.getGeneLists(filters)
      .then((resp) => Promise.all(resp.map(async (list) => ({
        ...list,
        genes: (
          filters.includeGenes === undefined || filters.includeGenes
            ? await this.geneListsClient.getGenes(list.versionId)
              .then(async (genes) => {
                const geneDetails = await this.getGenes(genes.map((g) => g.geneId), headers);
                return genes.map((g) => ({
                  ...g,
                  ...geneDetails.find((gene) => gene.geneId === g.geneId),
                }));
              })
              .catch((e) => {
                this.logger.log(e);
                return [];
              })
            : []
        ),
      }))));
  }

  public async getGeneListById(
    id: string,
    headers: IncomingHttpHeaders,
  ): Promise<IGeneList> {
    return this.geneListsClient.getGeneListById(id)
      .then(async (resp) => {
        if (resp) {
          return {
            ...resp,
            genes: await this.geneListsClient.getGenes(resp.versionId)
              .then(async (genes) => {
                const geneDetails = await this.getGenes(genes.map((g) => g.geneId), headers);
                return genes.map((g) => ({
                  ...g,
                  ...geneDetails.find((gene) => gene.geneId === g.geneId),
                }));
              })
              .catch((e) => {
                this.logger.log(e);
                return [];
              }),
          };
        }
        return resp;
      });
  }

  private async getGenes(
    geneIds: number[],
    headers: IncomingHttpHeaders,
  ): Promise<IGene[]> {
    if (geneIds.length === 0) {
      return [];
    }
    const cachePrefix = `${GeneListsService.name}.${this.getGenes.name}`;
    const cacheObj = {
      geneIds: geneIds.sort(),
    };
    const cachedResult = await this.cacheService.getResults<IGene[]>(
      cachePrefix,
      cacheObj,
    );
    if (cachedResult) {
      return cachedResult;
    }
    const url = `${normalizeString(process.env.VITE_BASE_URL)}/genes`;
    try {
      const resp = await this.httpService.axiosRef.post<IGene[]>(
        url,
        {
          geneIds,
        },
        {
          headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: headers.authorization,
          },
        },
      );
      await this.cacheService.setResults(
        cachePrefix,
        cacheObj,
        resp.data,
      );
      return resp.data;
    } catch (e) {
      this.logger.error(e);
      return [];
    }
  }

  public async createGeneList(geneList: ICreateGeneListBody): Promise<IGeneList> {
    return this.geneListsClient.createGeneList(geneList);
  }

  public getReportableNotes(
    filters: IGetPanelReportableNotesQuery,
  ): Promise<IPanelReportableNote[]> {
    return this.geneListsClient.getReportableNotes(filters);
  }

  public async updateReportableNote(
    body: IUpdatePanelReprotableNote,
  ): Promise<IPanelReportableNote> {
    return this.geneListsClient.updateReportableNote(body);
  }

  public async updateGeneNote(
    body: IUpdateGeneNote,
  ): Promise<void> {
    return this.geneListsClient.updateGeneNote(body);
  }
}
