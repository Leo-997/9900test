/* eslint-disable no-await-in-loop */
import {
  BadRequestException, Headers, Inject, Injectable, Logger, NotFoundException,
} from '@nestjs/common';
import { RecommendationClient } from 'Clients/Recommendation/Recommendation.client';
import { IncomingHttpHeaders } from 'http';
import { Knex } from 'knex';
import {
  CreateRecommendationDTO,
  CreateRecommendationLinkDTO,
  FetchRecommendationDTO,
  IDiagnosisRecommendation,
  IFetchRecommendation,
  IGroupRecommendation,
  RecLinkEntityType,
  UpdateRecommendationDTO,
  UpdateRecommendationOrderDTO,
} from 'Models/Recommendation/Recommendation.model';
import { InterpretationsService } from 'Services/Interpretation/Interpretation.service';
import { IUser, IUserWithMetadata } from '../../Models';
import { EvidenceService } from '../Evidence/Evidence.service';
import { MolecularAlterationsService } from '../MolecularAlterations/MolecularAlterations.service';
import { TherapyService } from '../Therapy/Therapy.service';
import { TrialsService } from '../Trials/Trials.service';

@Injectable()
export class RecommendationService {
  constructor(
    @Inject(RecommendationClient) private readonly recommendationClient: RecommendationClient,
    @Inject(TherapyService) private readonly therapyService: TherapyService,
    @Inject(TrialsService) private readonly trialsService: TrialsService,
    @Inject(EvidenceService) private readonly evidenceService: EvidenceService,
    @Inject(InterpretationsService) private readonly interpretationsService: InterpretationsService,
    @Inject(MolecularAlterationsService)
    private readonly molAlterationService: MolecularAlterationsService,
  ) { }

  public async createRecommendationLink(
    clinicalVersionId: string,
    body: CreateRecommendationLinkDTO,
    trx?: Knex.Transaction,
  ): Promise<void> {
    await this.recommendationClient.createRecommendationLink(
      clinicalVersionId,
      body,
      trx,
    );
  }

  public async deleteRecommendationLink(
    recommendationId: string,
    clinicalVersionId: string,
    entityType?: RecLinkEntityType,
    entityId?: string,
    trx?: Knex.Transaction,
  ): Promise<void> {
    await this.recommendationClient.deleteRecommendationLink(
      recommendationId,
      clinicalVersionId,
      entityType,
      entityId,
      trx,
    );
  }

  public async createRecommendation(
    clinicalVersionId: string,
    createRecommendationBody: CreateRecommendationDTO,
    currentUser: IUserWithMetadata,
  ): Promise<string> {
    if (!createRecommendationBody.type) {
      throw new BadRequestException('Recommendation type must be provided');
    }

    const trx = await this.recommendationClient.openKnexTransaction();

    try {
      let therapyId: string | null = null;
      let diagnosisId: string | null = null;
      let { molAlterationGroupId } = createRecommendationBody;

      if (createRecommendationBody.type === 'THERAPY') {
        therapyId = await this.therapyService.createTherapy(
          createRecommendationBody.therapy,
          currentUser,
          trx,
        );
        if (createRecommendationBody.evidence) {
          await Promise.all(createRecommendationBody.evidence.map((e) => (
            this.evidenceService.createEvidence(
              {
                externalId: e,
                entityType: 'THERAPY',
                entityId: therapyId,
              },
              currentUser,
              trx,
            )
          )));
        }
      } else if (createRecommendationBody.type === 'CHANGE_DIAGNOSIS') {
        diagnosisId = await this.addDiagnosisRecommendation(
          createRecommendationBody,
          currentUser,
          trx,
        );
      }

      if (createRecommendationBody.targets?.length) {
        molAlterationGroupId = await this.molAlterationService.createMolecularAlterationsGroup(
          clinicalVersionId,
          { alterations: createRecommendationBody.targets },
          currentUser,
        );
      }

      const recId = await this.recommendationClient.createRecommendation(
        clinicalVersionId,
        {
          ...createRecommendationBody,
          molAlterationGroupId,
        },
        therapyId,
        diagnosisId,
        currentUser,
        trx,
      );

      // Create the link for discussion recs AFTER the initial
      // rec has been created
      if (createRecommendationBody.type === 'GROUP') {
        await this.addGroupRecommendation(
          recId,
          createRecommendationBody.recommendations.map((id, i) => ({
            id,
            order: i,
          })),
          trx,
        );
      } else if (createRecommendationBody.type === 'GERMLINE') {
        await this.recommendationClient.createGermlineRecOptions(
          recId,
          createRecommendationBody.germlineRecOptions,
          trx,
        );
      }

      if (createRecommendationBody.links) {
        await Promise.all(
          createRecommendationBody
            .links
            .map((l) => this.createRecommendationLink(
              clinicalVersionId,
              {
                ...l,
                recommendationId: recId,
              },
              trx,
            )),
        );
      }

      await this.recommendationClient.closeKnexTransaction(trx);

      return recId;
    } catch {
      await trx.rollback();
      throw new BadRequestException('Invalid recommendation data');
    }
  }

  private async addDiagnosisRecommendation(
    data: CreateRecommendationDTO,
    currentUser: IUser,
    trx: Knex.Transaction,
  ): Promise<string> {
    const diagnosisId = await this.recommendationClient.createDiagnosisRecommendation(
      data as Omit<IDiagnosisRecommendation, 'id'>,
      currentUser,
      trx,
    );

    if (!diagnosisId) {
      throw new BadRequestException('Change diagnosis data invalid');
    }

    return diagnosisId;
  }

  private async addGroupRecommendation(
    recId: string,
    childRecs: Pick<IGroupRecommendation, 'id' | 'order'>[],
    trx: Knex.Transaction,
  ): Promise<void> {
    await this.recommendationClient.createGroupRecommendation(
      recId,
      childRecs,
      trx,
    );
  }

  public async getRecommendationById(
    clinicalVersionId: string,
    recommendationId: string,
    headers: IncomingHttpHeaders,
    user: IUserWithMetadata,
    hydrate = true,
  ): Promise<IFetchRecommendation> {
    let result = await this.recommendationClient.getRecommendationById(
      clinicalVersionId,
      recommendationId,
    );
    if (!result) {
      throw new NotFoundException(`Recommendation ${recommendationId} not found`);
    }

    // Hydrate recs
    if (hydrate) {
      result = await this.hydrateRecommendation(result, headers, user);
    }

    return result;
  }

  private async hydrateRecommendation(
    rec: IFetchRecommendation,
    headers: IncomingHttpHeaders,
    user: IUserWithMetadata,
  ): Promise<IFetchRecommendation> {
    const childRecs = await this.recommendationClient.getChildRecommendations(
      rec.clinicalVersionId,
      rec.id,
    );

    return {
      ...rec,
      targets: rec.molAlterationGroupId
        ? await this.molAlterationService.getMolecularAlterations(
          rec.clinicalVersionId,
          {
            molAlterationGroupId: rec.molAlterationGroupId,
          },
        )
        : rec.targets,
      therapy: rec.therapyId
        ? await this.therapyService.getTherapyById(rec.therapyId, headers)
        : rec.therapy,
      recommendations: rec.type === 'GROUP'
        ? await Promise.all(childRecs.map((r) => (
          this.hydrateRecommendation(r, headers, user)
        )))
        : rec.recommendations,
      evidence: rec.type === 'THERAPY'
        ? (await this.evidenceService.getEvidence({
          entityTypes: ['THERAPY'],
          entityIds: [rec.therapyId],
        }, user)).map((e) => e.externalId)
        : undefined,
      germlineRecOptions: rec.type === 'GERMLINE'
        ? await this.recommendationClient.getGermlineRecOptions(rec.id)
        : undefined,
      links: await this.recommendationClient.getRecommendationLinks(rec.id),
    };
  }

  public async getRecommendationsByAddendumId(
    clinicalVersionId: string,
    addendumId: string,
    headers: IncomingHttpHeaders,
  ): Promise<IFetchRecommendation[]> {
    const results = await this.recommendationClient.getRecommendationsByAddendumId(
      clinicalVersionId,
      addendumId,
    );
    if (!results) {
      throw new NotFoundException(`Past recommendations not found for addendum ${addendumId}`);
    }

    for (const res of results) {
      if (res.therapyId) {
        res.therapy = await this.therapyService.getTherapyById(res.therapyId, headers);
      }
    }

    return results;
  }

  public async getAllRecommendations(
    clinicalVersionId: string,
    filters: FetchRecommendationDTO,
    page: number,
    limit: number,
    headers: IncomingHttpHeaders,
    user: IUserWithMetadata,
  ): Promise<IFetchRecommendation[]> {
    const results = await this.recommendationClient.getAllRecommendations(
      clinicalVersionId,
      filters,
      page,
      limit,
    );
    if (!results) {
      throw new NotFoundException('Recommendations not found');
    }

    return Promise.all(results.map((res) => this.hydrateRecommendation(res, headers, user)));
  }

  public async updateRecommendationOrder(
    clinicalVersionId: string,
    body: UpdateRecommendationOrderDTO,
  ): Promise<void> {
    return this.recommendationClient.updateRecommendationOrder(
      clinicalVersionId,
      body,
    );
  }

  public async updateRecommendation(
    clinicalVersionId: string,
    recommendationId: string,
    updateRecommendationBody: UpdateRecommendationDTO,
    currentUser: IUserWithMetadata,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<void> {
    if (Object.values(updateRecommendationBody).every((v) => v === undefined)) {
      throw new BadRequestException('Could not update recommendation. Must provide at least 1 value to update');
    }

    const trx = await this.recommendationClient.openKnexTransaction();
    try {
      const rec = await this.getRecommendationById(
        clinicalVersionId,
        recommendationId,
        headers,
        currentUser,
      );
      await this.recommendationClient.updateRecommendation(
        clinicalVersionId,
        recommendationId,
        {
          ...updateRecommendationBody,
          molAlterationGroupId:
            updateRecommendationBody.targets?.length === 0
              && !updateRecommendationBody.molAlterationGroupId
              ? null
              : updateRecommendationBody.molAlterationGroupId,
        },
        currentUser,
        trx,
      );

      if (updateRecommendationBody.targets?.length) {
        await this.molAlterationService.updateMolecularAlterationsGroup(
          clinicalVersionId,
          rec.molAlterationGroupId,
          { alterations: updateRecommendationBody.targets },
          currentUser,
          trx,
        );
      } else {
        await this.molAlterationService.deleteMolecularAlterationsGroup(
          clinicalVersionId,
          rec.molAlterationGroupId,
          trx,
        );
      }
      await this.recommendationClient.closeKnexTransaction(trx);
    } catch {
      trx.rollback();
      throw new BadRequestException(`Recommendation ${recommendationId} not updated`);
    }
  }

  public async deleteRecommendation(
    clinicalVersionId: string,
    recommendationId: string,
    currentUser: IUser,
  ): Promise<void> {
    const trx = await this.recommendationClient.openKnexTransaction();
    try {
      await this.recommendationClient.deleteRecommendation(
        clinicalVersionId,
        recommendationId,
        currentUser,
        trx,
      );
      trx.commit();
    } catch (error) {
      trx.rollback();
      throw new BadRequestException(
        `Unable to delete recommendation with id: ${recommendationId}, ${error}`,
      );
    }
  }

  public async deleteRecommendationsWithRejectedDrug(
    clinicalVersionId: string,
    drugVersionId: string,
    currentUser: IUser,
  ): Promise<void> {
    const trx = await this.recommendationClient.openKnexTransaction();
    const recIds = await this.recommendationClient
      .getRecommendationIdsWithDrugVersion(clinicalVersionId, drugVersionId);
    try {
      await Promise.all(recIds.map(
        (recId) => this.deleteRecommendation(clinicalVersionId, recId, currentUser),
      ));
      trx.commit();
    } catch (error) {
      trx.rollback();
      throw new BadRequestException(
        `Unable to delete recommendations with drug version id: ${drugVersionId}, ${error}`,
      );
    }
  }

  async cleanupOldRecords(
    retentionDays: number,
    compareColumn: string,
    logger: Logger,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const { recommendationTable, diagnosisRecTable } = this.recommendationClient.getCleanupTables();

    const recommendationDeleted = await this.cleanupOldRecommendation(
      cutoffDate,
      compareColumn,
      recommendationTable,
      logger,
    );

    const diagnosisRecommendationsDeleted = await this.cleanupOldDiagnosisRcm(
      cutoffDate,
      compareColumn,
      diagnosisRecTable,
      logger,
    );

    const totalDeleted = recommendationDeleted + diagnosisRecommendationsDeleted;
    logger.log(`Total records deleted: ${totalDeleted}`);
    return totalDeleted;
  }

  async cleanupOldDiagnosisRcm(
    cutoffDate: Date,
    compareColumn: string,
    diagnosisRecTable: string,
    logger: Logger,
  ): Promise<number> {
    let deleted = 0;
    const trx = await this.recommendationClient.openKnexTransaction();

    try {
      const oldDiagnosisRecommendationIds = await this.recommendationClient
        .getOldRecordIds(cutoffDate, compareColumn, diagnosisRecTable);
      logger.log(`Found ${oldDiagnosisRecommendationIds.length} old diagnosis recommendation to delete`);

      if (oldDiagnosisRecommendationIds.length === 0) {
        return 0;
      }

      logger.log(`Deleting old diagnosis recommendation and related records: oldDiagnosisRecommendationIds=${oldDiagnosisRecommendationIds.join(', ')}`);

      const recommendations = await this.recommendationClient
        .permanentlyDeleteRecommendationsByDiagRcmIds(oldDiagnosisRecommendationIds, trx);

      logger.log(`Deleted ${recommendations} related records in recommendation table`);

      const diagnosisRecommendations = await this.recommendationClient
        .permanentlyDeleteDiagnosisRecommendationById(oldDiagnosisRecommendationIds, trx);

      logger.log(`Deleted ${diagnosisRecommendations} diagnosis recommendation sections`);

      await trx.commit();
      deleted += recommendations + diagnosisRecommendations;
    } catch (error) {
      await trx.rollback();
      logger.error(
        `Error during diagnosis recommendation cleanup: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    logger.log(`Deleted ${deleted} old diagnosis recommendations and related records`);

    return deleted;
  }

  async cleanupOrphanedTherapyRecords(
    oldRecommendationIds: string[],
    trx: Knex.Transaction,
    logger: Logger,
  ): Promise<number> {
    const therapyIdsFromRecs = await this.recommendationClient
      .getTherapyIdsFromRecommendations(oldRecommendationIds);
    const therapyIdsStillInUse = await this.recommendationClient
      .getTherapyIdsStillInUseByRecommendations(therapyIdsFromRecs, oldRecommendationIds);
    const orphanedTherapyIds = therapyIdsFromRecs.filter(
      (id) => !therapyIdsStillInUse.includes(id),
    );

    if (orphanedTherapyIds.length === 0) {
      logger.log('No orphaned therapy records found');
      return 0;
    }

    logger.log(`Deleting orphaned therapy records: therapyIds=${orphanedTherapyIds.join(', ')}`);

    const evidenceDeleted = await this.evidenceService
      .permanentlyDeleteByEntityTypeAndEntityIds('THERAPY', orphanedTherapyIds, trx);
    const trialsDeleted = await this.trialsService
      .permanentlyDeleteByTherapyIds(orphanedTherapyIds, trx);
    const therapyDrugsAndTherapiesDeleted = await this.therapyService
      .permanentlyDeleteTherapiesAndRelatedByIds(orphanedTherapyIds, trx);
    const therapyRelatedDeleted = evidenceDeleted + trialsDeleted + therapyDrugsAndTherapiesDeleted;
    logger.log(
      `Deleted ${therapyRelatedDeleted} therapy-related records `
      + `(evidence: ${evidenceDeleted}, trials: ${trialsDeleted}, therapy_drugs+therapies: ${therapyDrugsAndTherapiesDeleted})`,
    );
    return therapyRelatedDeleted;
  }

  async cleanupOrphanedAlterationGroupRecords(
    oldRecommendationIds: string[],
    trx: Knex.Transaction,
    logger: Logger,
  ): Promise<number> {
    const molAlterationGroupIds = await this.recommendationClient
      .getMolAlterationGroupIdsFromRecommendations(oldRecommendationIds);
    const groupIdsStillInUse = await this.recommendationClient.getMolAlterationGroupIdsStillInUse(
      molAlterationGroupIds,
      oldRecommendationIds,
    );
    const orphanedAlterationGroupIds = molAlterationGroupIds.filter(
      (id) => !groupIdsStillInUse.includes(id),
    );

    if (orphanedAlterationGroupIds.length === 0) {
      logger.log('No orphaned alteration group records found');
      return 0;
    }

    logger.log(`Deleting orphaned alteration group records: alterationGroupIds=${orphanedAlterationGroupIds.join(', ')}`);

    const molAlterationsGroupDeleted = await this.interpretationsService
      .deleteMolAlterationsGroupByIds(orphanedAlterationGroupIds, trx);
    logger.log(`Deleted ${molAlterationsGroupDeleted} orphaned mol_alterations_group records`);
    return molAlterationsGroupDeleted;
  }

  async cleanupOldRecommendation(
    cutoffDate: Date,
    compareColumn: string,
    recommendationTable: string,
    logger: Logger,
  ): Promise<number> {
    const trx = await this.recommendationClient.openKnexTransaction();
    try {
      const oldRecommendationIds = await this.recommendationClient
        .getOldRecordIds(cutoffDate, compareColumn, recommendationTable);
      logger.log(`Found ${oldRecommendationIds.length} old recommendation to delete`);

      if (oldRecommendationIds.length === 0) {
        return 0;
      }

      logger.log(`Deleting old recommendation: recommendationIds=${oldRecommendationIds.join(', ')}`);

      const recommendations = await this.recommendationClient
        .permanentlyDeleteRecommendationsByRcmIds(
          oldRecommendationIds,
          trx,
        );

      logger.log(`Deleted ${recommendations} records in recommendation table`);

      const molAlterationsGroupDeleted = await this.cleanupOrphanedAlterationGroupRecords(
        oldRecommendationIds,
        trx,
        logger,
      );

      const therapyRelatedDeleted = await this.cleanupOrphanedTherapyRecords(
        oldRecommendationIds,
        trx,
        logger,
      );

      await trx.commit();
      return recommendations + molAlterationsGroupDeleted + therapyRelatedDeleted;
    } catch (error) {
      await trx.rollback();
      logger.error(
        `Error during recommendation cleanup: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 0;
    }
  }
}
