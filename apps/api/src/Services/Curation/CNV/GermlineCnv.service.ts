import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { VariantCounts, VariantSeenInBiosample } from '@zero-dash/types';
import type { PaginationDTO } from '@zero-dash/types/dist/src/common/Pagination.types';

import { GermlineCnvCurationClient } from 'Clients/Curation/CNV/GermlineCnv.client';
import { IGermlineCnv } from 'Models/Curation/GermlineCNV/CuratedSampleGermlineCnv.model';
import { ICuratedSampleGermlineCnvQuery } from 'Models/Curation/GermlineCNV/Requests/CuratedSampleGermlineCnvQuery.model';
import { IUpdateSampleGermlineCnv } from 'Models/Curation/GermlineCNV/Requests/UpdateSampleGermlineCnvBody.model';
import { Summary } from 'Models/Curation/Misc.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';

@Injectable()
export class GermlineCnvService {
  constructor(private readonly germlineCnvClient: GermlineCnvCurationClient) {}

  public async getCuratedSampleGermlineCnvs(
    biosampleId: string,
    filters: ICuratedSampleGermlineCnvQuery,
    user: IUserWithMetadata,
    page: number,
    limit: number,
  ): Promise<IGermlineCnv[]> {
    return this.germlineCnvClient.getCuratedSampleGermlineCnvs(
      biosampleId,
      filters,
      user,
      page,
      limit,
    ).then(async (cnvs) => Promise.all(cnvs.map(async (cnv) => {
      const counts = await this.getCountsByGeneId(cnv.geneId.toString(), user);
      return {
        ...cnv,
        counts,
      };
    })));
  }

  public async getCuratedSampleGermlineCnvsCount(
    biosampleId: string,
    filters: ICuratedSampleGermlineCnvQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    return this.germlineCnvClient.getCuratedSampleGermlineCnvsCount(
      biosampleId,
      filters,
      user,
    );
  }

  public async getCuratedSampleGermlineCnvByVariantId(
    biosampleId: string,
    variantId: number,
    user: IUserWithMetadata,
  ): Promise<IGermlineCnv> {
    const germlineCnv = await this.germlineCnvClient.getCuratedSampleGermlineCnvByVariantId(
      biosampleId,
      variantId,
      user,
    );

    if (germlineCnv) {
      return {
        ...germlineCnv,
        counts: await this.getCountsByGeneId(germlineCnv.geneId.toString(), user),
      };
    }
    throw new NotFoundException('Curated Sample Germline CNV record not found');
  }

  public async getSampleCopyNumberSummary(biosampleId: string): Promise<Summary> {
    return this.germlineCnvClient.getSampleCopyNumberSummary(biosampleId);
  }

  public async updateCuratedSampleGermlineCnvByVariantId(
    cnvFieldsToUpdate: IUpdateSampleGermlineCnv,
    biosampleId: string,
    variantId: number,
  ): Promise<number> {
    if (Object.values(cnvFieldsToUpdate).every((v) => v === undefined)) {
      throw new BadRequestException('At least one property must be defined');
    }
    return this.germlineCnvClient.updateCuratedSampleGermlineCnvByVariantId(
      cnvFieldsToUpdate,
      biosampleId,
      variantId,
    );
  }

  public clearCnvsPathclass(
    biosampleId: string,
  ): Promise<number> {
    return this.germlineCnvClient.clearCnvsPathclass(biosampleId);
  }

  public async getCountsByGeneId(
    variantId: string,
    user: IUserWithMetadata,
  ): Promise<VariantCounts[]> {
    return this.germlineCnvClient.getCountsByGeneId(variantId, user);
  }

  public getSeenInByGeneId(
    variantId: string,
    user: IUserWithMetadata,
    query: PaginationDTO,
  ): Promise<VariantSeenInBiosample[]> {
    return this.germlineCnvClient.getSeenInByGeneId(variantId, user, query);
  }
}
