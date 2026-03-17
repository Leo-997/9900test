/* eslint-disable @typescript-eslint/naming-convention */
import { Inject, Injectable } from '@nestjs/common';
import { unflatten } from 'flat';
import { Knex } from 'knex';
import { IGermlineSV, IGermlineSVRaw, IGermlineSVSummary } from 'Models/Curation/GermlineSV/GermlineSvSample.model';
import { ICuratedSampleGermlineSVQuery } from 'Models/Curation/GermlineSV/Requests/GermlineSvSampleQuery.model';
import { IPromoteGermlineSVResp, IUpdateGermlineSVSample } from 'Models/Curation/GermlineSV/Requests/UpdateGermlineSVBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';
import { filterClassification } from 'Utilities/query/classification.util';
import { withPagination } from 'Utilities/query/misc.util';
import {
  classificationCustomOrder, pathclassCustomOrder, toOrderBySQLQuery, toSVColumn,
} from 'Utilities/transformers/SortMapping.util';

@Injectable()
export class GermlineSVCurationClient {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  private sampleGermlineSVTable = 'zcc_curated_sample_germline_sv';

  public async getGermlineSVs(
    biosampleId: string,
    filters: ICuratedSampleGermlineSVQuery,
    user: IUserWithMetadata,
    page = 1,
    limit = 100,
  ): Promise<IGermlineSV[]> {
    let orderByRaw = `
      ${classificationCustomOrder('reportable', 'classification', 'pathclass')} desc, 
      ${pathclassCustomOrder('pathclass')} desc,
      pathscore desc, 
      internalId asc
    `; // internal ID sorting is for differentiating rows that have the same order
    let customSort = '';
    if (filters.sortColumns) {
      const tableAliases = {
        germlineSVTblAlias: 'baseQuery',
      };
      customSort = toOrderBySQLQuery(
        toSVColumn,
        tableAliases,
        filters.sortColumns,
        filters.sortDirections,
      );
    }
    orderByRaw = customSort ? `${customSort}, ${orderByRaw}` : orderByRaw;
    return this.knex
      .select('*')
      .from(
        this.getBaseQuery(
          biosampleId,
          {
            ...filters,
            parentId: filters.parentId === undefined
              ? null
              : filters.parentId,
          },
          user,
        ),
      )
      .where('variant_number', 1)
      .orderByRaw(orderByRaw)
      .modify(withPagination, page, limit)
      .then((rows: IGermlineSVRaw[]) => rows.map((row) => unflatten(row)));
  }

  public async getSampleGermlineSVById(
    biosampleId: string,
    internalId: string,
    user: IUserWithMetadata,
  ): Promise<IGermlineSV> {
    return this.knex
      .select('*')
      .from(
        this.getBaseQuery(
          biosampleId,
          {
            internalId,
          },
          user,
        ),
      )
      .first();
  }

  public async createTransaction(): Promise<Knex.Transaction> {
    return this.knex.transaction();
  }

  private getBaseQuery(
    biosampleId: string,
    filters: ICuratedSampleGermlineSVQuery,
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    const baseQuery = this.knex
      .select({
        internalId: 'a.internal_id',
        variantId: 'a.variant_id',
        biosampleId: 'a.biosample_id',
        parentId: 'a.parent_id',

        // transform at the end to be a nested object: Gene
        'startGene.geneId': 'c.gene_id',
        'startGene.gene': 'c.gene',
        'startGene.chromosome': 'c.chromosome_hg38',
        'startGene.geneStart': 'c.start_hg38',
        'startGene.geneEnd': 'c.end_hg38',
        'startGene.chromosomeBand': 'c.chromosomeBand_hg38',

        // transform at the end to be a nested object: Gene
        'endGene.geneId': 'd.gene_id',
        'endGene.gene': 'd.gene',
        'endGene.chromosome': 'd.chromosome_hg38',
        'endGene.geneStart': 'd.start_hg38',
        'endGene.geneEnd': 'd.end_hg38',
        'endGene.chromosomeBand': 'd.chromosomeBand_hg38',

        // other values
        startGeneExons: 'a.start_gene_exons',
        endGeneExons: 'a.end_gene_exons',
        startFusion: 'a.start_fusion',
        endFusion: 'a.end_fusion',
        chrBkpt1: 'a.chr_bkpt1',
        posBkpt1: 'a.pos_bkpt1',
        chrBkpt2: 'a.chr_bkpt2',
        posBkpt2: 'a.pos_bkpt2',
        startAf: 'a.start_af',
        endAf: 'a.end_af',
        ploidy: 'a.ploidy',
        svType: 'a.sv_type',
        inframe: 'a.inframe',
        platforms: 'a.platforms',
        wgsconf: 'a.wgsconf',
        rnaconf: 'a.rnaconf',
        somaticscore: 'somaticscore',
        pathscore: 'a.pathscore',
        pathclass: 'a.pathclass',
        prismclass: this.knex.raw('COALESCE(c.gene_lists, d.gene_lists)'),
        markDisrupted: 'a.mark_disrupted',
        predictedDisrupted: 'a.disrupted',
        researchCandidate: 'a.research_candidate',

        // reportables
        classification: 'a.classification',
        reportable: 'a.reportable',
        targetable: 'a.targetable',

        // counts
        reportedCount: 'f.reported_count',
        targetableCount: 'f.targetable_count',
      })
      .from<IGermlineSVRaw>({ a: this.sampleGermlineSVTable })
      .leftJoin({ b: 'zcc_curated_sv' }, 'a.variant_id', 'b.variant_id')
      .leftJoin({ c: 'zcc_genes' }, 'b.start_gene_id', 'c.gene_id')
      .leftJoin({ d: 'zcc_genes' }, 'b.end_gene_id', 'd.gene_id')
      .leftJoin({ f: 'zcc_curated_germline_sv_counts' }, 'a.variant_id', 'f.variant_id')
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .where('a.biosample_id', biosampleId)
      .modify(this.withFilters, filters)
      .as('baseQuery');

    return this.knex
      .select(
        '*',
        this.knex.raw(
          `row_number() over(
            partition by variantId 
            order by 
              ${classificationCustomOrder('reportable', 'classification', 'pathclass')} desc,
              ${pathclassCustomOrder('pathclass')} desc,
              (
                CASE
                  WHEN wgsconf = 'High' then 3
                  WHEN wgsconf = 'Med' then 2
                  WHEN wgsconf = 'Low' then 1
                  ELSE 0
                END
              ) * 1 desc
          ) as 'variant_number'`,
        ),
      )
      .from(baseQuery)
      .as('withRowNumber');
  }

  private withFilters(
    qb: Knex.QueryBuilder,
    {
      internalId,
      variantId,
      parentId,
      gene,
      chromosome,
      search,
      classpath,
      svType,
      inframe,
      platform,
      rnaConfidence,
      reportable,
      targetable,
      isClassified,
      defaultFilter,
    }: ICuratedSampleGermlineSVQuery,
  ): void {
    qb
      .andWhere(function internalIdFilter() {
        if (internalId) {
          this.andWhere('a.internal_id', internalId);
        }
      })
      .andWhere(function variantIdFilter() {
        if (variantId) {
          this.andWhere('a.variant_id', variantId);
        }
      })
      .andWhere(function parentFilter() {
        if (parentId !== undefined) {
          this.andWhere('a.parent_id', parentId);
        }
      })
      .andWhere(function allFilters() {
        this.orWhere(function defaultFilters() {
          if (defaultFilter) {
            this.orWhere(function classified() {
              this.modify(filterClassification, 'a.classification', true);
            })
              .orWhere('a.reportable', true)
              .orWhere(function pathclass() {
                this.whereIn('a.pathclass', [
                  'C5: Pathogenic',
                  'C4: Likely Pathogenic',
                  'C3.8: VOUS',
                ]);
              });
          }
        })
          .orWhere(function customFilters() {
            this.andWhere(function geneFilter() {
              if (gene) {
                gene.forEach((g) => this.orWhere('c.gene', g)
                  .orWhere('d.gene', g));
              }
            })
              .andWhere(function chrFilters() {
                if (chromosome) {
                  chromosome.forEach((c) => this.orWhere('c.chromosome_hg38', `chr${c}`).orWhere('d.chromosome_hg38', `chr${c}`));
                }
              })
              .andWhere(function searchFilter() {
                if (search && search.length) {
                  this.where('c.gene', 'like', `%${search}%`)
                    .orWhere('d.gene', 'like', `%${search}%`);
                }
              })
              .andWhere(function classpathFilter() {
                if (classpath) {
                  classpath.forEach((c) => this.orWhere('a.pathclass', c));
                }
              })
              .andWhere(function svTypeFilter() {
                if (svType) {
                  svType.forEach((t) => this.orWhere('a.sv_type', t));
                }
              })
              .andWhere(function inframeFilter() {
                if (inframe && inframe.includes('Unknown')) {
                  this.orWhereNull('a.inframe');
                }
                if (inframe && inframe.length > 0) {
                  this.orWhereIn('a.inframe', inframe);
                }
              })
              .andWhere(function paltformFilter() {
                if (platform?.length) {
                  this.whereIn('a.platforms', platform);
                }
              })
              .andWhere(function rnaConfidenceFilter() {
                if (rnaConfidence?.length) {
                  this.whereIn('a.rnaconf', rnaConfidence);
                }
              })
              .andWhere(function isReportable() {
                if (reportable !== undefined) {
                  this.andWhere('a.reportable', reportable);
                }
              })
              .andWhere(function isTargetable() {
                if (targetable !== undefined) {
                  this.andWhere('a.targetable', targetable);
                }
              })
              .modify(filterClassification, 'a.classification', isClassified);
          });
      });
  }

  public async getGermlineSVSummary(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IGermlineSVSummary> {
    const result: IGermlineSVSummary = {
      biosampleId,
      minScore: await this.knex({ a: this.sampleGermlineSVTable })
        .min('a.pathscore')
        .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
        .where('a.biosample_id', biosampleId)
        .first()
        .then((row) => row['min(`pathscore`)']),
      maxScore: await this.knex({ a: this.sampleGermlineSVTable })
        .max('a.pathscore')
        .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
        .where('a.biosample_id', biosampleId)
        .first()
        .then((row) => row['max(`pathscore`)']),
      avgScore: await this.knex({ a: this.sampleGermlineSVTable })
        .avg('a.pathscore')
        .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
        .where('a.biosample_id', biosampleId)
        .first()
        .then((row) => row['avg(`pathscore`)']),
    };
    return result;
  }

  public async updateGermlineSVById(
    {
      inframe,
      markDisrupted,
      parentId,
      researchCandidate,
      ...rest
    }: IUpdateGermlineSVSample,
    biosampleId: string,
    internalId: string,
    trx?: Knex.Transaction,
  ): Promise<number> {
    const db = trx || this.knex;
    const updates = await db
      .from(this.sampleGermlineSVTable)
      .where('biosample_id', biosampleId)
      .andWhere('internal_id', internalId)
      .update({
        inframe: inframe === 'Unknown' ? null : inframe,
        mark_disrupted: markDisrupted === '' ? null : markDisrupted,
        parent_id: parentId,
        research_candidate: researchCandidate,
        ...rest,
      });

    return updates;
  }

  public async promoteGermlineSV(
    biosampleId: string,
    internalId: string,
    user: IUserWithMetadata,
    trx?: Knex.Transaction,
  ): Promise<IPromoteGermlineSVResp> {
    const sv = await this.getSampleGermlineSVById(biosampleId, internalId, user);
    const prevParent = await this.getSampleGermlineSVById(biosampleId, sv.parentId, user);

    // update child SV with the same value as the old SV
    await this.updateGermlineSVById({
      classification: prevParent.classification,
      targetable: prevParent.targetable,
      pathclass: prevParent.pathclass,
      reportable: prevParent.reportable,
      researchCandidate: prevParent.researchCandidate,
      parentId: null,
    }, biosampleId, internalId, trx);

    // clear the old SV
    await this.updateGermlineSVById({
      classification: null,
      targetable: null,
      pathclass: null,
      reportable: null,
      researchCandidate: null,
      parentId: internalId,
    }, biosampleId, prevParent.internalId, trx);

    // update other children to have the new SV as parent
    const db = trx || this.knex;
    await db.update({
      parent_id: internalId,
    })
      .from(this.sampleGermlineSVTable)
      .where('parent_id', prevParent.internalId);

    return {
      newParentVariantId: sv.variantId,
      oldParentVariantId: prevParent.variantId,
    };
  }

  public async getSampleGermlineSVsCount(
    biosampleId: string,
    filters: ICuratedSampleGermlineSVQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    const data = await this.knex
      .count<Record<string, number>>('* as count')
      .from(this.getBaseQuery(
        biosampleId,
        {
          ...filters,
          parentId: filters.parentId || null,
        },
        user,
      ))
      .where('variant_number', 1)
      .first();

    return data.count;
  }

  public clearSvsPathclass(
    biosampleId: string,
  ): Promise<number> {
    return this.knex(this.sampleGermlineSVTable)
      .update({ pathclass: null })
      .whereNotNull('pathclass')
      .where('biosample_id', biosampleId);
  }
}
