import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';
import { TrialsClient } from 'Clients/Trials/Trials.client';
import { IncomingHttpHeaders } from 'http';
import { Knex } from 'knex';
import {
  CreateTherapyTrial,
  IExternalTrial,
  IFetchTherapyTrial,
  IUser,
} from 'Models';
import { normalizeString } from 'Utils/string.util';

export class TrialsService {
  constructor(
    @Inject(TrialsClient) private readonly trialsClient: TrialsClient,
    private httpService: HttpService,
  ) {}

  public async permanentlyDeleteByTherapyIds(
    therapyIds: string[],
    trx: Knex.Transaction,
  ): Promise<number> {
    return this.trialsClient.permanentlyDeleteByTherapyIds(therapyIds, trx);
  }

  public async getTherapyTrialsByTherapyId(
    therapyId: string,
    headers: IncomingHttpHeaders,
  ): Promise<IFetchTherapyTrial[]> {
    const therapyTrials = await this.trialsClient.getTherapyTrialsByTherapyId(therapyId);
    return Promise.all(therapyTrials.map(async (therapyTrial) => ({
      id: therapyTrial.id,
      externalTrial: await this.hydrateExternalTrial(therapyTrial.externalTrialId, headers),
      note: therapyTrial.note,
    })));
  }

  public async createTherapyTrial(
    therapyId: string,
    therapyTrial: CreateTherapyTrial,
    currentUser: IUser,
    trx?: Knex.Transaction,
  ): Promise<void> {
    await this.trialsClient.createTherapyTrial(therapyId, therapyTrial, currentUser, trx);
  }

  private async hydrateExternalTrial(
    externalTrialId: string,
    headers: IncomingHttpHeaders,
  ): Promise<IExternalTrial> {
    const trialQueryUrl = `${normalizeString(process.env.VITE_DRUGS_URL)}/drugs/trials?id=${externalTrialId}`;
    const trialResp = await this.httpService.axiosRef.get<IExternalTrial>(trialQueryUrl, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: headers.authorization,
      },
    });
    return trialResp.data[0];
  }
}
