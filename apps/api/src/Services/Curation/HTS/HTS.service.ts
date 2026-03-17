import { BadRequestException, Injectable } from '@nestjs/common';
import { HTSClient } from 'Clients/Curation/HTS/HTS.client';
import {
  HTSResultSummary,
  IHTSCulture,
  IHTSDrugCombination,
  IHTSResult,
} from 'Models/Curation/HTS/HTS.model';
import { ICreateHTSCombination } from 'Models/Curation/HTS/Requests/CreateHTSCombination.model';
import { IGetHTSCombinationsQuery, IGetHTSResultQuery } from 'Models/Curation/HTS/Requests/PaginatedHtsResults';
import { IUpdateHTSCombination } from 'Models/Curation/HTS/Requests/UpdateHTSCombination.model';
import { IUpdateHTSCultureBody } from 'Models/Curation/HTS/Requests/UpdateHTSCultureBody.model';
import {
  UpdateHTSResultByIdBodyDTO,
} from 'Models/Curation/HTS/Requests/UpdateHTSResultByIdBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';

@Injectable()
export class HTSService {
  constructor(
    private readonly htsClient: HTSClient,
  ) {}

  public async getHTSCulture(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IHTSCulture[]> {
    return this.htsClient.getHTSCulture(biosampleId, user);
  }

  public async getHTSResult(
    biosampleId: string,
    filters: IGetHTSResultQuery,
    user: IUserWithMetadata,
    page: number,
    limit: number,
  ): Promise<IHTSResult[]> {
    const htsResult = await this.htsClient.getHTSResult(
      biosampleId,
      filters,
      user,
      page,
      limit,
    );

    return htsResult;
  }

  public async getHTSResultCount(
    biosampleId: string,
    filters: IGetHTSResultQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    const htsResult = await this.htsClient.getHTSResultCount(
      biosampleId,
      filters,
      user,
    );

    return htsResult;
  }

  public async getHTSResultById(
    biosampleId: string,
    screenId: string,
    user: IUserWithMetadata,
  ): Promise<IHTSResult> {
    const htsResult = await this.htsClient.getHTSResultById(
      biosampleId,
      screenId,
      user,
    );

    return htsResult;
  }

  public getZScoreSummary(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<HTSResultSummary> {
    return this.htsClient.getZScoreSummary(biosampleId, user);
  }

  public updateHtsResultById(
    updateFields: UpdateHTSResultByIdBodyDTO,
    screenId: string,
    biosampleId: string,
  ): Promise<number> {
    if (Object.values(updateFields).every((v) => v === undefined)) {
      throw new BadRequestException('At least one field must be specified for updates');
    }

    return this.htsClient.updateHtsResultById(
      updateFields,
      screenId,
      biosampleId,
    );
  }

  public async getDrugCombinations(
    biosampleId: string,
    query: IGetHTSCombinationsQuery,
    user: IUserWithMetadata,
  ): Promise<IHTSDrugCombination[]> {
    return this.htsClient.getDrugCombinations(biosampleId, query, user);
  }

  public async getDrugCombinationsById(
    biosampleId: string,
    combinationId: string,
    user: IUserWithMetadata,
  ): Promise<IHTSDrugCombination[]> {
    return this.htsClient.getDrugCombinationsById(biosampleId, combinationId, user);
  }

  public async updateHTSCulture(
    biosampleId: string,
    screenName: string,
    body: IUpdateHTSCultureBody,
  ): Promise<void> {
    if (Object.values(body).every((v) => v === undefined)) {
      throw new BadRequestException('At least one value must be set to update');
    }

    return this.htsClient.updateHTSCulture(
      biosampleId,
      screenName,
      body,
    );
  }

  public async createDrugCombination(
    biosampleId: string,
    body: ICreateHTSCombination,
  ): Promise<string> {
    return this.htsClient.createDrugCombination(biosampleId, body);
  }

  public async updateDrugCombination(
    id: string,
    body: IUpdateHTSCombination,
  ): Promise<void> {
    if (Object.values(body).every((v) => v === undefined)) {
      throw new BadRequestException('At least one value must be set to update');
    }

    return this.htsClient.updateDrugCombination(id, body);
  }
}
