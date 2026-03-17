import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  Inject, Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { PlotsClient } from 'Clients/Plots.client';
import { IncomingHttpHeaders } from 'http';
import md5 from 'md5';
import { ResponseBody } from 'Models/Common/Common.model';
import {
  HTSCulturePlots,
  HTSDrugHitsPlots,
  ICircosPlots,
  IGenerateLinxPlotResponse,
  ILinxPlot,

  IMethPlots,
  IMutSigPlots,
  IPlot,
  IQCPlots,
  IRNASeqClassifierPlots,
} from 'Models/Common/Plot.model';
import { GenerateLinxPlotBodyDTO } from 'Models/Common/Requests/GeneratePlotBody.model';
import { IGetHTHitsPlotsFilters } from 'Models/Common/Requests/GetHTSPlots.model';
import { Chromosome } from 'Models/Curation/Misc.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { S3Service } from 'Modules/S3/S3.service';
import { FileTrackerService } from './FileTracker/FileTracker.service';

@Injectable()
export class PlotsService {
  constructor(
    private readonly plotsClient: PlotsClient,
    private httpsService: HttpService,
    private fileTracker: FileTrackerService,
    private readonly s3: S3Service,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  public async getLinxPlots(
    sampleId?: string,
  ): Promise<ILinxPlot[]> {
    return this.plotsClient.getLinxPlots(sampleId);
  }

  public async generateLinxPlot(
    sampleId: string,
    { genes, chr }: GenerateLinxPlotBodyDTO,
    headers: IncomingHttpHeaders,
  ): Promise<ResponseBody> {
    const geneNames = genes ? genes.map((gene) => gene.gene) : [];
    const baseurl = `${this.configService.get('urls.linx')}/linx/${sampleId}/linx`;
    try {
      await this.httpsService.axiosRef.get(
        `${baseurl}/check`,
        {
          headers: {
            authorization: headers.authorization,
          },
        },
      );
    } catch {
      throw new BadGatewayException({ error: true, msg: 'Plot could not be generated' });
    }

    let clusterIds: string[] = [];
    if (!chr && geneNames.length > 0) {
      const results = await this.plotsClient.getClusterID(sampleId, geneNames);
      clusterIds = results
        .filter((value, index, self) => self.indexOf(value) === index)
        .map((value) => value.toString());
    }

    // Set the chromosome even if the cluster ID is set
    // Linx will know to use cluster ID instead
    const chromosome = !chr && genes && genes.length > 0 ? genes[0].chromosome : chr;

    let linxResp: IGenerateLinxPlotResponse;
    this.httpsService.axiosRef.post<IGenerateLinxPlotResponse>(
      `${baseurl}/generate`,
      {
        chr: chromosome,
        clusterIds,
        genes: geneNames,
        sampleId,
      },
      {
        headers: {
          authorization: headers.authorization,
        },
      },
    )
      .then((generateResp: AxiosResponse<IGenerateLinxPlotResponse>) => {
        linxResp = generateResp.data;
        return generateResp.data;
      })
      // Create notification on success/error
      .then(async () => {
      // On success
        const { file: fileData, dataUsed } = linxResp;
        // Add to FileTracker database
        await this.fileTracker.createFiles([{
          fileName: fileData.fileName,
          fileType: 'png',
          fileSize: fileData.fileSize,
          md5: fileData.md5,
          sampleId,
          platform: 'netapp',
          key: fileData.key,
          bucket: fileData.bucket,
          etag: fileData.etag.replace(/"/g, ''),
          category: 'linx',
          chr: dataUsed.chr ? dataUsed.chr.replace('chr', '') as Chromosome : undefined,
          clusterId: dataUsed.clusterIds.join(','),
          genes: dataUsed.genes && dataUsed.genes.length > 0 ? dataUsed.genes.join(',') : undefined,
        }], true);
      })
      .catch(() => ({ error: true, msg: 'Could not generate Linx plot' }));
    return { error: false, msg: 'Plot has been submitted and will be generated shortly' };
  }

  public async deleteLinxPlot(
    fileId: string,
    user: IUserWithMetadata,
  ): Promise<void> {
    return this.plotsClient.deleteLinxPlot(fileId, user);
  }

  public async getQCPlots(
    sampleId: string,
    user: IUserWithMetadata,
  ): Promise<IQCPlots> {
    return this.plotsClient.getQCPlots(sampleId, user);
  }

  public async getCircosPlots(
    sampleId: string,
    user: IUserWithMetadata,
  ): Promise<ICircosPlots> {
    return this.plotsClient.getCircosPlots(sampleId, user);
  }

  public async getMutSigPlots(
    sampleId: string,
    user: IUserWithMetadata,
  ): Promise<IMutSigPlots> {
    return this.plotsClient.getMutSigPlots(sampleId, user);
  }

  public async getMethPlots(
    sampleId: string,
    user: IUserWithMetadata,
  ): Promise<IMethPlots> {
    return this.plotsClient.getMethPlots(sampleId, user);
  }

  public async postMGMTplot(
    sampleId: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const key = `meth/${sampleId}/plots/${sampleId}_mgmt.png`;
    const plot = await this.s3.postFile(key, file.buffer);
    const md5val = md5(file.buffer);
    this.fileTracker.createFiles([{
      fileName: `${sampleId}_mgmt.png`,
      fileType: 'png',
      fileSize: file.size,
      md5: md5val,
      sampleId,
      platform: 'netapp',
      key,
      bucket: plot.bucket,
      etag: plot.etag.replace(/"/g, ''),
      category: 'methylation',
      type: 'mgmt',
    }], true);
  }

  public async getRNASeqGenePlot(
    rnaseqId: string,
    geneId: number,
    user: IUserWithMetadata,
  ): Promise<IPlot> {
    return this.plotsClient.getRNASeqGenePlot(rnaseqId, geneId, user);
  }

  public async postRNASeqGenePlot(
    rnaSeqId: string,
    geneId: number,
    file: Buffer | Uint8Array,
    fileSize: number,
  ): Promise<IPlot> {
    return this.plotsClient.postRNASeqGenePlot(rnaSeqId, geneId, file, fileSize);
  }

  public async getRNASeqClassifierPlot(
    rnaseqId: string,
    user: IUserWithMetadata,
  ): Promise<IRNASeqClassifierPlots> {
    return this.plotsClient.getRNASeqClassifierPlots(rnaseqId, user);
  }

  public async getFusionPlot(
    user: IUserWithMetadata,
    rnaseqId: string,
    startGene: string,
    endGene: string,
  ): Promise<IPlot> {
    return this.plotsClient.getFusionPlot(user, rnaseqId, startGene, endGene);
  }

  public async getMethGenePlot(
    methSampleId: string,
    gene: string,
    user: IUserWithMetadata,
  ): Promise<IPlot> {
    return this.plotsClient.getMethGenePlot(methSampleId, gene, user);
  }

  public async getHTSCulturePlots(
    htsId: string,
    user: IUserWithMetadata,
  ): Promise<HTSCulturePlots> {
    return this.plotsClient.getHTSCulturePlots(htsId, user);
  }

  public async getHTSDrugHitsPlots(
    htsId: string,
    drugId: string,
    filters: IGetHTHitsPlotsFilters,
    user: IUserWithMetadata,
  ): Promise<HTSDrugHitsPlots> {
    return this.plotsClient.getHTSDrugHitsPlots(htsId, drugId, filters, user);
  }
}
