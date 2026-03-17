import { Inject } from '@nestjs/common';
import { ClinicalOneClient } from 'Clients/ClinicalOne/ClinicalOne.client';
import { ClinicalOneFormType, IClinicalOneFromDataRequest, IClinicalOneResp } from 'Models/ClinicalOne/ClinicalOne.model';
import { IV2ClinicalOneRequest, IV2ClinicalOneResp } from 'Models/ClinicalOne/V1ClinicalOne.model';

export class ClinicalOneService {
  constructor(
    @Inject(ClinicalOneClient) private readonly clinicalOneClient: ClinicalOneClient,
  ) {}

  public async makeAPICall<T = ClinicalOneFormType>(
    request: IClinicalOneFromDataRequest,
  ): Promise<IClinicalOneResp<T>> {
    return this.clinicalOneClient.makeAPICall(request);
  }

  public async makeV2APICall(
    request: IV2ClinicalOneRequest,
  ): Promise<IV2ClinicalOneResp> {
    return this.clinicalOneClient.makeV2APICall(request);
  }
}
