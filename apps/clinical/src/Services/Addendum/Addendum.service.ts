import { BadRequestException, Injectable } from '@nestjs/common';
import { AddendumClient } from 'Clients/Addendum/Addendum.client';
import { IUser } from 'Models';
import {
    IAddendum, ICreateAddendumBodyDTO, IHTSDrug, IHTSDrugBase,
    IUpdateAddendumBodyDTO, IUpdateHTSDrugBodyDTO, IUpdateHTSDrugHitBodyDTO, IUpdatePastRecommendationBodyDTO
} from 'Models/Addendum/Addendum.model';

@Injectable()
export class AddendumService {
  constructor(
    private readonly addendumClient: AddendumClient,
  ) {}

  public async getHTSDrugHits(
    sampleId: string,
    htsId: string,
    addendumId: string,
  ): Promise<IHTSDrug[]> {
    if (!addendumId) {
      throw new BadRequestException('Addendum id must be provided');
    }

    const resp = await this.addendumClient.getHTSDrugHits(addendumId);

    const drugData = await this.getHTSDrugs(sampleId, htsId, resp.map((r) => r.drugId));
    const hits: IHTSDrug[] = drugData.map((d) => {
      const drug = resp.find((r) => r.drugId === d.drugId);
      return {
        ...d,
        description: drug.description,
        tier: drug.tier,
      };
    });

    return hits;
  }

  public async getHTSDrugsScreeningData(
    sampleId: string,
    htsId: string,
  ): Promise<IHTSDrugBase[]> {
    if (!sampleId || !htsId) {
      throw new BadRequestException('Both sample id and HTS id must be provided');
    }

    const drugsBase = await this.addendumClient.getHTSDrugs(sampleId, htsId);

    return drugsBase;
  }

  public async getHTSDrugs(
    sampleId: string,
    htsId: string,
    drugIds?: string[],
  ): Promise<IHTSDrugBase[]> {
    if (!sampleId || !htsId) {
      throw new BadRequestException('Both sample id and HTS id must be provided');
    }

    return this.addendumClient.getHTSDrugs(sampleId, htsId, drugIds);
  }

  public async getAddendumsByVersionId(
    clinicalVersionId: string,
  ): Promise<IAddendum[]> {
    if (!clinicalVersionId) {
      throw new BadRequestException('Clinical version id must be provided');
    }

    return this.addendumClient.getAddendumsByVersionId(clinicalVersionId);
  }

  public async getActiveAddendum(
    clinicalVersionId: string,
  ): Promise<IAddendum | null> {
    if (!clinicalVersionId) {
      throw new BadRequestException('Clinical version id must be provided');
    }

    const addendums = await this.addendumClient.getAddendumsByVersionId(clinicalVersionId);
    if (addendums.length > 0) {
      return addendums[0];
    }

    return null;
  }

  public async createAddendum(
    createAddendumBody: ICreateAddendumBodyDTO,
    currentUser: IUser,
  ): Promise<number> {
    if (!createAddendumBody.clinicalVersionId) {
      throw new BadRequestException('Clinical version id must be provided');
    }

    return this.addendumClient.createAddendum(createAddendumBody, currentUser);
  }

  public async updatePastRecommendation(
    addendumId: string,
    updatePastRecBody: IUpdatePastRecommendationBodyDTO,
  ): Promise<number> {
    if (!updatePastRecBody.recommendationId || !updatePastRecBody.mode) {
      throw new BadRequestException('Both recommendation id and mode must be defined');
    }

    return this.addendumClient.updatePastRecommendation(addendumId, updatePastRecBody);
  }

  public async updateHTSDrugHit(
    addendumId: string,
    drugId: string,
    updateHTSDrugHitBody: IUpdateHTSDrugHitBodyDTO,
  ): Promise<number> {
    if (Object.values(updateHTSDrugHitBody).every((el) => el === undefined)) {
      throw new BadRequestException('At least one value must be provided');
    }

    return this.addendumClient.updateHTSDrugHit(addendumId, drugId, updateHTSDrugHitBody);
  }

  public async updateHTSDrug(
    sampleId: string,
    htsId: string,
    drugId: string,
    updateHTSDrugBody: IUpdateHTSDrugBodyDTO,
    currentUser: IUser,
  ): Promise<number> {
    if (!updateHTSDrugBody.reportedAs) {
      throw new BadRequestException('At least one value must be provided');
    }

    return this.addendumClient.updateHTSDrug(sampleId, htsId, drugId, updateHTSDrugBody, currentUser);
  }

  public async updateAddendum(
    addendumId: string,
    updateAddendumBody: IUpdateAddendumBodyDTO,
    currentUser: IUser,
  ): Promise<number> {
    if (Object.values(updateAddendumBody).every((el) => el === undefined)) {
      throw new BadRequestException('At least one value must be provided');
    }

    return this.addendumClient.updateAddendum(addendumId, updateAddendumBody, currentUser);
  }
}
