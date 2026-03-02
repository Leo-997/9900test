import { BadRequestException, Injectable } from '@nestjs/common';
import { CytogeneticsClient } from 'Clients/Curation/Cytogenetics/Cytogenetics.client';
import { NotFoundError } from 'Errors/NotFound.error';
import {
  IAnnotations, IArmRanges, ICytobandCN, ICytogeneticsData, ISampleCytoband,
} from 'Models/Curation/Cytogenetics/Cytogenetics.model';
import { ICreateCytobandBody } from 'Models/Curation/Cytogenetics/Requests/CreateCytobandBody.model';
import { IGetAverageCopyNumberQuery } from 'Models/Curation/Cytogenetics/Requests/GetAverageCopyNumberQueryDTO.model';
import { IGetChromosomeBandsQuery } from 'Models/Curation/Cytogenetics/Requests/GetChromosomeBandsQuery.model';
import { IGetCytobandsQuery } from 'Models/Curation/Cytogenetics/Requests/GetCytobandsQuery.model';
import { IUpdateCytobandBody } from 'Models/Curation/Cytogenetics/Requests/UpdateCtyobandBody.model';
import { IUpdateCytoBody } from 'Models/Curation/Cytogenetics/Requests/UpdateCytoBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';

@Injectable()
export class CytogeneticsService {
  constructor(private readonly cytogeneticsClient: CytogeneticsClient) {}

  public async getCytogeneticsData(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<ICytogeneticsData[]> {
    const data = this.cytogeneticsClient.getCytogeneticsData(biosampleId, user);

    if (!data) {
      throw new NotFoundError(`Not Found: any cytogenetic data for ${biosampleId}`);
    }
    return data;
  }

  public async getCytogeneticsByChromosome(
    biosampleId: string,
    variantId: string,
    user: IUserWithMetadata,
  ): Promise<ICytogeneticsData[]> {
    const data = this.cytogeneticsClient.getCytogeneticsByChromosome(biosampleId, variantId, user);

    if (!data) {
      throw new NotFoundError(`Not Found: any cytogenetics data for sample ${biosampleId} for chromosome ${variantId}`);
    }
    return data;
  }

  public async getCytobands(
    biosampleId: string,
    query: IGetCytobandsQuery,
    user: IUserWithMetadata,
  ): Promise<ISampleCytoband[]> {
    const data = await this.cytogeneticsClient.getCytobands(biosampleId, query, user);
    return data;
  }

  public async createCytoband(
    biosampleId: string,
    newCytobandBody: ICreateCytobandBody,
  ): Promise<number> {
    if (!newCytobandBody.cytoband || newCytobandBody.customCn === null) {
      throw new BadRequestException('Either cytoband range or copy number must be defined');
    }

    return this.cytogeneticsClient.createCytoband(biosampleId, newCytobandBody);
  }

  public async updateCytoband(
    biosampleId: string,
    chr: string,
    cytoband: string,
    body: IUpdateCytobandBody,
  ): Promise<number> {
    if (Object.values(body).every((el) => el === undefined)) {
      throw new BadRequestException(
        'At least one property must be defined',
      );
    }
    const data = await this.cytogeneticsClient.updateCytoband(biosampleId, chr, cytoband, body);

    if (!data || data === 0) {
      throw new NotFoundError(`Not Found: Cytoband ${cytoband} for ${biosampleId} and chromosome ${chr}`);
    }
    return data;
  }

  public async deleteCytoband(
    biosampleId: string,
    chr: string,
    cytoband: string,
  ): Promise<number> {
    const data = await this.cytogeneticsClient.deleteCytoband(biosampleId, chr, cytoband);

    if (!data || data === 0) {
      throw new NotFoundError(`Not Found: Cytoband ${cytoband} for ${biosampleId} and chromosome ${chr}`);
    }
    return data;
  }

  public async updateCytogenetics(
    biosampleId: string,
    fieldsToUpdate: IUpdateCytoBody,
  ): Promise<number> {
    if (Object.values(fieldsToUpdate).every((el) => el === undefined)) {
      throw new BadRequestException(
        'At least one property must be defined',
      );
    }
    const numRowsUpdated = this.cytogeneticsClient.updateCytogenetics(biosampleId, fieldsToUpdate);

    if (numRowsUpdated) return numRowsUpdated;

    throw new NotFoundError('Could not find cytogenetics sample to update');
  }

  public async getAnnotations(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IAnnotations> {
    const data = this.cytogeneticsClient.getAnnotations(biosampleId, user);

    if (!data) {
      throw new NotFoundError(`Not Found: any cytogenetic data for ${biosampleId}`);
    }
    return data;
  }

  public async getAnnotationsByChromosome(
    biosampleId: string,
    variantId: string,
    user: IUserWithMetadata,
  ): Promise<IAnnotations> {
    const data = this.cytogeneticsClient.getAnnotationsByChromosome(biosampleId, variantId, user);

    if (!data) {
      throw new NotFoundError(`Not Found: any cytogenetic data for ${biosampleId}`);
    }
    return data;
  }

  public async getChromosomeBands(
    query: IGetChromosomeBandsQuery,
  ): Promise<IArmRanges[]> {
    const data = await this.cytogeneticsClient.getChromosomeBands(query);

    if (!data) {
      throw new NotFoundError('Not Found: any cytobands data for filters provided');
    }
    return data;
  }

  public async getAverageCopyNumber(
    biosampleId: string,
    query: IGetAverageCopyNumberQuery,
    user: IUserWithMetadata,
  ): Promise<ICytobandCN> {
    if (query.start > query.end) {
      throw new BadRequestException('Starting range must be lower than ending range');
    }

    const data = await this.cytogeneticsClient.getAverageCopyNumber(biosampleId, query, user);
    if (!data) {
      throw new NotFoundError(`Not Found: any cytobands data for ${biosampleId} on ranges ${query.start} to ${query.end}`);
    }
    return data;
  }
}
