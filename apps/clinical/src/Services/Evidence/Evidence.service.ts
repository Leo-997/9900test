import {
  BadRequestException,
  Inject, Injectable,
} from '@nestjs/common';
import { EvidenceClient } from 'Clients/Evidence/Evidence.client';
import { Knex } from 'knex';
import {
  ICreateEvidence,
  IEvidence,
  IGetEvidence,
  IUpdateEvidence,
  IUserWithMetadata,
} from 'Models';

@Injectable()
export class EvidenceService {
  constructor(
    @Inject(EvidenceClient) private readonly evidenceClient: EvidenceClient,
  ) {}

  public async getEvidence(
    query: IGetEvidence,
    user: IUserWithMetadata,
    trx?: Knex.Transaction,
    skipAccessControl = false,
  ): Promise<IEvidence[]> {
    return this.evidenceClient.getEvidence(query, user, trx, skipAccessControl);
  }

  public async getEvidenceById(
    id: string,
    user: IUserWithMetadata,
    trx?: Knex.Transaction,
  ): Promise<IEvidence> {
    return this.evidenceClient.getEvidenceById(id, user, trx);
  }

  public async getEvidenceCount(
    query: IGetEvidence,
    user: IUserWithMetadata,
  ): Promise<number> {
    return this.evidenceClient.getEvidenceCount(query, user);
  }

  public async createEvidence(
    body: ICreateEvidence,
    currentUser: IUserWithMetadata,
    trx?: Knex.Transaction,
  ): Promise<string> {
    const transaction = trx || await this.evidenceClient.getTransaction();
    const evidenceId = await this.evidenceClient.createEvidence(body, currentUser, transaction);
    // try to get the new evidence
    const evidence = await this.getEvidenceById(
      evidenceId,
      currentUser,
      transaction,
    );

    // the user doesn't have access to create this evidence
    if (!evidence) {
      // the rollback for trx will be handled by whatever passed it in
      if (!trx) await transaction.rollback();
      throw new BadRequestException('Could not create evidence with the provided details');
    }
    // the commit for trx will be handled by whatever passed it in
    if (!trx) await transaction.commit();
    return evidenceId;
  }

  public async updateEvidenceForEntity(
    body: IUpdateEvidence,
    currentUser: IUserWithMetadata,
  ): Promise<void> {
    const trx = await this.evidenceClient.getTransaction();

    let allEvidence = await this.getEvidence({
      clinicalVersionId: body.clinicalVersionId,
      entityIds: [body.entityId],
      entityTypes: [body.entityType],
    }, currentUser, trx, true);

    let accessibleEvidence = await this.getEvidence({
      clinicalVersionId: body.clinicalVersionId,
      entityIds: [body.entityId],
      entityTypes: [body.entityType],
    }, currentUser, trx);

    let accessEvidenceIds = accessibleEvidence.map((accessibleE) => accessibleE.evidenceId);
    if (
      allEvidence.length !== accessibleEvidence.length
      || allEvidence.some((allE) => (
        !accessEvidenceIds.includes(allE.evidenceId)
      ))
    ) {
      // the logged in user doesn't have access to some
      // or all evidence that they are adding / deleting
      await trx.rollback();
      throw new BadRequestException('Could not edit evidence');
    }

    await this.evidenceClient.updateEvidenceForEntity(body, currentUser, trx);

    // then check again after the update
    allEvidence = await this.getEvidence({
      clinicalVersionId: body.clinicalVersionId,
      entityIds: [body.entityId],
      entityTypes: [body.entityType],
    }, currentUser, trx, true);

    accessibleEvidence = await this.getEvidence({
      clinicalVersionId: body.clinicalVersionId,
      entityIds: [body.entityId],
      entityTypes: [body.entityType],
    }, currentUser, trx);

    accessEvidenceIds = accessibleEvidence.map((accessibleE) => accessibleE.evidenceId);
    if (
      allEvidence.length !== accessibleEvidence.length
      || allEvidence.some((allE) => (
        !accessEvidenceIds.includes(allE.evidenceId)
      ))
    ) {
      // the logged in user doesn't have access to some
      // or all evidence that they are adding / deleting
      await trx.rollback();
      throw new BadRequestException('Could not edit evidence');
    }

    await trx.commit();
  }

  public async permanentlyDeleteByEntityTypeAndEntityIds(
    entityType: string,
    entityIds: string[],
    trx: Knex.Transaction,
  ): Promise<number> {
    return this.evidenceClient.permanentlyDeleteByEntityTypeAndEntityIds(
      entityType,
      entityIds,
      trx,
    );
  }
}
