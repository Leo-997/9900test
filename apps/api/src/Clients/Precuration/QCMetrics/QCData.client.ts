import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import {
  IImmunoprofile,
  IRNASeqMetrics,
  ISeqMetrics,
} from 'Models/Precuration/QCData.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { S3Service } from 'Modules/S3/S3.service';
import { FileTrackerService } from 'Services/FileTracker/FileTracker.service';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';

@Injectable()
export class QCDataClient {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    @Inject(S3Service) private readonly s3: S3Service,
    @Inject(FileTrackerService) private readonly fileTracker: FileTrackerService,
  ) {}

  private qcDataTable = 'zcc_seq_metrics';

  private rnaseqMetricsTable = 'zcc_rnaseq_metrics';

  private immunoprofileTable = 'zcc_curated_sample_immunoprofile';

  public getMetricsData(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<ISeqMetrics> {
    return this.knex
      .select({
        biosampleId: 'a.biosample_id',
        platformId: 'a.platform_id',
        meanCoverage: 'a.mean_coverage',
        x20: 'a.x20',
        x30: 'a.x30',
        x50: 'a.x50',
        amberQC: 'a.amber_qc',
        amberContaminationPct: 'a.amber_contamination_pct',
        qcStatus: 'a.qc_status',
        createdAt: 'a.created_at',
        updatedAt: 'a.updated_at',
        createdBy: 'a.created_by',
        updatedBy: 'a.updated_by',
      })
      .from<ISeqMetrics>({ a: this.qcDataTable })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .andWhere('a.biosample_id', biosampleId)
      .first();
  }

  public getRNASeqMetrics(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IRNASeqMetrics> {
    return this.knex
      .select({
        rnaBiosample: 'metrics.biosample_id',
        uniqMappedReads: 'metrics.uniq_mapped_reads',
        uniqMappedReadsPct: 'metrics.uniq_mapped_reads_pct',
        rin: 'metrics.rin',
      })
      .from<IRNASeqMetrics>({ metrics: this.rnaseqMetricsTable })
      .modify(withBiosample, 'innerJoin', user, 'metrics.biosample_id')
      .where('metrics.biosample_id', biosampleId)
      .first();
  }

  async getImmunoprofile(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IImmunoprofile> {
    return this.knex
      .select({
        biosampleId: 'immuno.biosample_id',
        ipassValue: this.knex.raw('MAX(CASE WHEN immuno.name = "IPASS" THEN immuno.value END)'),
        ipassStatus: this.knex.raw('MAX(CASE WHEN immuno.name = "IPASS" THEN immuno.status END)'),
        ipassptile: this.knex.raw('MAX(CASE WHEN immuno.name ="IPASS" THEN immuno.percentile END)'),
        cd8Value: this.knex.raw('MAX(CASE WHEN immuno.name = "CD8" THEN immuno.value END)'),
        cd8ptile: this.knex.raw('MAX(CASE WHEN immuno.name = "CD8" THEN immuno.percentile END)'),
        m1m2Value: this.knex.raw('MAX(CASE WHEN immuno.name = "M1M2" THEN immuno.value END)'),
        m1m2ptile: this.knex.raw('MAX(CASE WHEN immuno.name = "M1M2" THEN immuno.percentile END)'),
      })
      .from({ immuno: this.immunoprofileTable })
      .modify(withBiosample, 'innerJoin', user, 'immuno.biosample_id')
      .where('immuno.biosample_id', biosampleId)
      .groupBy('immuno.biosample_id')
      .first();
  }

  public async getReportLink(biosampleId: string, user: IUserWithMetadata): Promise<string> {
    const { key, bucket } = await this.fileTracker.getNetappKey(
      user,
      'zcc_zd_qc',
      this.customTypeWhereBuilder('report'),
      biosampleId,
    );
    const link = await this.s3.getS3Url(key, bucket);
    return link ?? '';
  }

  private customTypeWhereBuilder(type: string) {
    return (qb: Knex.QueryBuilder): void => {
      qb.where('type', type);
    };
  }
}
