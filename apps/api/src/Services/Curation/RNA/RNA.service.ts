import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SeqRnaClient } from 'Clients/Curation/RNA/RNA.client';
import { IGetReportableVariant } from 'Models/Common/Requests/GetReportableVariant.model';
import { Summary } from 'Models/Curation/Misc.model';
import { ICuratedSampleSomaticRnaQuery, IGetRNAByIdQuery } from 'Models/Curation/RNA/Requests/RnaSampleQuery.model';
import { IUpdateRnaSeqSample } from 'Models/Curation/RNA/Requests/UpdateRnaSeqBody.model';
import {
  IRnaClassifierVersion,
  RnaClassifierVersionFiltersDTO,
  UpdateRnaClassifierBodyDTO,
} from 'Models/Curation/RNA/RnaClassifier.model';
import {
  IPromoteClassifierBody, IRNASeqClassifierData, IRNASeqGeneTPMData,
  IRNATSNEData,
  ISomaticRna,
  IUpdateRNAClassifier,
} from 'Models/Curation/RNA/RnaSample.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { PlotsService } from 'Services/Plots.service';
import { IncomingHttpHeaders } from 'http';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RnaService {
  constructor(
    private readonly seqRnaClient: SeqRnaClient,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(PlotsService) private readonly plotsService: PlotsService,
    @Inject(HttpService) private readonly httpService: HttpService,
  ) {}

  public async getSeqSampleRnas(
    biosampleId: string,
    filters: ICuratedSampleSomaticRnaQuery,
    user: IUserWithMetadata,
    page: number,
    limit: number,
  ): Promise<ISomaticRna[]> {
    return this.seqRnaClient.getRnaSeqSamples(biosampleId, filters, user, page, limit);
  }

  public async getSeqSampleRnasCount(
    biosampleId: string,
    filters: ICuratedSampleSomaticRnaQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    return this.seqRnaClient.getRnaSeqSamplesCount(biosampleId, filters, user);
  }

  public async getSeqSampleRNAClassifier(
    biosampleId: string,
    filters: IGetReportableVariant,
    user: IUserWithMetadata,
  ): Promise<IRNASeqClassifierData[]> {
    return this.seqRnaClient.getSeqSampleRNAClassifier(biosampleId, filters, user);
  }

  public async getRNASummary(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<Summary> {
    return this.seqRnaClient.getRNASummary(biosampleId, user);
  }

  public async getRNAByGeneId(
    geneId: number,
    biosampleId: string,
    query: IGetRNAByIdQuery,
    user: IUserWithMetadata,
  ): Promise<ISomaticRna> {
    return this.seqRnaClient.getRNAByGeneId(
      geneId,
      biosampleId,
      query,
      user,
    );
  }

  public async getRNASeqGeneTPM(
    geneId: number,
    user: IUserWithMetadata,
  ): Promise<IRNASeqGeneTPMData[]> {
    return this.seqRnaClient.getRNASeqGeneTPM(geneId, user);
  }

  public async updateRNAById(
    rnaFieldsToUpdate: IUpdateRnaSeqSample,
    geneId: number,
    biosampleId: string,
  ): Promise<number> {
    if (Object.values(rnaFieldsToUpdate).every((v) => v === undefined)) {
      throw new BadRequestException('At least one property must be defined');
    }
    return this.seqRnaClient.updateRNAById(
      rnaFieldsToUpdate,
      geneId,
      biosampleId,
    );
  }

  public async getRnaClassifiers(
    query: RnaClassifierVersionFiltersDTO,
  ): Promise<IRnaClassifierVersion[]> {
    return this.seqRnaClient.getRnaClassifiers(query);
  }

  public async updateRnaClassifierNote(
    classifierId: string,
    body: UpdateRnaClassifierBodyDTO,
  ): Promise<void> {
    await this.seqRnaClient.updateRnaClassifier(classifierId, body);
  }

  public async updateSelectedPrediction(
    sampleId: string,
    data: IPromoteClassifierBody,
  ): Promise<void> {
    await this.seqRnaClient.updateSelectedPrediction(
      sampleId,
      data,
    );
  }

  public async updateRNAClassifier(
    sampleId: string,
    classifier: string,
    version: string,
    prediction: string,
    fieldsToUpdate: IUpdateRNAClassifier,
    user: IUserWithMetadata,
  ): Promise<void> {
    if (Object.values(fieldsToUpdate).every((v) => v === undefined)) {
      throw new BadRequestException('At least one property must be defined');
    }
    await this.seqRnaClient.updateRNAClassifier(
      sampleId,
      classifier,
      version,
      prediction,
      fieldsToUpdate,
      user,
    );
  }

  public async regenerateTPMPlots(
    biosampleId: string,
    subcat2: string,
    headers: IncomingHttpHeaders,
    user: IUserWithMetadata,
  ): Promise<void> {
    const resp = await this.seqRnaClient.getRnaSeqSamples(
      biosampleId,
      {},
      user,
    );
    await Promise.all(resp.map(async ({ gene, geneId, rnaSeqId }) => {
      const baseurl = this.configService.get('urls.rna');

      const response = await firstValueFrom(
        this.httpService.get<ArrayBuffer>(
          baseurl,
          {
            params: {
              rnaSeqId,
              gene,
              zero2Subcat2: subcat2,
            },
            headers: {
              authorization: headers.authorization,
            },
            responseType: 'arraybuffer',
          },
        ),
      );

      const uint8Array = new Uint8Array(response.data);

      await this.plotsService.postRNASeqGenePlot(
        rnaSeqId,
        Number(geneId),
        uint8Array,
        uint8Array.length,
      );
    }));
  }

  public async getRNATSNEData(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IRNATSNEData[]> {
    return this.seqRnaClient.getRNATSNEData(biosampleId, user);
  }
}
