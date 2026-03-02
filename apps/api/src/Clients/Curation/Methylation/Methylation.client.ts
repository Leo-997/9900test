import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IGetReportableVariant } from 'Models/Common/Requests/GetReportableVariant.model';
import type { ClassifierVersionFiltersDTO, IClassifierVersion, UpdateClassifierBodyDTO } from 'Models/Curation/Classifiers/Classifiers.model';
import {
  IClassifierGroup,
  ICohortPointData,
  ICohortStats,
  IGetMethGroupQuery,
  IMethCounts,
  IMethGeneTable,
  IMethylationData,
  IMethylationGeneData,
  IMethylationPredictionData,
} from 'Models/Curation/Methylation/Methylation.model';
import { IMethResultBody } from 'Models/Curation/Methylation/Requests/CreateMethResultBody.model';
import {
  IMethPredBody,
  IMethUpdateBody,
  IMethUpdateGeneBody,
} from 'Models/Curation/Methylation/Requests/UpdateMethBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withAnalysisSet } from 'Utilities/query/accessControl/withAnalysisSet.util';
import { withAnalysisSetBiosampleXref } from 'Utilities/query/accessControl/withAnalysisSetBiosampleXref.util';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';
import { filterClassification } from 'Utilities/query/classification.util';
import { withPagination } from 'Utilities/query/misc.util';
import { classificationCustomOrder, methGeneCustomOrder } from 'Utilities/transformers/SortMapping.util';

@Injectable()
export class MethylationClient {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) {}

  public getMethData(
    biosampleId: string,
    filters: IGetReportableVariant,
    user: IUserWithMetadata,
  ): Promise<IMethylationData[]> {
    const chipVersion = this.knex
      .select('platform.platform')
      .modify(withBiosample, 'from', user)
      .leftJoin({ platform: 'zcc_platforms' }, 'biosample.platform_id', 'platform.platform_id')
      .where('biosample.biosample_id', biosampleId)
      .first();

    const providerId = this.knex
      .select('provider_id')
      .modify(withBiosample, 'from', user)
      .where('biosample_id', biosampleId)
      .first();

    return this.knex
      .select({
        chipVersion,
        providerId,
        biosampleId: 'a.biosample_id',
        groupId: 'a.meth_group_id',
        score: 'a.meth_class_score',
        interpretation: 'a.interpretation',
        match: 'a.match_zcc',
        reportable: 'a.reportable',
        targetable: 'a.targetable',
        classification: 'a.classification',
        researchCandidate: 'a.research_candidate',

        // groups
        description: 'b.meth_summary',
        groupName: 'b.group_name',
        classId: 'b.meth_class_id',

        // counts
        reportedCount: 'c.reported_count',
        targetableCount: 'c.targetable_count',

        // classifiers
        version: 'd.version',
        classifierName: 'd.description',
      })
      .from<IMethylationData>({ a: 'zcc_curated_sample_somatic_methylation' })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .leftJoin(
        { b: 'zcc_methylation_group' },
        'b.meth_group_id',
        'a.meth_group_id',
      )
      .leftJoin(
        { c: 'zcc_curated_somatic_methylation_counts' },
        'c.meth_group_id',
        'a.meth_group_id',
      )
      .leftJoin(
        { d: 'zcc_methylation_classifier' },
        'b.meth_classifier_id',
        'd.meth_classifier_id',
      )
      .where('a.biosample_id', biosampleId)
      .andWhere(function isReportable() {
        if (filters.reportable !== undefined) {
          this.andWhere('a.reportable', filters.reportable);
        }
      })
      .andWhere(function isTargetable() {
        if (filters.targetable !== undefined) {
          this.andWhere('a.targetable', filters.targetable);
        }
      })
      .modify(filterClassification, 'a.classification', filters.isClassified)
      .orderBy('a.meth_class_score', 'desc');
  }

  public async countMethMGMT(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IMethCounts> {
    const geneRow = await this.knex
      .select('gene_id')
      .from('zcc_genes')
      .where('gene', 'MGMT')
      .first();
    const platformRow = await this.knex
      .select('platform_id')
      .from('zcc_platforms')
      .where('platform', 'Illumina MethylationEPIC v2.0')
      .first();

    const geneId = geneRow?.gene_id;
    const platformId = platformRow?.platform_id;

    const biosampleQuery = this.knex
      .select('anno.biosample_id')
      .from({ probe: 'zcc_methylation_probe' })
      .modify(withBiosample, 'innerJoin', user, 'anno.biosample_id')
      .leftJoin({ anno: 'zcc_methylation_anno' }, 'probe.probe_id', 'anno.probe_id')
      .where('probe.platform_id', platformId);

    const baseQuery = this.knex
      .from({ methGenes: 'zcc_curated_sample_methylation_genes' })
      .modify(withBiosample, 'innerJoin', user, 'methGenes.biosample_id')
      .modify(withAnalysisSetBiosampleXref, 'innerJoin', user, ['biosample.biosample_id', 'xref.biosample_id'])
      .modify(withAnalysisSet, 'innerJoin', user, 'xref.analysis_set_id')
      .where('aset.zero2_category', 'CNS')
      .whereIn('methGenes.biosample_id', biosampleQuery)
      .whereNot('methGenes.biosample_id', biosampleId)
      .where('methGenes.gene_id', geneId);

    const methylatedCount = await baseQuery.clone()
      .where('methGenes.meth_status', 'methylated')
      .count('* as methylatedCount')
      .first<{ methylatedCount?: number }>();

    const unmethylatedCount = await baseQuery.clone()
      .where('methGenes.meth_status', 'unmethylated')
      .count('* as unmethylatedCount')
      .first<{ unmethylatedCount?: number }>();

    const result: IMethCounts = {
      methylatedCount: methylatedCount?.methylatedCount ?? 0,
      unmethylatedCount: unmethylatedCount?.unmethylatedCount ?? 0,
    };

    return result;
  }

  public async getMethMGMTCohort(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<ICohortStats[]> {
    const geneRow = await this.knex
      .select('gene_id')
      .from('zcc_genes')
      .where('gene', 'MGMT')
      .first();
    const platformRow = await this.knex
      .select('platform_id')
      .from('zcc_platforms')
      .where('platform', 'Illumina MethylationEPIC v2.0')
      .first();

    const geneId = geneRow?.gene_id;
    const platformId = platformRow?.platform_id;

    if (!geneId || !platformId) {
      return [];
    }

    const baseQuery = this.knex
      .select({
        x: 'anno.probe_id',
        methStatus: 'methGenes.meth_status',
        gene: 'genes.gene',
        y: this.knex.raw('AVG(anno.beta)'),
        high: this.knex.raw('GREATEST(AVG(anno.beta) + 2 * STDDEV(anno.beta), 0)'),
        low: this.knex.raw('GREATEST(AVG(anno.beta) - 2 * STDDEV(anno.beta), 0)'),
        pos: 'probe.start_hg38',
      })
      .from({ methGenes: 'zcc_curated_sample_methylation_genes' })
      .modify(withBiosample, 'innerJoin', user, 'methGenes.biosample_id')
      .modify(withAnalysisSetBiosampleXref, 'innerJoin', user, ['biosample.biosample_id', 'xref.biosample_id'])
      .modify(withAnalysisSet, 'innerJoin', user, 'xref.analysis_set_id')
      .leftJoin({ xref: 'zcc_methylation_probe_genes_xref' }, 'xref.gene_id', 'methGenes.gene_id')
      .innerJoin({ genes: 'zcc_genes' }, 'genes.gene_id', 'methGenes.gene_id')
      .leftJoin({ anno: 'zcc_methylation_anno' }, function joinAnno() {
        this.on('anno.biosample_id', '=', 'methGenes.biosample_id')
          .andOn('anno.probe_id', '=', 'xref.probe_id');
      })
      .leftJoin({ probe: 'zcc_methylation_probe' }, 'probe.probe_id', 'anno.probe_id')
      .where('probe.platform_id', platformId)
      .andWhere('genes.gene_id', geneId)
      .andWhere('analysis.zero2_category', 'CNS')
      .groupBy(['anno.probe_id', 'methGenes.meth_status'])
      .orderBy([
        { column: 'probe.start_hg38', order: 'asc' },
        { column: 'anno.probe_id', order: 'asc' },
      ]);

    const methylatedRows = await baseQuery.clone()
      .where('methGenes.meth_status', 'methylated')
      .whereRaw('methGenes.biosample_id != ?', biosampleId);
    const unmethylatedRows = await baseQuery.clone()
      .where('methGenes.meth_status', 'unmethylated')
      .whereRaw('methGenes.biosample_id != ?', biosampleId);
    const biosampleRows = await baseQuery.clone()
      .where('methGenes.biosample_id', biosampleId);

    const result = [
      this.formatResults('methylated', methylatedRows),
      this.formatResults('unmethylated', unmethylatedRows),
      this.formatResults(biosampleId, biosampleRows),
    ];

    return result;
  }

  private formatResults = (id: string, rows: ICohortPointData[]): ICohortStats => ({
    id,
    data: rows
      .sort((a, b) => {
        if (a.pos !== null && b.pos !== null && a.pos !== b.pos) {
          return a.pos - b.pos;
        }
        return a.x.localeCompare(b.x);
      }),
  });

  public getMethGeneData(
    biosampleId: string,
    filters: IGetReportableVariant,
    user: IUserWithMetadata,
  ): Promise<IMethylationGeneData[]> {
    const orderByRaw = `
      ${methGeneCustomOrder()} desc,
      ${classificationCustomOrder('a.reportable', 'a.classification')} desc,
      b.gene
    `;
    const resp = this.knex
      .select({
        gene: 'b.gene',
        geneId: 'a.gene_id',
        biosampleId: 'a.biosample_id',
        median: 'a.median',
        lowest: 'a.lower',
        highest: 'a.upper',
        status: 'a.meth_status',
        researchCandidate: 'a.research_candidate',
        classification: 'a.classification',
        reportable: 'a.reportable',
        targetable: 'a.targetable',
        reportedCount: 'c.reported_count',
        targetableCount: 'c.targetable_count',
      })
      .from<IMethylationGeneData>({
        a: 'zcc_curated_sample_methylation_genes',
      })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .leftJoin({ b: 'zcc_genes' }, 'a.gene_id', 'b.gene_id')
      .leftJoin(
        { c: 'zcc_curated_methylation_genes_counts' },
        'c.gene_id',
        'b.gene_id',
      )
      .where('a.biosample_id', biosampleId)
      .where(function isReportable() {
        if (filters.reportable !== undefined) {
          this.where('a.reportable', filters.reportable);
        }
      })
      .andWhere(function isTargetable() {
        if (filters.targetable !== undefined) {
          this.andWhere('a.targetable', filters.targetable);
        }
      })
      .modify(filterClassification, 'a.classification', filters.isClassified)
      .orderByRaw(orderByRaw);
    return resp;
  }

  public getMethGeneTable(
    biosampleId: string,
    gene: string,
    user: IUserWithMetadata,
  ): Promise<IMethGeneTable[]> {
    const table = this.knex
      .select({
        biosampleId: 'a.biosample_id',
        betaValue: 'beta',
        mValue: 'mvalue',
        chr: 'chr_hg38',
        start: 'start_hg38',
        end: 'end_hg38',
        island: 'relation_to_island',
        regulatoryFeatureGroup: 'regulatory_feature_group',
        replicateProbeSetByName: 'rep_results_by_name',
        replicateProbeSetBySeq: 'rep_results_by_seq',
        replicateProbeSetByLoc: 'rep_results_by_loc',
        refGeneGroup: 'ucsc_refgene_group',
        probeId: 'a.probe_id',
      })
      .from<IMethGeneTable[]>({
        a: 'zcc_methylation_anno',
      })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .leftJoin({ b: 'zcc_methylation_probe_genes_xref' }, 'a.probe_id', 'b.probe_id')
      .leftJoin({ c: 'zcc_methylation_probe' }, 'a.probe_id', 'c.probe_id')
      .where({

        'a.biosample_id': biosampleId,

        'b.gene_id': gene,
      });
    return table;
  }

  public getMethPredData(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IMethylationPredictionData> {
    const resp = this.knex
      .select({
        biosampleId: 'a.biosample_id',
        status: 'a.meth_status',
        estimated: 'a.estimated',
        ciLower: 'a.ci_lower',
        ciUpper: 'a.ci_upper',
        cutoff: 'a.cutoff',
        classification: 'a.classification',
        reportable: 'a.reportable',
        targetable: 'a.targetable',
        researchCandidate: 'a.research_candidate',
      })
      .from<IMethylationPredictionData>({
        a: 'zcc_curated_sample_somatic_mgmtstatus',
      })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .where('a.biosample_id', biosampleId)
      .first();
    return resp;
  }

  public getClassifiers(
    query: ClassifierVersionFiltersDTO,
  ): Promise<IClassifierVersion[]> {
    const resp = this.knex
      .select({
        id: 'a.meth_classifier_id',
        name: 'a.name',
        version: 'a.version',
        description: 'a.description',
        note: 'a.note',
        showInAtlas: 'a.show_in_atlas',
        type: this.knex.raw('"METHYLATION_CLASSIFIER"'),
      })
      .from<IClassifierVersion[]>({
        a: 'zcc_methylation_classifier',
      })
      .orderBy('name', 'asc')
      .where(function applyFilters() {
        if (query.name) {
          this.where('a.name', 'like', query.name);
        }

        if (query.showInAtlas !== undefined) {
          this.where('a.show_in_atlas', query.showInAtlas);
        }
      });
    return resp;
  }

  public updateClassifer(
    classifierId: string,
    { note }: UpdateClassifierBodyDTO,
  ): Promise<number> {
    return this.knex.update({
      note,
    })
      .from('zcc_methylation_classifier')
      .where('meth_classifier_id', classifierId);
  }

  public getClassifierGroups(
    {
      page = 1,
      limit = 100,
      ...filters
    }: IGetMethGroupQuery,
  ): Promise<IClassifierGroup[]> {
    const resp = this.knex
      .select({
        methGroupId: 'a.meth_group_id',
        methClassifierId: 'a.meth_classifier_id',
        groupName: 'a.group_name',
        externalGroupId: 'a.external_group_id',
        methSummary: 'a.meth_summary',
        methEvidence: 'a.meth_evidence',
        methClass: 'a.meth_class',
        methFamily: 'a.meth_family',
        methSuperfamily: 'a.meth_superfamily',
        createdAt: 'a.created_at',
        updatedAt: 'a.updated_at',
        createdBy: 'a.created_by',
        updatedBy: 'a.updated_by',
      })
      .from<IClassifierGroup[]>({
        a: 'zcc_methylation_group',
      })
      .innerJoin({
        b: 'zcc_methylation_classifier',
      }, 'a.meth_classifier_id', 'b.meth_classifier_id')
      .where(function applyFilters() {
        if (filters.classifierId) {
          this.andWhere('a.meth_classifier_id', filters.classifierId);
        }

        if (filters.search) {
          this.andWhere('a.group_name', 'like', `%${filters.search}%`);
        }
      })
      .modify(withPagination, page, limit)
      .orderBy([
        {
          column: this.knex.select(
            this.knex.raw('concat(b.description, \' \', b.version)'),
          ),
          order: 'asc',
        },
        { column: 'a.group_name', order: 'asc' },
      ]);

    return resp;
  }

  public async updateMeth(
    biosampleId: string,
    groupId: string,
    {
      match,
      score,
      researchCandidate,
      ...rest
    }: IMethUpdateBody,
  ): Promise<number> {
    return this.knex
      .where('a.biosample_id', biosampleId)
      .andWhere('a.meth_group_id', groupId)
      .update({
        meth_class_score: score,
        match_zcc: match,
        research_candidate: researchCandidate,
        ...rest,
      })
      .from<IMethylationData>({ a: 'zcc_curated_sample_somatic_methylation' });
  }

  public async updateMethGene(
    biosampleId: string,
    geneId: string,
    {
      status,
      researchCandidate,
      ...rest
    }: Partial<IMethUpdateGeneBody>,
  ): Promise<number> {
    const query = this.knex({ a: 'zcc_curated_sample_methylation_genes' })
      .update({
        meth_status: status === 'unknown' ? null : status,
        research_candidate: researchCandidate,
        ...rest,
      })
      .where({

        'a.biosample_id': biosampleId,

        'a.gene_id': geneId,
      });
    return query;
  }

  public async updateMethPred(
    biosampleId: string,
    {
      status,
      ciLower,
      ciUpper,
      researchCandidate,
      ...rest
    }: IMethPredBody,
  ): Promise<number> {
    return this.knex
      .where('a.biosample_id', biosampleId)
      .update({
        meth_status: status === 'unknown' ? null : status,
        ci_lower: ciLower,
        ci_upper: ciUpper,
        research_candidate: researchCandidate,
        ...rest,
      })
      .from<IMethylationPredictionData>({
        a: 'zcc_curated_sample_somatic_mgmtstatus',
      });
  }

  public async createMethResult(
    biosampleId: string,
    { groupId, score, interpretation }: IMethResultBody,
  ): Promise<number> {
    return this.knex
      .insert({
        biosample_id: biosampleId,
        meth_group_id: groupId,
        meth_class_score: score,
        interpretation,
      })
      .into(
        'zcc_curated_sample_somatic_methylation',
      );
  }
}
