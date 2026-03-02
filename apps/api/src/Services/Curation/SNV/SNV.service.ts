import { Injectable } from '@nestjs/common';

import { SnvCurationClient } from 'Clients/Curation/SNV/SNV.client';
import { ISomaticSnv, type SNVVariantSeenInBiosampleDTO } from 'Models/Curation/SNV/CuratedSampleSomaticSNV.model';

import { ICuratedSampleSomaticSnvsQuery } from 'Models/Curation/SNV/Requests/CuratedSampleSomaticSNVsQuery.model';
import { IUpdateCuratedSampleSomaticSNVsByIdBody } from 'Models/Curation/SNV/Requests/UpdateCuratedSampleSomaticSNVsByIdBody.model';

import { HeliumSummary } from 'Models/Curation/Misc.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import type { VariantSeenInBiosample } from '@zero-dash/types/dist/src/variants/Variants.types';

@Injectable()
export class SnvCurationService {
  constructor(
    private readonly snvClient: SnvCurationClient,
  ) {}

  public async getSampleHeliumSummary(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<HeliumSummary> {
    return this.snvClient.getSampleHeliumSummary(biosampleId, user);
  }

  public async getCuratedSampleSomaticSnvs(
    biosampleId: string,
    filters: ICuratedSampleSomaticSnvsQuery,
    user: IUserWithMetadata,
    page: number,
    limit: number,
  ): Promise<ISomaticSnv[]> {
    return this.snvClient.getCuratedSampleSomaticSnvs(
      biosampleId,
      filters,
      user,
      page,
      limit,
    ).then(async (snvs) => Promise.all(snvs.map(async (snv) => (
      this.hydrateSnv(snv, user)
    ))));
  }

  public async getCuratedSampleSomaticSnvByVariantId(
    biosampleId: string,
    variantId: string,
    user: IUserWithMetadata,
  ): Promise<ISomaticSnv> {
    return this.snvClient.getCuratedSampleSomaticSnvByVariantId(
      biosampleId,
      variantId,
      user,
    ).then(async (snv) => (
      this.hydrateSnv(snv, user)
    ));
  }

  private async hydrateSnv(
    snv: ISomaticSnv,
    user: IUserWithMetadata,
  ): Promise<ISomaticSnv> {
    const [
      counts,
      germlineCounts,
      reportableCounts,
    ] = await Promise.all([
      this.snvClient.getCountsByVariantId(snv.variantId, user),
      this.snvClient.getCountsByVariantId(snv.variantId, user, true),
      this.snvClient.getReportableCountsByVariantId(
        snv.variantId,
        user,
      ),
    ]);

    return {
      ...snv,
      ...reportableCounts,
      counts,
      germlineCounts,
    };
  }

  public async getCuratedSampleSomaticSnvsCount(
    biosampleId: string,
    filters: ICuratedSampleSomaticSnvsQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    return this.snvClient.getCuratedSampleSomaticSnvsCount(biosampleId, filters, user);
  }

  public getSeenInByVariantId(
    variantId: string,
    user: IUserWithMetadata,
    query: SNVVariantSeenInBiosampleDTO,
  ): Promise<VariantSeenInBiosample[]> {
    return this.snvClient.getSeenInByVariantId(variantId, user, query);
  }

  public updateCuratedSampleSomaticSnvById(
    updateFields: IUpdateCuratedSampleSomaticSNVsByIdBody,
    snvId: number,
    biosampleId: string,
  ): Promise<number> {
    return this.snvClient.updateCuratedSampleSomaticSnvById(
      updateFields,
      snvId,
      biosampleId,
    );
  }

  public clearSnvsPathclass(
    biosampleId: string,
  ): Promise<number> {
    return this.snvClient.clearSnvsPathclass(biosampleId);
  }
}
