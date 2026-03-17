import { Inject, Injectable, Logger } from '@nestjs/common';
import { InterpretationsClient } from 'Clients/Interpretation/Interpretation.client';
import { IUser, IUserWithMetadata } from 'Models';
import {
  ICreateInterpretationBody,
  IInterpretation,
  IInterpretationQuery,
  IUpdateInterpretationBody,
  UpdateInterpretationOrderDTO,
} from 'Models/Interpretation/Interpretation.model';
import { Knex } from 'knex';
import { CommentService } from '../Comment/Comment.service';
import { MolecularAlterationsService } from '../MolecularAlterations/MolecularAlterations.service';

@Injectable()
export class InterpretationsService {
  constructor(
    @Inject(InterpretationsClient) private readonly interpretationsClient: InterpretationsClient,
    @Inject(CommentService) private readonly commentsService: CommentService,
    @Inject(MolecularAlterationsService)
    private readonly molAltService: MolecularAlterationsService,
  ) { }

  public async createInterpretation(
    clinicalVersionId: string,
    body: ICreateInterpretationBody,
    user: IUser,
  ): Promise<string> {
    return this.interpretationsClient.createInterpretation(clinicalVersionId, body, user);
  }

  public async getInterpretations(
    clinicalVersionId: string,
    query: IInterpretationQuery,
    user: IUserWithMetadata,
  ): Promise<IInterpretation[]> {
    return this.interpretationsClient.getInterpretations(clinicalVersionId, query)
      .then((resp) => (
        Promise.all(resp.map((i) => this.hydrateInterpretation(i, user)))
      ));
  }

  public async getInterpretationById(
    clinicalVersionId: string,
    id: string,
    user: IUserWithMetadata,
  ): Promise<IInterpretation> {
    return this.interpretationsClient.getInterpretationById(clinicalVersionId, id)
      .then((i) => this.hydrateInterpretation(i, user));
  }

  private async hydrateInterpretation(
    interpretation: IInterpretation,
    user: IUserWithMetadata,
  ): Promise<IInterpretation> {
    return {
      ...interpretation,
      comments: await this.commentsService.getCommentThreads(
        {
          clinicalVersionId: interpretation.clinicalVersionId,
          entityType: ['INTERPRETATION'],
          entityId: interpretation.id,
        },
        user,
      )
        .then((threads) => {
          if (threads[0]) {
            // get the comments for the thread and add the thread object
            return threads[0].comments.map((c) => ({ ...c, thread: threads[0] })) || [];
          }
          return [];
        }),
      targets: interpretation.molAlterationGroupId
        ? await this.molAltService.getMolecularAlterations(
          interpretation.clinicalVersionId,
          {
            molAlterationGroupId: interpretation.molAlterationGroupId,
          },
        ) : [],
    };
  }

  async updateInterpretationOrder(
    clinicalVersionId: string,
    body: UpdateInterpretationOrderDTO,
    user: IUser,
  ): Promise<void> {
    return this.interpretationsClient.updateInterpretationOrder(
      clinicalVersionId,
      body,
      user,
    );
  }

  public async updateInterpretation(
    clinicalVersionId: string,
    id: string,
    body: IUpdateInterpretationBody,
    user: IUser,
  ): Promise<void> {
    return this.interpretationsClient.updateInterpretation(
      clinicalVersionId,
      id,
      body,
      user,
    );
  }

  public async deleteInterpretation(
    clinicalVersionId: string,
    id: string,
    user: IUser,
  ): Promise<void> {
    await this.interpretationsClient.deleteInterpretation(
      clinicalVersionId,
      id,
      user,
    );
  }

  async cleanupOldRecords(
    retentionDays: number,
    compareColumn: string,
    logger: Logger,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const interpretationDeleted = await this.cleanupInterpretations(
      cutoffDate,
      compareColumn,
      logger,
    );
    logger.log(`Total records deleted: ${interpretationDeleted}`);
    return interpretationDeleted;
  }

  async cleanupInterpretations(
    cutoffDate: Date,
    compareColumn: string,
    logger: Logger,
  ): Promise<number> {
    const trx = await this.interpretationsClient.openKnexTransaction();
    try {
      const oldInterpretationIds = await this.interpretationsClient.getOldInterpretationIds(
        cutoffDate,
        compareColumn,
      );
      logger.log(`Found ${oldInterpretationIds.length} old interpretation comments to delete`);

      if (oldInterpretationIds.length === 0) {
        return 0;
      }

      logger.log(`Deleting old interpretation comments: interpretationIds=${oldInterpretationIds.join(', ')}`);

      // Get mol_alteration_group_id values from interpretations being deleted (before deletion)
      const molAlterationGroupIds = await this.interpretationsClient
        .getMolAlterationGroupIdsFromInterpretations(oldInterpretationIds);
      logger.log(`Found ${molAlterationGroupIds.length} unique mol_alteration_group_ids from interpretations`);

      // Check which mol_alteration_group_ids are still in use by other records (before deletion)
      const groupIdsStillInUse = await this.interpretationsClient
        .getMolAlterationGroupIdsStillInUse(molAlterationGroupIds, oldInterpretationIds);
      logger.log(`Found ${groupIdsStillInUse.length} mol_alteration_group_ids still in use`);

      // Find orphaned group IDs (not used anywhere else)
      const orphanedGroupIds = molAlterationGroupIds.filter(
        (id) => !groupIdsStillInUse.includes(id),
      );

      // Delete interpretations
      const interpretations = await this.interpretationsClient.permanentlyDeleteInterpretationByIds(
        oldInterpretationIds,
        trx,
      );
      logger.log(`Deleted ${interpretations} records in interpretation comments table`);

      // Delete orphaned mol_alterations_group records
      let molAlterationsGroupDeleted = 0;
      if (orphanedGroupIds.length > 0) {
        logger.log(`Deleting ${orphanedGroupIds.length} orphaned mol_alterations_group records: ${orphanedGroupIds.join(', ')}`);
        molAlterationsGroupDeleted = await this.interpretationsClient
          .permanentlyDeleteMolAlterationsGroupByIds(orphanedGroupIds, trx);
        logger.log(`Deleted ${molAlterationsGroupDeleted} records in mol_alterations_group table`);
      }

      await trx.commit();
      return interpretations + molAlterationsGroupDeleted;
    } catch (error) {
      await trx.rollback();
      logger.error(
        `Error during interpretation comments cleanup: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 0;
    }
  }

  async deleteMolAlterationsGroupByIds(groupIds: string[], trx: Knex.Transaction): Promise<number> {
    return this.interpretationsClient.permanentlyDeleteMolAlterationsGroupByIds(groupIds, trx);
  }
}
