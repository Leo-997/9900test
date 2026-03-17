/* eslint-disable no-await-in-loop */
import {
  BadRequestException, Inject, Injectable, Logger, NotFoundException,
} from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import { Knex } from 'knex';
import { TherapyClient } from '../../Clients/Therapy/Therapy.client';
import { IUser, IUserWithMetadata } from '../../Models';
import {
  ICreateTherapy,
  IMatchingTherapiesQuery,
  ITherapy,
} from '../../Models/Therapy/Therapy.model';
import { DrugService } from '../Drug/Drug.service';
import { TrialsService } from '../Trials/Trials.service';

@Injectable()
export class TherapyService {
  constructor(
    @Inject(TherapyClient) private therapyClient: TherapyClient,
    @Inject(DrugService) private readonly drugService: DrugService,
    @Inject(TrialsService) private readonly trialsService: TrialsService,
  ) { }

  public async createTherapy(
    createTherapyBody: ICreateTherapy,
    currentUser: IUser,
    trx: Knex.Transaction,
  ): Promise<string> {
    if (trx && trx.isCompleted()) {
      throw new BadRequestException('Transaction error');
    }

    const therapyId = await this.therapyClient.createTherapy(
      createTherapyBody,
      currentUser,
      trx,
    );

    // Add drugs to therapy
    for (const d of createTherapyBody.drugs) {
      const {
        id: therapyDrugId,
        externalDrugClassId,
      } = await this.drugService.addTherapyDrugByTherapyId(therapyId, d, currentUser, trx);

      if (!externalDrugClassId || !therapyDrugId) {
        throw new BadRequestException('Drug data invalid');
      }
    }

    // Add trials to therapy
    for (const trial of createTherapyBody.trials) {
      await this.trialsService.createTherapyTrial(therapyId, trial, currentUser, trx);
    }

    return therapyId;
  }

  public async getMatchingTherapies(
    query: IMatchingTherapiesQuery,
    user: IUserWithMetadata,
  ): Promise<string[]> {
    return this.therapyClient.getMatchingTherapies(query, user);
  }

  public async getTherapyById(
    therapyId: string,
    headers: IncomingHttpHeaders,
  ): Promise<ITherapy> {
    const therapy = await this.therapyClient.getTherapyById(therapyId);

    if (!therapy) {
      throw new NotFoundException(`Therapy ${therapyId} not found`);
    }

    return {
      ...therapy,
      drugs: await this.drugService.getTherapyDrugsByTherapyId(therapy.id, headers),
      trials: await this.trialsService.getTherapyTrialsByTherapyId(therapy.id, headers),
    };
  }

  async cleanupOldRecords(
    retentionDays: number,
    compareColumn: string,
    logger: Logger,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const therapyEvdDeleted = await this.cleanupTherapyEvd(
      cutoffDate,
      compareColumn,
      logger,
    );
    logger.log(`Total records deleted: ${therapyEvdDeleted}`);
    return therapyEvdDeleted;
  }

  async cleanupTherapyEvd(
    cutoffDate: Date,
    compareColumn: string,
    logger: Logger,
  ): Promise<number> {
    const trx = await this.therapyClient.openKnexTransaction();
    try {
      const therapyEvdIds = await this.therapyClient.getOldTherapyEvidenceIds(
        cutoffDate,
        compareColumn,
      );
      logger.log(`Found ${therapyEvdIds.length} old therapy evidence to delete`);

      if (therapyEvdIds.length === 0) {
        return 0;
      }

      logger.log(`Deleting old Therapy evidences: therapyEvdIds=${therapyEvdIds.join(', ')}`);
      const therapyEvidences = await this.therapyClient.permanentlyDeleteTherapyEvidenceByIds(
        therapyEvdIds,
        trx,
      );
      logger.log(`Deleted ${therapyEvidences} records in therapy evidences table`);
      await trx.commit();
      return therapyEvidences;
    } catch (error) {
      await trx.rollback();
      logger.error(
        `Error during therapy evidences cleanup: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 0;
    }
  }

  public async permanentlyDeleteTherapiesAndRelatedByIds(
    therapyIds: string[],
    trx: Knex.Transaction,
  ): Promise<number> {
    if (therapyIds.length === 0) {
      return 0;
    }
    const therapyDrugsDeleted = await this.therapyClient
      .permanentlyDeleteTherapyDrugsByTherapyIds(therapyIds, trx);
    const therapiesDeleted = await this.therapyClient
      .permanentlyDeleteTherapiesByIds(therapyIds, trx);
    return therapyDrugsDeleted + therapiesDeleted;
  }
}
