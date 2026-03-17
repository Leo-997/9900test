import { BadRequestException, Injectable } from '@nestjs/common';
import { GermlineSVCurationClient } from 'Clients/Curation/SV/GermlineSv.client';
import { threadTypes } from 'Constants/Comments/Comments.constants';
import { NotFoundError } from 'Errors/NotFound.error';
import { IGermlineSV, IGermlineSVSummary } from 'Models/Curation/GermlineSV/GermlineSvSample.model';
import { ICuratedSampleGermlineSVQuery } from 'Models/Curation/GermlineSV/Requests/GermlineSvSampleQuery.model';
import { IUpdateGermlineSVSample } from 'Models/Curation/GermlineSV/Requests/UpdateGermlineSVBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { CommentsService } from 'Services/Comments/Comments.service';
import { EvidenceService } from 'Services/Evidence/Evidence.service';

@Injectable()
export class GermlineSVCurationService {
  constructor(
    private readonly germlineSVClient: GermlineSVCurationClient,
    private readonly evidenceService: EvidenceService,
    private readonly commentsService: CommentsService,
  ) {}

  public async getGermlineSVs(
    biosampleId: string,
    filters: ICuratedSampleGermlineSVQuery,
    user: IUserWithMetadata,
    page: number,
    limit: number,
  ): Promise<IGermlineSV[]> {
    const parentSVs = await this.germlineSVClient.getGermlineSVs(
      biosampleId,
      filters,
      user,
      page,
      limit,
    );
    return Promise.all(
      parentSVs.map((parentSV) => (
        this.germlineSVClient.getGermlineSVs(biosampleId, { parentId: parentSV.internalId }, user)
          .then((svs) => ({
            ...parentSV,
            childSVs: svs,
          }))
      )),
    );
  }

  public async getSampleGermlineSVById(
    biosampleId: string,
    internalId: string,
    user: IUserWithMetadata,
  ): Promise<IGermlineSV> {
    const germlineSV = await this.germlineSVClient.getSampleGermlineSVById(
      biosampleId,
      internalId,
      user,
    );

    if (germlineSV === undefined) {
      throw new NotFoundError('Could not find Germline SV sample');
    }

    return germlineSV;
  }

  public async getGermlineSVSummary(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IGermlineSVSummary> {
    return this.germlineSVClient.getGermlineSVSummary(biosampleId, user);
  }

  public async updateGermlineSVById(
    svFieldsToUpdate: IUpdateGermlineSVSample,
    biosampleId: string,
    internalId: string,
  ): Promise<number> {
    if (Object.values(svFieldsToUpdate).every((v) => v === undefined)) {
      throw new BadRequestException(
        'At least one property must be defined',
      );
    }
    const numRowsUpdated = await this.germlineSVClient.updateGermlineSVById(
      svFieldsToUpdate,
      biosampleId,
      internalId,
    );

    if (numRowsUpdated) {
      return numRowsUpdated;
    }

    throw new NotFoundError('Could not find RNA sample to update');
  }

  public async promoteGermlineSV(
    biosampleId: string,
    internalId: string,
    analysisSetId: string,
    currentUser: IUserWithMetadata,
  ): Promise<void> {
    const trx = await this.germlineSVClient.createTransaction();
    try {
      const {
        newParentVariantId,
        oldParentVariantId,
      } = await this.germlineSVClient.promoteGermlineSV(biosampleId, internalId, currentUser);

      await Promise.all(threadTypes.map((threadType) => (
        this.commentsService.moveCommentsToThread(
          {
            entityType: ['GERMLINE_SV'],
            threadType: [threadType],
            entityId: oldParentVariantId.toString(),
            analysisSetIds: [analysisSetId],
          },
          {
            entityType: 'GERMLINE_SV',
            threadType,
            entityId: newParentVariantId.toString(),
            analysisSetId,
            biosampleId,
          },
          currentUser,
          trx,
        )
      )));
      await this.evidenceService.swapEvidenceVariantId(
        analysisSetId,
        'GERMLINE_SV',
        oldParentVariantId,
        newParentVariantId,
      );
      await trx.commit();
    } catch {
      trx.rollback();
      throw new BadRequestException('Cannot promote provided Germline SV');
    }
  }

  public async getSampleGermlineSVsCount(
    biosampleId: string,
    filters: ICuratedSampleGermlineSVQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    return this.germlineSVClient.getSampleGermlineSVsCount(biosampleId, filters, user);
  }

  public clearSvsPathclass(
    biosampleId: string,
  ): Promise<number> {
    return this.germlineSVClient.clearSvsPathclass(biosampleId);
  }
}
