import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfig } from 'Config/configuration';
import { htsCultureTypes, htsHitsTypes } from 'Constants/FileTracker/types.constants';
import { Knex } from 'knex';
import md5 from 'md5';
import {
  HTSCulturePlots,
  HTSDrugHitsPlots,
  ICircosPlots,
  ILinxPlot,
  IMethPlots,
  IMutSigPlots,
  IPlot,
  IQCPlots,
  IRNASeqClassifierPlots,
} from 'Models/Common/Plot.model';
import { IGetHTHitsPlotsFilters } from 'Models/Common/Requests/GetHTSPlots.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { FILE_TRACKER_KNEX_CONNECTION, KNEX_CONNECTION } from 'Modules/Knex/constants';
import { S3Service } from 'Modules/S3/S3.service';
import { FileTrackerService } from 'Services/FileTracker/FileTracker.service';

@Injectable()
export class PlotsClient {
  constructor(
    @Inject(S3Service) private readonly s3: S3Service,
    @Inject(ConfigService) private readonly configService: ConfigService<IConfig>,
    @Inject(FileTrackerService) private readonly fileTracker: FileTrackerService,
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    @Inject(FILE_TRACKER_KNEX_CONNECTION) private readonly ftKnex: Knex,
  ) {}

  public async getLinxPlots(
    sampleId?: string,
  ): Promise<ILinxPlot[]> {
    const query = this.ftKnex.select({
      fileId: 'd.file_id',
      sampleId: 'd.sample_id',
      chr: 'l.chr',
      clusterIds: 'l.cluster_id',
      genes: 'l.genes',
      created: 'd.updated_at',
    })
      .from({ d: 'datafiles' })
      .innerJoin({ l: 'zcc_zd_linx' }, 'd.file_id', 'l.file_id');

    if (sampleId) query.where('d.sample_id', sampleId);

    return query.then((result) => result.map((row) => ({
      ...row,
      genes: row.genes ? row.genes.split(',') : [],
      clusterIds: row.clusterIds ? row.clusterIds.split(',') : [],
    })));
  }

  public async deleteLinxPlot(
    fileId: string,
    user: IUserWithMetadata,
  ): Promise<void> {
    const netappFile = await this.fileTracker.getNetappKeyByFileId(user, fileId);

    try {
      await this.s3.deleteObject(netappFile.key, netappFile.bucket);
      await this.fileTracker.deleteFiles({ fileIds: [fileId] });
    } catch {}
  }

  public async getClusterID(
    sampleId: string,
    genes: string[],
  ): Promise<number[]> {
    const query = this.knex
      .select('a.clusterId')
      .from<number[]>({ a: 'purple.svAnnotation' })
      .where('a.sampleId', sampleId)
      .andWhere(function customWhereBuilder() {
        this.orWhereIn('a.geneStart', genes);
        this.orWhereIn('a.geneEnd', genes);
      })
      .pluck('a.clusterId');
    const results: number[] = await query;

    if (results.length === 0) {
      return this.knex
        .select('a.clusterId')
        .from<number[]>({ a: 'purple.svLink' })
        .leftJoin({ b: 'purple.svBreakend' }, function customJoin() {
          this.on('b.svId', '=', 'a.lowerSvId')
            .andOn('b.sampleId', '=', 'a.sampleId');
        })
        .leftJoin({ c: 'purple.svBreakend' }, function customJoin() {
          this.on('c.svId', '=', 'a.upperSvId')
            .andOn('c.sampleId', '=', 'a.sampleId');
        })
        .where('a.sampleId', sampleId)
        .andWhere(function customWhereBuilder() {
          this.orWhereIn('b.gene', genes);
          this.orWhereIn('c.gene', genes);
        })
        .pluck('a.clusterId');
    }

    return results;
  }

  private getStreamUrl(url: string): string {
    const encodedUrl = encodeURIComponent(url);
    const plotUrlPrefix = this.configService.get<IConfig['zeroDash']>('zeroDash').baseAPIUrl;
    return `${plotUrlPrefix}/files/stream-s3-url?url=${encodedUrl}`;
  }

  // CIRCOS PLOTS
  public async getRawCircosPlot(sampleId: string, user: IUserWithMetadata): Promise<IPlot> {
    const { key, bucket, fileId } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_circos',
      this.customTypeWhereBuilder('raw_circos'),
      sampleId,
    );
    const plotURL = await this.s3.getS3Url(key, bucket);
    return {
      plotURL: plotURL ? this.getStreamUrl(plotURL) : '',
      fileId,
    };
  }

  public async getCircosPlot(sampleId: string, user: IUserWithMetadata): Promise<IPlot> {
    const { key, bucket, fileId } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_circos',
      this.customTypeWhereBuilder('circos'),
      sampleId,
    );
    const plotURL = await this.s3.getS3Url(key, bucket);
    return {
      plotURL: plotURL ? this.getStreamUrl(plotURL) : '',
      fileId,
    };
  }

  public async getCircosPlots(sampleId: string, user: IUserWithMetadata): Promise<ICircosPlots> {
    const circos = await this.getCircosPlot(sampleId, user);
    const circosRaw = await this.getRawCircosPlot(sampleId, user);
    return {
      circos: circos ? circos.plotURL : undefined,
      circosRaw: circosRaw ? circosRaw.plotURL : undefined,
    };
  }

  // MUTSIG PLOTS
  public async getMutSigPlots(sampleId: string, user: IUserWithMetadata): Promise<IMutSigPlots> {
    const fit = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_mutsig',
      this.customTypeWhereBuilder('fit'),
      sampleId,
    );
    const fitLink = await this.s3.getS3Url(fit.key, fit.bucket);

    const matching = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_mutsig',
      this.customTypeWhereBuilder('matching'),
      sampleId,
    );
    const matchingLink = await this.s3.getS3Url(matching.key, matching.bucket);

    const matrix = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_mutsig',
      this.customTypeWhereBuilder('matrix'),
      sampleId,
    );
    const matrixLink = await this.s3.getS3Url(matrix.key, matrix.bucket);

    const data: IMutSigPlots = {
      fit: {
        fileId: fit.fileId,
        plotURL: fitLink ? this.getStreamUrl(fitLink) : '',
      },
      matching: {
        fileId: matching.fileId,
        plotURL: matchingLink ? this.getStreamUrl(matchingLink) : '',
      },
      matrix: {
        fileId: matrix.fileId,
        plotURL: matrixLink ? this.getStreamUrl(matrixLink) : '',
      },
    };

    return data;
  }

  public async getMethPlots(sampleId: string, user: IUserWithMetadata): Promise<IMethPlots> {
    const { key: methKey, bucket: methBucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_methylation',
      this.customTypeWhereBuilder('epic'),
      sampleId,
    );
    const methLink = await this.s3.getS3Url(methKey, methBucket);

    const { key: mgmtKey, bucket: mgmtBucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_methylation',
      this.customTypeWhereBuilder('mgmt'),
      sampleId,
    );
    const mgmtLink = await this.s3.getS3Url(mgmtKey, mgmtBucket);

    const cnvProfilePlot = await this.getCNVProfilePlot(sampleId, user);
    const cnvProfileLink = cnvProfilePlot ? cnvProfilePlot.plotURL : '';

    return {
      methProfile: methLink ? this.getStreamUrl(methLink) : '',
      mgmt: mgmtLink ? this.getStreamUrl(mgmtLink) : '',
      cnProfile: cnvProfileLink,
    };
  }

  public async getMethGenePlot(
    methSampleId: string,
    gene: string,
    user: IUserWithMetadata,
  ): Promise<IPlot> {
    const { fileId, key, bucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_methylation_genes',
      this.customMethWhereBuilder(methSampleId, gene),
    );
    const plotURL = await this.s3.getS3Url(key, bucket);
    return {
      plotURL: plotURL ? this.getStreamUrl(plotURL) : '',
      fileId,
    };
  }

  // RNASEQ PLOTS
  private async getGeneName(geneId: number): Promise<string> {
    const gene = await this.knex
      .select({
        name: 'a.gene',
      })
      .from({ a: 'zcc_genes' })
      .where('a.gene_id', geneId)
      .first();
    return gene.name;
  }

  public async getRNASeqGenePlot(
    rnaseqId: string,
    geneId: number,
    user: IUserWithMetadata,
  ): Promise<IPlot> {
    const genename = await this.getGeneName(geneId);
    const { fileId, key, bucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_rna_seq',
      this.customRNASeqWhereBuilder(rnaseqId, genename),
    );
    const plotURL = await this.s3.getS3Url(key, bucket);
    return {
      plotURL: plotURL ? this.getStreamUrl(plotURL) : '',
      fileId,
    };
  }

  public async getRNASeqClassifierPlots(
    rnaseqId: string,
    user: IUserWithMetadata,
  ): Promise<IRNASeqClassifierPlots> {
    const { key, bucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_rna_classifier',
      this.customRNAClassifierWhereBuilder(rnaseqId, 'ALLSorts'),
    );
    const link = await this.s3.getS3Url(key, bucket);

    return {
      allsorts: link ? this.getStreamUrl(link) : '',
    };
  }

  public async getFusionPlot(user: IUserWithMetadata, rnaseqId: string, startGene: string, endGene: string): Promise<IPlot> {
    const { fileId, key, bucket } = await this.fileTracker.getNetappKey(user, 'zcc_zd_fusion', this.customFusionWhereBuilder(rnaseqId, startGene, endGene));
    const plotURL = await this.s3.getS3Url(key, bucket);
    return {
      fileId,
      plotURL: plotURL ? this.getStreamUrl(plotURL) : '',
    };
  }

  public async postRNASeqGenePlot(
    rnaSeqId: string,
    geneId: number,
    file: Buffer | Uint8Array,
    fileSize: number,
  ): Promise<IPlot> {
    const { refGenome, rsemVer } = this.configService.get<IConfig['constants']>('constants');
    const genename = await this.getGeneName(geneId);
    const key = `rna/${rnaSeqId}/${refGenome}/rsem/${rsemVer}/${genename}-${rnaSeqId}-rnaseq.png`;
    const plot = await this.s3.postFile(key, file);

    const md5val = md5(file);

    const resp = await this.fileTracker.createFiles([{
      fileName: `${genename}-${rnaSeqId}-rnaseq.png`,
      fileType: 'png',
      fileSize,
      md5: md5val,
      sampleId: rnaSeqId,
      platform: 'netapp',
      key,
      bucket: plot.bucket,
      etag: plot.etag.replace(/"/g, ''),
      category: 'rnaseq',
      rnaSeqId,
      gene: genename,
    }], true);

    if (resp.filesInserted && resp.filesInserted[0]) {
      return {
        plotURL: plot.url,
        fileId: resp.filesInserted[0].fileId,
      };
    }
    return {
      plotURL: '',
      fileId: '',
    };
  }

  // QC TAB PLOTS
  public async getPurpleSomaticVariantPloidyPlot(
    sampleId: string,
    user: IUserWithMetadata,
  ): Promise<IPlot> {
    const { fileId, key, bucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_qc',
      this.customTypeWhereBuilder('purple_somatic_variant_ploidy'),
      sampleId,
    );
    const legend = 'If a somatic variant VCF has been supplied, this figure is produced showing the somatic variant ploidy broken down by copy number';
    const url = await this.s3.getS3Url(key, bucket);
    return {
      legend,
      plotURL: url ? this.getStreamUrl(url) : '',
      fileId,
    };
  }

  public async getPurpleCopyNumberPlot(
    sampleId: string,
    user: IUserWithMetadata,
  ): Promise<IPlot> {
    const { fileId, key, bucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_qc',
      this.customTypeWhereBuilder('purple_copy_number'),
      sampleId,
    );
    const legend = 'The following figures shows the AMBER BAF count weighted distribution of copy number and minor allele ploidy throughout the fitted segments. Copy numbers are broken down by colour into their respective minor allele ploidy (MAP).';
    const url = await this.s3.getS3Url(key, bucket);
    return {
      legend,
      plotURL: url ? this.getStreamUrl(url) : '',
      fileId,
    };
  }

  public async getPurpleMinorAllelePloidyPlot(
    sampleId: string,
    user: IUserWithMetadata,
  ): Promise<IPlot> {
    const { fileId, key, bucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_qc',
      this.customTypeWhereBuilder('purple_minor_allele_ploidy'),
      sampleId,
    );
    const legend = 'The following figures shows the AMBER BAF count weighted distribution of copy number and minor allele ploidy throughout the fitted segments. Copy numbers are broken down by colour by copy number.';
    const url = await this.s3.getS3Url(key, bucket);
    return {
      legend,
      plotURL: url ? this.getStreamUrl(url) : '',
      fileId,
    };
  }

  public async getPurplePurityRangePlot(
    sampleId: string,
    user: IUserWithMetadata,
  ): Promise<IPlot> {
    const { fileId, key, bucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_qc',
      this.customTypeWhereBuilder('purple_purity_range'),
      sampleId,
    );
    const legend = "The following 'sunrise' chart shows the range of scores of all examined solutions of purity and ploidy. Crosshairs identify the best purity / ploidy solution.";
    const url = await this.s3.getS3Url(key, bucket);
    return {
      legend,
      plotURL: url ? this.getStreamUrl(url) : '',
      fileId,
    };
  }

  public async getPurpleFittedSegmentsPlot(
    sampleId: string,
    user: IUserWithMetadata,
  ): Promise<IPlot> {
    const { fileId, key, bucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_qc',
      this.customTypeWhereBuilder('purple_fitted_segment'),
      sampleId,
    );
    const legend = 'The contribution of each fitted segment to the final score of the best fit is shown in the following figure. Each segment is divided into its major and minor allele ploidy. The area of each circle shows the weight (AMBER baf count) of each segment.';
    const url = await this.s3.getS3Url(key, bucket);
    return {
      legend,
      plotURL: url ? this.getStreamUrl(url) : '',
      fileId,
    };
  }

  public async getPurpleKataegisClustersPlot(
    sampleId: string,
    user: IUserWithMetadata,
  ): Promise<IPlot> {
    const { fileId, key, bucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_qc',
      this.customTypeWhereBuilder('purple_kataegis_clusters'),
      sampleId,
    );
    const legend = 'A rainfall plot with kataegis clusters highlighted in grey';
    const url = await this.s3.getS3Url(key, bucket);
    return {
      legend,
      plotURL: url ? this.getStreamUrl(url) : '',
      fileId,
    };
  }

  public async getPurpleClonalityModelPlot(
    sampleId: string,
    user: IUserWithMetadata,
  ): Promise<IPlot> {
    const { fileId, key, bucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_qc',
      this.customTypeWhereBuilder('purple_clonality_model'),
      sampleId,
    );
    const legend = 'The top figure shows the histogram of somatic ploidy for all SNV and INDEL in blue. Superimposed are peaks in different colours fitted from the sample as described above while the black line shows the overall fitted ploidy distribution. Red filled peaks are below the 0.85 subclonal threshold. We can determine the likelihood of a variant being subclonal at any given ploidy as shown in the bottom half of the figure.';
    const url = await this.s3.getS3Url(key, bucket);
    return {
      legend,
      plotURL: url ? this.getStreamUrl(url) : '',
      fileId,
    };
  }

  public async getCNVProfilePlot(sampleId: string, user: IUserWithMetadata): Promise<IPlot> {
    const { fileId, key, bucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_qc',
      this.customTypeWhereBuilder('cnv_profile'),
      sampleId,
    );
    const legend = 'Copy Number Profile (WGS)';
    try {
      const url = await this.s3.getS3Url(key, bucket);
      return {
        legend,
        plotURL: url ? this.getStreamUrl(url) : '',
        fileId,
      };
    } catch {
      return null;
    }
  }

  public async getVAFClonalDistPlot(
    sampleId: string,
    user: IUserWithMetadata,
  ): Promise<IPlot> {
    const { fileId, key, bucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_qc',
      this.customTypeWhereBuilder('vaf_clonal_dist'),
      sampleId,
    );
    const legend = 'VAF Clonal Distribution';
    const url = await this.s3.getS3Url(key, bucket);
    return {
      legend,
      plotURL: url ? this.getStreamUrl(url) : '',
      fileId,
    };
  }

  public async getVAFSubclonalDistPlot(
    sampleId: string,
    user: IUserWithMetadata,
  ): Promise<IPlot> {
    const { fileId, key, bucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_qc',
      this.customTypeWhereBuilder('vaf_subclonal_dist'),
      sampleId,
    );
    const legend = 'VAF Subclonal Distribution';
    const url = await this.s3.getS3Url(key, bucket);
    return {
      legend,
      plotURL: url ? this.getStreamUrl(url) : '',
      fileId,
    };
  }

  public async getRigPlot(sampleId: string, user: IUserWithMetadata): Promise<IPlot> {
    const { fileId, key, bucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_qc',
      this.customTypeWhereBuilder('rig_profile'),
      sampleId,
    );
    const legend = 'RIG Profile';
    const url = await this.s3.getS3Url(key, bucket);
    return {
      legend,
      plotURL: url ? this.getStreamUrl(url) : '',
      fileId,
    };
  }

  public async getHTSCulturePlots(
    htsId: string,
    user: IUserWithMetadata,
  ): Promise<HTSCulturePlots> {
    const plots: HTSCulturePlots = {
      CELLS_END: '',
      CELLS_START: '',
      SUNRISE: '',
      LOGR_BAF: '',
      COPY_NUMBER: '',
      QC_PLATE: '',
      QC_CORRELATION:'',
      QC_MONITORING: '',

    };
    const promises: Promise<void>[] = [];
    for (const type of htsCultureTypes) {
      promises.push(
        this.fileTracker.getNetappKey(
          user,
          'zcc_zd_hts',
          this.customHTSWhereBuilder(htsId, type),
        )
          .then(async ({ key, bucket }) => {
            if (key) {
              const url = await this.s3.getS3Url(key, bucket);
              return url ? this.getStreamUrl(url) : '';
            }
            return '';
          })
          .then((url) => {
            plots[type] = url;
          })
          .catch(() => {
            plots[type] = null;
          }),
      );
    }

    await Promise.all(promises);

    return plots;
  }

  public async getHTSDrugHitsPlots(
    htsId: string,
    drugId: string,
    filters: IGetHTHitsPlotsFilters,
    user: IUserWithMetadata,
  ): Promise<HTSDrugHitsPlots> {
    const plots: HTSDrugHitsPlots = {
      AUC: '',
      IC50: '',

      IC50CURVE: '',
      LN50: '',
      LC50: '',

      QC_IC50CURVE: '',
    };
    const promises: Promise<void>[] = [];
    for (const type of htsHitsTypes) {
      if (!filters.plot || filters.plot === type) {
        promises.push(
          this.fileTracker.getNetappKey(
            user,
            'zcc_zd_hts',
            this.customHTSWhereBuilder(htsId, type, drugId),
          )
            .then(async ({ key, bucket }) => {
              if (key) {
                const url = await this.s3.getS3Url(key, bucket);
                return url ? this.getStreamUrl(url) : '';
              }
              return '';
            })
            .then((url) => {
              plots[type] = url;
            })
            .catch(() => {
              plots[type] = null;
            }),
        );
      }
    }

    await Promise.all(promises);

    return plots;
  }

  public async getQCPlots(sampleId: string, user: IUserWithMetadata): Promise<IQCPlots> {
    return {
      purpleSomaticVariantPloidyPlot: await this.getPurpleSomaticVariantPloidyPlot(sampleId, user),
      purpleCopyNumberPlot: await this.getPurpleCopyNumberPlot(sampleId, user),
      purpleMinorAllelePloidyPlot: await this.getPurpleMinorAllelePloidyPlot(sampleId, user),
      purplePurityRangePlot: await this.getPurplePurityRangePlot(sampleId, user),
      purpleClonalityModelPlot: await this.getPurpleClonalityModelPlot(sampleId, user),
      purpleFittedSegmentsPlot: await this.getPurpleFittedSegmentsPlot(sampleId, user),
      vafClonalDistPlot: await this.getVAFClonalDistPlot(sampleId, user),
      vafSubclonalDistPlot: await this.getVAFSubclonalDistPlot(sampleId, user),
      rigPlot: await this.getRigPlot(sampleId, user),
      purpleKataegisClustersPlot: await this.getPurpleKataegisClustersPlot(sampleId, user),
      cnvProfilePlot: await this.getCNVProfilePlot(sampleId, user),
    };
  }

  private customTypeWhereBuilder(type: string) {
    return (qb: Knex.QueryBuilder): void => {
      qb.where('type', type);
    };
  }

  private customRNASeqWhereBuilder(rnaseqId: string, gene: string) {
    return (qb: Knex.QueryBuilder): void => {
      qb.where('rnaseq_id', rnaseqId)
        .andWhere('gene', gene);
    };
  }

  private customFusionWhereBuilder(rnaseqId: string, startGene: string, endGene: string) {
    return (qb: Knex.QueryBuilder): void => {
      qb.where('rnaseq_id', rnaseqId)
        .andWhere('start_gene', startGene)
        .andWhere('end_gene', endGene);
    };
  }

  private customRNAClassifierWhereBuilder(biosampleId: string, type: string) {
    return (qb: Knex.QueryBuilder): void => {
      qb.where('rnaseq_id', biosampleId)
        .andWhere('classifier', type);
    };
  }

  private customMethWhereBuilder(methSampleId: string, gene: string) {
    return (qb: Knex.QueryBuilder): void => {
      qb.where('meth_sample_id', methSampleId)
        .andWhere('gene', gene);
    };
  }

  private customHTSWhereBuilder(htsId: string, type: string, drugId?: string) {
    return (qb: Knex.QueryBuilder): void => {
      qb.where('hts_id', htsId)
        .andWhere('type', type);
      if (drugId) qb.andWhere('drug_id', drugId);
    };
  }
}
