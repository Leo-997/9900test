import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import {
  IAlias,
  IBiosample, IBiosampleFilters, IPipeline, IPipelinesFilters,
} from 'Models/Analysis/Biosamples.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withAnalysisSetBiosampleXref } from 'Utilities/query/accessControl/withAnalysisSetBiosampleXref.util';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';
import { withPagination } from 'Utilities/query/misc.util';

@Injectable()
export class BiosamplesClient {
  private readonly pipelinesTable = 'zcc_pipelines';

  private readonly aliasTable = 'zcc_alias';

  private rnaPipelineName = 'mwonge/graphene-rna/carbonite';

  private wgsPipelineName = 'mwonge/graphene-dev/graphene-hmftools';

  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) {}

  public async getBiosamples(
    filters: IBiosampleFilters,
    user: IUserWithMetadata,
    skipAccessControl = false,
  ): Promise<IBiosample[]> {
    return this.getBiosampleBase(user, skipAccessControl)
      .modify(this.withFilters, filters, user, skipAccessControl);
  }

  public async getBiosampleCount(
    filters: IBiosampleFilters,
    user: IUserWithMetadata,
  ): Promise<number> {
    const data = await this.getBiosampleBase(user)
      .clearSelect()
      .modify(this.withFilters, filters, user)
      .count<Record<string, number>>('* as count')
      .first();

    return data?.count ?? 0;
  }

  public async getPipelines(
    filters: IPipelinesFilters,
    user: IUserWithMetadata,
  ): Promise<IPipeline[]> {
    return this.knex
      .select({
        pipelineId: 'pipeline.pipeline_id',
        biosampleId: 'biosample.biosample_id',
        pipelineName: this.knex.raw(`
          CASE
            when pipeline.pipeline_name = '${this.wgsPipelineName}' then 'WGS Graphene'
            when pipeline.pipeline_name = '${this.rnaPipelineName}' then 'RNA Carbonite'
            else pipeline.pipeline_name
          END
        `),
        pipelineVersion: 'pipeline.pipeline_vers',
        runDate: 'pipeline.run_date',
        taskId: 'pipeline.task_id',
        taskStatus: 'pipeline.task_status',
      })
      .from({ pipeline: this.pipelinesTable })
      .modify(withBiosample, 'innerJoin', user, 'pipeline.biosample_id')
      .where(function addFilters() {
        if (filters.biosamples && filters.biosamples.length) {
          this.whereIn('biosample.biosample_id', filters.biosamples);
        }
        if (filters.name) {
          this.where('pipeline.pipeline_name', filters.name);
        }
      })
      // only show wgs and rna pipelines
      .whereIn('pipeline.pipeline_name', [
        this.rnaPipelineName,
        this.wgsPipelineName,
      ]);
  }

  public async getBiosampleById(
    id: string,
    user: IUserWithMetadata,
  ): Promise<IBiosample> {
    return this.getBiosampleBase(user)
      .where('biosample.biosample_id', id);
  }

  public async getBiosampleAliases(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IAlias[]> {
    return this.knex
      .select({
        biosampleId: 'alias.biosample_id',
        alias: 'alias.alias',
        aliasType: 'alias.alias_type',
      })
      .from({ alias: this.aliasTable })
      .modify(withBiosample, 'innerJoin', user, 'alias.biosample_id')
      .where('biosample.biosample_id', biosampleId);
  }

  private getBiosampleBase(
    user: IUserWithMetadata,
    skipAccessControl = false,
  ): Knex.QueryBuilder {
    return this.knex
      .select({
        biosampleId: 'biosample.biosample_id',
        patientId: 'biosample.patient_id',
        publicSubjectId: 'biosample.public_subject_id',
        biosampleUUID: 'biosample.biosample_uuid',
        lmSubjId: 'biosample.lm_subj_id',
        manifestId: 'biosample.manifest_id',
        manifestName: 'biosample.manifest_name',
        providerId: 'biosample.provider_id',
        platformId: 'biosample.platform_id',
        sampleType: 'biosample.sample_type',
        biosampleStatus: 'biosample.biosample_status',
        biosampleType: 'biosample.biosample_type',
        biosampleSource: 'biosample.biosample_source',
        biomaterialId: 'biosample.biomaterial_id',
        ancestorBiomaterial: 'biosample.ancestor_biomaterial',
        biomaterialName: 'biosample.biomaterial_name',
        specimen: 'biosample.specimen',
        specimenState: 'biosample.specimen_state',
        ageAtSample: 'biosample.age_at_sample',
        collectionDate: 'biosample.collection_date',
        processingDate: 'biosample.processing_date',
        sequencingDate: 'biosample.sequencing_date',
        sampleOriginType: 'biosample.sample_origin_type',
        published: 'biosample.published',
        stage: 'biosample.stage',
        status: 'biosample.status',
      })
      .modify(withBiosample, 'from', user, undefined, skipAccessControl);
  }

  private withFilters(
    qb: Knex.QueryBuilder,
    filters: IBiosampleFilters,
    user: IUserWithMetadata,
    skipAccessControl = false,
  ): void {
    if (filters.analysisSetId) {
      qb
        .modify(
          withAnalysisSetBiosampleXref,
          'innerJoin',
          user,
          ['xref.biosample_id', 'biosample.biosample_id'],
          skipAccessControl,
        );
    }
    qb
      .where(function addFilters() {
        if (filters.patientId) {
          this.where('biosample.patient_id', filters.patientId);
        }

        if (filters.analysisSetId) {
          this.where('xref.analysis_set_id', filters.analysisSetId);
        }

        if (filters.search && filters.search.length) {
          this.where(function searchFilter() {
            for (const str of filters.search) {
              this.orWhere('biosample.patient_id', 'like', `%${str}%`)
                .orWhere('biosample.public_subject_id', 'like', `%${str}%`)
                .orWhere('biosample.biosample_id', 'like', `%${str}%`)
                .orWhere('biosample.biosample_uuid', 'like', `%${str}%`);
            }
          });
        }

        if (filters.sampleTypes && filters.sampleTypes.length) {
          this.whereIn('biosample.sample_type', filters.sampleTypes);
        }
      });

    if (filters.page !== undefined && filters.limit !== undefined) {
      qb.modify(withPagination, filters.page, filters.limit);
    }
  }
}
