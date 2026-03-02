import { BadRequestException, Injectable } from '@nestjs/common';
import { SVClient } from 'Clients/Curation/SV/SV.client';
import { threadTypes } from 'Constants/Comments/Comments.constants';
import { NotFoundError } from 'Errors/NotFound.error';
import { ICuratedSampleSomaticSVQuery } from 'Models/Curation/SV/Requests/SVSampleQuery.model';
import { IUpdateSVSample } from 'Models/Curation/SV/Requests/UpdateSVBody.model';
import {
  ISomaticSV,
  ISomaticSVSummary,
} from 'Models/Curation/SV/SVSample.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { CommentsService } from 'Services/Comments/Comments.service';
import { EvidenceService } from 'Services/Evidence/Evidence.service';

@Injectable()
export class SVService {
  constructor(
    private readonly svClient: SVClient,
    private readonly evidenceService: EvidenceService,
    private readonly commentsService: CommentsService,
  ) {}

  public async getSampleSVs(
    biosampleId: string,
    filters: ICuratedSampleSomaticSVQuery,
    user: IUserWithMetadata,
    page: number,
    limit: number,
  ): Promise<ISomaticSV[]> {
    const parentSVs = await this.svClient.getSampleSVs(biosampleId, filters, user, page, limit);
    const promises: Promise<void>[] = [];
    for (const parentSV of parentSVs) {
      promises.push(
        this.svClient.getSampleSVs(biosampleId, { parentId: parentSV.internalId }, user)
          .then((svs) => {
            parentSV.childSVs = svs;
          }),
      );
    }
    await Promise.all(promises);
    return parentSVs;
  }

  public async getSampleSVsCount(
    biosampleId: string,
    filters: ICuratedSampleSomaticSVQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    return this.svClient.getSampleSVsCount(biosampleId, filters, user);
  }

  public async getSampleSVById(
    biosampleId: string,
    internalId: number,
    user: IUserWithMetadata,
  ): Promise<ISomaticSV> {
    const sv = await this.svClient.getSampleSVById(biosampleId, internalId, user);

    if (sv === undefined) {
      throw new NotFoundError('Could not find SV sample');
    }

    return sv;
  }

  public async getSampleSVSummary(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<ISomaticSVSummary> {
    return this.svClient.getSVSummary(biosampleId, user);
  }

  public async updateSampleSVById(
    svFieldsToUpdate: IUpdateSVSample,
    biosampleId: string,
    internalId: number,
  ): Promise<number> {
    if (Object.values(svFieldsToUpdate).every((v) => v === undefined)) {
      throw new BadRequestException(
        'At least one property must be defined',
      );
    }
    const numRowsUpdated = await this.svClient.updateSampleSVById(
      svFieldsToUpdate,
      biosampleId,
      internalId,
    );

    if (numRowsUpdated) {
      return numRowsUpdated;
    }

    throw new NotFoundError('Could not find RNA sample to update');
  }

  public async promoteSV(
    biosampleId: string,
    analysisSetId: string,
    internalId: number,
    currentUser: IUserWithMetadata,
  ): Promise<void> {
    const trx = await this.svClient.createTransaction();
    try {
      const {
        oldParentVariantId,
        newParentVariantId,
      } = await this.svClient.promoteSV(biosampleId, internalId, currentUser);
      await Promise.all(threadTypes.map((threadType) => (
        this.commentsService.moveCommentsToThread(
          {
            analysisSetIds: [analysisSetId],
            entityType: ['SV'],
            threadType: [threadType],
            entityId: oldParentVariantId.toString(),
          },
          {
            analysisSetId,
            biosampleId,
            entityType: 'SV',
            threadType,
            entityId: newParentVariantId.toString(),
          },
          currentUser,
          trx,
        )
      )));
      await this.evidenceService.swapEvidenceVariantId(
        analysisSetId,
        'SV',
        oldParentVariantId,
        newParentVariantId,
      );
      await trx.commit();
    } catch {
      trx.rollback();
      throw new BadRequestException('Cannot promote provided SV');
    }
  }

  public clearSvsPathclass(
    biosampleId: string,
  ): Promise<number> {
    return this.svClient.clearSvsPathclass(biosampleId);
  }
}
