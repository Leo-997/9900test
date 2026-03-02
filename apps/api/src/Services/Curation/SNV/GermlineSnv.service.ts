import { BadRequestException, Injectable } from '@nestjs/common';

import { GermlineSnvCurationClient } from 'Clients/Curation/SNV/GermlineSnv.client';
import { NotFoundError } from 'Errors/NotFound.error';
import { IGermlineSnv, IReportableGermlineSNV } from 'Models/Curation/GermlineSnv/CuratedSampleGermlineSnv.model';
import { IChromPosRefAlt } from 'Models/Curation/GermlineSnv/Requests/ChromosomePosition.model';
import { ICuratedSampleGermlineSnvsQuery } from 'Models/Curation/GermlineSnv/Requests/CuratedSampleGermlineSnvQuery.model';
import { GetVariantZygosityQuery, IGetVariantZygosityResp } from 'Models/Curation/GermlineSnv/Requests/GetVariantZygosityQuery.model';
import { IUpdateSampleGermlineSnv } from 'Models/Curation/GermlineSnv/Requests/UpdateSampleGermlineSnvBody.model';
import { HeliumSummary } from 'Models/Curation/Misc.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';

@Injectable()
export class GermlineSnvService {
  constructor(private readonly germlineSnvClient: GermlineSnvCurationClient) {}

  public async getSampleHeliumSummary(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<HeliumSummary> {
    return this.germlineSnvClient.getSampleHeliumSummary(biosampleId, user);
  }

  public async getReportableGermlineSnvs(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IReportableGermlineSNV[]> {
    return this.germlineSnvClient.getReportableGermlineSnvs(biosampleId, user);
  }

  public async getCuratedSampleGermlineSnvs(
    biosampleId: string,
    filters: ICuratedSampleGermlineSnvsQuery,
    user: IUserWithMetadata,
    page: number,
    limit: number,
  ): Promise<IGermlineSnv[]> {
    try {
      return this.germlineSnvClient.getGermlineSnvs(biosampleId, filters, user, page, limit);
    } catch {
      throw new BadRequestException('Unable to fetch data. Check request and try again later');
    }
  }

  public async getCuratedSampleGermlineSnvsCount(
    biosampleId: string,
    filters: ICuratedSampleGermlineSnvsQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    try {
      return this.germlineSnvClient.getCuratedSampleGermlineSnvsCount(
        biosampleId,
        filters,
        user,
      );
    } catch {
      throw new BadRequestException('Unable to fetch data. Check request and try again later');
    }
  }

  public async getCuratedSampleGermlineSnvByVariantId(
    biosampleId: string,
    cpra: IChromPosRefAlt,
    user: IUserWithMetadata,
  ): Promise<IGermlineSnv> {
    try {
      const germlineSnv = await this.germlineSnvClient.getCuratedSampleGermlineSnvByVariantId(
        biosampleId,
        cpra,
        user,
      );

      if (germlineSnv) {
        return germlineSnv;
      }
      throw new NotFoundError('Curated Sample Germline SNV record not found');
    } catch {
      throw new NotFoundError('Curated Sample Germline SNV record not found');
    }
  }

  public async getVariantZygosity(
    matchedNormalId: string,
    query: GetVariantZygosityQuery,
    user: IUserWithMetadata,
  ): Promise<IGetVariantZygosityResp[]> {
    return this.germlineSnvClient.getVariantZygosity(
      matchedNormalId,
      query,
      user,
    );
  }

  public async updateCuratedSampleGermlineSnvByVariantId(
    snvFieldsToUpdate: IUpdateSampleGermlineSnv,
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<number> {
    try {
      const result = this.germlineSnvClient.updateCuratedSampleGermlineSnvByVariantId(
        snvFieldsToUpdate,
        biosampleId,
        user,
      );

      if (result) {
        return result;
      }
      throw new NotFoundError('Could not find Germline SNV variant to update');
    } catch {
      throw new NotFoundError('Could not find Germline SNV variant to update');
    }
  }

  public clearSnvsPathclass(
    biosampleId: string,
  ): Promise<number> {
    return this.germlineSnvClient.clearSnvsPathclass(biosampleId);
  }
}
