import { BadRequestException, Injectable } from '@nestjs/common';

import { CnvCurationClient } from 'Clients/Curation/CNV/CNV.client';
import { NotFoundError } from 'Errors/NotFound.error';
import { ISomaticCnv } from 'Models/Curation/CNV/CuratedSampleSomaticCnv.model';

import { ICuratedSampleSomaticCnvsQuery } from 'Models/Curation/CNV/Requests/CuratedSampleSomaticCnvsQuery.model';
import {
  IUpdateSampleSomaticCnv,
} from 'Models/Curation/CNV/Requests/UpdateSampleSomaticCnvBody.model';
import { CNVSummary } from 'Models/Curation/Misc.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';

@Injectable()
export class CnvCurationService {
  constructor(private readonly cnvClient: CnvCurationClient) {}

  public async getCuratedSampleSomaticCnvs(
    biosampleId: string,
    filters: ICuratedSampleSomaticCnvsQuery,
    user: IUserWithMetadata,
    page: number,
    limit: number,
  ): Promise<ISomaticCnv[]> {
    return this.cnvClient.getCuratedSampleSomaticCnvs(
      biosampleId,
      filters,
      user,
      page,
      limit,
    );
  }

  public async getCuratedSampleSomaticCnvCount(
    biosampleId: string,
    filters: ICuratedSampleSomaticCnvsQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    return this.cnvClient.getCuratedSampleSomaticCnvCount(
      biosampleId,
      filters,
      user,
    );
  }

  public async getCuratedSampleSomaticCnvByVariantId(
    biosampleId: string,
    variantId: number,
    user: IUserWithMetadata,
  ): Promise<ISomaticCnv> {
    const somaticCnv = await this.cnvClient.getCuratedSampleSomaticCnvByVariantId(
      biosampleId,
      variantId,
      user,
    );
    if (somaticCnv) {
      return somaticCnv;
    }
    throw new NotFoundError('Curated Sample Somatic CNV record not found');
  }

  public async getSampleCopyNumberSummary(
    biosampleId: string,
  ): Promise<CNVSummary> {
    return this.cnvClient.getSampleCopyNumberSummary(biosampleId);
  }

  public async updateCuratedSampleSomaticCnvByVariantId(
    cnvFieldsToUpdate: IUpdateSampleSomaticCnv,
    variantId: number,
    biosampleId: string,
  ): Promise<number> {
    if (Object.values(cnvFieldsToUpdate).every((v) => v === undefined)) {
      throw new BadRequestException(
        'At least one property must be defined',
      );
    }
    const numRowsUpdated = await this.cnvClient.updateCuratedSampleSomaticCnvByVariantId(
      cnvFieldsToUpdate,
      variantId,
      biosampleId,
    );

    if (numRowsUpdated) {
      return numRowsUpdated;
    }

    throw new NotFoundError('Could not find Somatic CNV variant to update');
  }

  public clearCnvsPathclass(
    biosampleId: string,
  ): Promise<number> {
    return this.cnvClient.clearCnvsPathclass(biosampleId);
  }
}
