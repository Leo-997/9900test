import { BadRequestException, Injectable } from '@nestjs/common';
import { MethylationClient } from 'Clients/Curation/Methylation/Methylation.client';
import { IGetReportableVariant } from 'Models/Common/Requests/GetReportableVariant.model';
import type { ClassifierVersionFiltersDTO, IClassifierVersion, UpdateClassifierBodyDTO } from 'Models/Curation/Classifiers/Classifiers.model';
import {
  IClassifierGroup,
  ICohortStats,
  IGetMethGroupQuery,
  IMethCounts,
  IMethGeneTable,
  IMethylationData,
  IMethylationGeneData,
  IMethylationPredictionData,
} from 'Models/Curation/Methylation/Methylation.model';
import { IMethResultBody } from 'Models/Curation/Methylation/Requests/CreateMethResultBody.model';
import { IMethPredBody, IMethUpdateBody, IMethUpdateGeneBody } from 'Models/Curation/Methylation/Requests/UpdateMethBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';

@Injectable()
export class MethylationService {
  constructor(private readonly methylationClient: MethylationClient) {}

  public async getMethData(
    biosampleId: string,
    filters: IGetReportableVariant,
    user: IUserWithMetadata,
  ): Promise<IMethylationData[]> {
    const data = this.methylationClient.getMethData(biosampleId, filters, user);

    return data;
  }

  public async getMethGeneData(
    biosampleId: string,
    filters: IGetReportableVariant,
    user: IUserWithMetadata,
  ): Promise<IMethylationGeneData[]> {
    return this.methylationClient.getMethGeneData(biosampleId, filters, user);
  }

  public async getMethMGMTCohort(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<ICohortStats[]> {
    return this.methylationClient.getMethMGMTCohort(biosampleId, user);
  }

  public async countMethMGMT(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IMethCounts> {
    return this.methylationClient.countMethMGMT(biosampleId, user);
  }

  public async getMethGeneTable(
    biosampleId: string,
    gene: string,
    user: IUserWithMetadata,
  ): Promise<IMethGeneTable[]> {
    return this.methylationClient.getMethGeneTable(biosampleId, gene, user);
  }

  public async getMethPredData(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IMethylationPredictionData> {
    return this.methylationClient.getMethPredData(biosampleId, user);
  }

  public async getClassifiers(
    query: ClassifierVersionFiltersDTO,
  ): Promise<IClassifierVersion[]> {
    return this.methylationClient.getClassifiers(query);
  }

  public async updateClassifier(
    classifierId: string,
    body: UpdateClassifierBodyDTO,
  ): Promise<void> {
    await this.methylationClient.updateClassifer(classifierId, body);
  }

  public async getClassifierGroups(filters: IGetMethGroupQuery): Promise<IClassifierGroup[]> {
    return this.methylationClient.getClassifierGroups(filters);
  }

  public async updateMeth(
    biosampleId: string,
    methId: string,
    fieldsToUpdate: IMethUpdateBody,
  ): Promise<number> {
    if (Object.values(fieldsToUpdate).every((v) => v === undefined)) {
      throw new BadRequestException('At least one property must be defined');
    }
    return this.methylationClient.updateMeth(biosampleId, methId, fieldsToUpdate);
  }

  public async updateMethGene(
    biosampleId: string,
    geneId: string,
    fieldsToUpdate: Partial<IMethUpdateGeneBody>,
  ): Promise<number> {
    if (Object.values(fieldsToUpdate).every((v) => v === undefined)) {
      throw new BadRequestException('At least one property must be defined');
    }

    return this.methylationClient.updateMethGene(
      biosampleId,
      geneId,
      fieldsToUpdate,
    );
  }

  public async updateMethPred(
    biosampleId: string,
    fieldsToUpdate: IMethPredBody,
  ): Promise<number> {
    if (Object.values(fieldsToUpdate).every((v) => v === undefined)) {
      throw new BadRequestException('At least one property must be defined');
    }
    return this.methylationClient.updateMethPred(biosampleId, fieldsToUpdate);
  }

  public async createMethResult(
    biosampleId: string,
    fieldsToCreate: IMethResultBody,
  ): Promise<number> {
    return this.methylationClient.createMethResult(biosampleId, fieldsToCreate);
  }
}
