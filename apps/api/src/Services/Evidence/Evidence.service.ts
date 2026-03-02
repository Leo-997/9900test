import { ForbiddenException, Injectable } from '@nestjs/common';
import { EvidenceClient } from 'Clients/Evidence/Evidence.client';
import { IEvidence, IUpdateEvidence } from 'Models/Evidence/Evidence.model';
import { IEvidenceQuery } from 'Models/Evidence/Requests/EvidenceQuery.model';
import { CreateEvidenceDTO } from 'Models/Evidence/Requests/PostEvidenceBody.model';
import { VariantType } from 'Models/Misc/VariantType.model';
import { IUser, IUserWithMetadata } from 'Models/Users/Users.model';
import { Knex } from 'knex';

@Injectable()
export class EvidenceService {
  constructor(
    private readonly evidencesClient: EvidenceClient,
  ) {}

  public async getEvidence(
    query: IEvidenceQuery,
    user: IUserWithMetadata,
    skipAccessControl: boolean = false,
  ): Promise<IEvidence[]> {
    return this.evidencesClient.getEvidence(query, user, skipAccessControl);
  }

  public async postEvidence(
    data: CreateEvidenceDTO,
    user: IUser,
  ): Promise<string> {
    return this.evidencesClient.postEvidence(data, user);
  }

  async updateEvidenceForEntity(
    body: IUpdateEvidence,
    user: IUser,
  ): Promise<void> {
    return this.evidencesClient.updateEvidenceForEntity(
      body,
      user,
    );
  }

  public async swapEvidenceVariantId(
    analysisSetId: string,
    variantType: VariantType,
    oldVariantId: string | number,
    newVariantId: string | number,
    trx?: Knex.Transaction,
  ): Promise<void> {
    return this.evidencesClient.swapEvidenceVariantId(
      analysisSetId,
      variantType,
      oldVariantId,
      newVariantId,
      trx,
    );
  }

  public async deleteEvidenceById(
    evidenceId: string,
    user: IUserWithMetadata,
  ): Promise<number> {
    const evidence = await this.evidencesClient.getEvidence(
      {
        evidenceIds: [evidenceId],
      },
      user,
    );
    if (!evidence.length) {
      throw new ForbiddenException();
    }
    return this.evidencesClient.deleteEvidenceById(evidenceId);
  }
}
