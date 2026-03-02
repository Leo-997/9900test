import { Injectable } from '@nestjs/common';

import { PrecurationValidationClient } from 'Clients/Precuration/PrecurationValidation.client';
import { UpdateAcknowledgementDTO } from 'Models/Precuration/Requests/UpdatePrecurationValidationBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';

@Injectable()
export class PrecurationValidationService {
  constructor(
    private readonly precurationValidationClient: PrecurationValidationClient,
  ) {}

  public async checkWarningAcknowledgement(
    analysisSetId: string,
    user: IUserWithMetadata,
  ): Promise<boolean> {
    const acknowledged = await this.precurationValidationClient.checkWarningAcknowledgement(
      analysisSetId,
      user,
    );

    if (acknowledged) {
      return true;
    }

    return false;
  }

  public async addWarningAcknowledgement(
    analysisSetId: string,
    userId: string,
    acknowledgementBody: UpdateAcknowledgementDTO,
  ): Promise<void> {
    await this.precurationValidationClient.addWarningAcknowledgement(
      analysisSetId,
      userId,
      acknowledgementBody,
    );
  }
}
