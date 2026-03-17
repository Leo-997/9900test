import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MolecularAlterationsClient } from 'Clients';
import { Knex } from 'knex';
import {
    ICreateMolecularAlterationsGroup,
    IMolAlterationSampleDetails,
    IMolecularAlterationDetail,
    IUpdateMolAlterationSummaryOrder,
    IUser,
    MolecularAlterationQueryDTO,
    UpdateMolecularAlterationBodyDTO,
} from 'Models';

@Injectable()
export class MolecularAlterationsService {
  constructor(
    private readonly molAlterationsClient: MolecularAlterationsClient,
  ) {}

  public async createMolecularAlterationsGroup(
    clinicalVersionId: string,
    body: ICreateMolecularAlterationsGroup,
    user: IUser,
  ): Promise<string> {
    const alterations = await this.getMolecularAlterations(
      clinicalVersionId,
      {
        ids: body.alterations,
      },
    );
    if (alterations.length !== body.alterations.length) {
      // means they do not have access to some of the alterations or they do not exist
      throw new BadRequestException('Could not create alterations group. Provided alteration ids are not valid');
    }
    return this.molAlterationsClient.createMolecularAlterationsGroup(
      body,
      user,
    );
  }

  public async updateMolecularAlterationsGroup(
    clinicalVersionId: string,
    groupId: string,
    body: ICreateMolecularAlterationsGroup,
    user: IUser,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const alterations = await this.getMolecularAlterations(
      clinicalVersionId,
      {
        ids: body.alterations,
      },
    );
    if (alterations.length !== body.alterations.length) {
      // means they do not have access to some of the alterations or they do not exist
      throw new BadRequestException('Could not update alterations group. Provided alteration ids are not valid');
    }
    return this.molAlterationsClient.updateMolecularAlterationsGroup(groupId, body, user, trx);
  }

  public async deleteMolecularAlterationsGroup(
    clinicalVersionId: string,
    id: string,
    trx?: Knex.Transaction,
  ): Promise<void> {
    try {
      const group = await this.getMolecularAlterations(
        clinicalVersionId,
        {
          molAlterationGroupId: id,
        },
      );
      if (!group) {
        // means they do not have access to some of the alterations or they do not exist
        throw new BadRequestException('Could not delete alterations group. Provided id is not valid');
      }
      return this.molAlterationsClient.deleteMolecularAlterationsGroup(id, trx);
    } catch {
      throw new BadRequestException('Unable to delete group, please try again');
    }
  }

  async getMolecularAlterations(
    clinicalVersionId: string,
    query: MolecularAlterationQueryDTO,
  ): Promise<IMolecularAlterationDetail[]> {
    return this.molAlterationsClient.getMolecularAlterations(
      clinicalVersionId,
      query,
    );
  }

  public async updateMolAlteration(
    clinicalVersionId: string,
    molAlterationId: string,
    updateBodyDTO: UpdateMolecularAlterationBodyDTO,
    currentUser: IUser,
  ): Promise<number> {
    if (Object.values(updateBodyDTO).every((v) => v === undefined)) {
      throw new BadRequestException('At least one value must be provided');
    }

    return this.molAlterationsClient.updateMolAlteration(
      clinicalVersionId,
      molAlterationId,
      updateBodyDTO,
      currentUser,
    );
  }

  public async updateMolAlterationSummaryOrder(
    clinicalVersionId: string,
    body: IUpdateMolAlterationSummaryOrder,
    currentUser: IUser,
  ): Promise<void> {
    return this.molAlterationsClient.updateMolAlterationSummaryOrder(
      clinicalVersionId,
      body,
      currentUser,
    );
  }

  async getMolAlterationById(
    clinicalVersionId,
    molAlterationId: string,
  ): Promise<IMolecularAlterationDetail> {
    try {
      const result = this.molAlterationsClient.getMolAlterationById(
        clinicalVersionId,
        molAlterationId,
      );
      return result;
    } catch {
      throw new NotFoundException(
        'Could not find requested molecular alteration',
      );
    }
  }

  public async getMolAlterationDetails(
    clinicalVersionId: string,
    groupId: string,
    molAlterationId: string,
  ): Promise<IMolAlterationSampleDetails> {
    try {
      const result = await this.molAlterationsClient.getMolAlterationDetails(
        clinicalVersionId,
        groupId,
        molAlterationId,
      );
      return result;
    } catch {
      throw new BadRequestException('Unable to fetch the data. Please check your request and try again.');
    }
  }
}
