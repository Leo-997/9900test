import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { ISomaticCnv } from 'Models/Curation/CNV/CuratedSampleSomaticCnv.model';

import { ICuratedSampleSomaticCnvsQuery } from 'Models/Curation/CNV/Requests/CuratedSampleSomaticCnvsQuery.model';
import { CNVSummary } from 'Models/Curation/Misc.model';
import { filterClassification } from 'Utilities/query/classification.util';
import {
  hasImportance,
  withVariantImportance,
} from 'Utilities/query/Importance.util';
import { withPagination } from 'Utilities/query/misc.util';

import { IUpdateSampleSomaticCnv } from 'Models/Curation/CNV/Requests/UpdateSampleSomaticCnvBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';
import {
  classificationCustomOrder,
  pathclassCustomOrder,
  toCNVColumn, toOrderBySQLQuery,
} from 'Utilities/transformers/SortMapping.util';

@Injectable()
export class CnvCurationClient {
  private sampleSomaticCnvTable = 'zcc_curated_sample_somatic_cnv';

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  public async getCuratedSampleSomaticCnvs(
    biosampleId: string,
    filters: ICuratedSampleSomaticCnvsQuery,
    user: IUserWithMetadata,
    page = 1,
    limit = 100,
  ): Promise<ISomaticCnv[]> {
    const {
      sortColumns,
      sortDirections,
    } = filters;

    // set sorting
    let orderByRaw = `
      ${classificationCustomOrder('a.reportable', 'a.classification', 'a.pathclass')} desc,
      ${pathclassCustomOrder('a.pathclass')} desc,
      helium_score desc,
      variant_importance asc, 
      b.gene
    `;
    if (sortColumns) {
      const tableAliases = {
        somaticCNVTblAlias: 'a',
        geneTblAlias: 'b',
      };
      orderByRaw = toOrderBySQLQuery(toCNVColumn, tableAliases, sortColumns, sortDirections);
    }

    const query = this.baseQuery(user)
      .where('a.biosample_id', biosampleId)
      .modify(this.withFilters, filters)
      .orderByRaw(orderByRaw)
      .modify(withPagination, page, limit);

    return query;
  }

  public async getCuratedSampleSomaticCnvCount(
    biosampleId: string,
    filters: ICuratedSampleSomaticCnvsQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    const data = await this.baseQuery(user)
      .clearSelect()
      .count<Record<string, number>>('* as count')
      .modify(this.withFilters, filters)
      .where('a.biosample_id', biosampleId)
      .first();

    return data ? data.count : 0;
  }

  public getCuratedSampleSomaticCnvByVariantId(
    biosampleId: string,
    variantId: number,
    user: IUserWithMetadata,
  ): Promise<ISomaticCnv> {
    return this.baseQuery(user)
      .where('a.biosample_id', biosampleId)
      .andWhere('a.variant_id', variantId)
      .first();
  }

  public async getSampleCopyNumberSummary(
    biosampleId: string,
  ): Promise<CNVSummary> {
    // copy number summary
    const minCN = await this.knex(this.sampleSomaticCnvTable)
      .where('biosample_id', biosampleId)
      .min('minCN as min')
      .first();
    const maxCN = await this.knex(this.sampleSomaticCnvTable)
      .where('biosample_id', biosampleId)
      .max('maxCN as max')
      .first();
    const avgCN = await this.knex(this.sampleSomaticCnvTable)
      .where('biosample_id', biosampleId)
      .avg('minCN as avg')
      .first();

    const minZScore = await this.knex(this.sampleSomaticCnvTable)
      .where('biosample_id', biosampleId)
      .min('rna_zscore as min')
      .first();
    const maxZScore = await this.knex(this.sampleSomaticCnvTable)
      .where('biosample_id', biosampleId)
      .max('rna_zscore as max')
      .first();
    const avgZScore = await this.knex(this.sampleSomaticCnvTable)
      .where('biosample_id', biosampleId)
      .avg('rna_zscore as avg')
      .first();

    return {
      copyNumber: {
        min: minCN.min,
        max: maxCN.max,
        mid: avgCN.avg,
      },
      zScore: {
        min: minZScore.min,
        max: maxZScore.max,
        mid: avgZScore.avg,
      },
    };
  }

  public async updateCuratedSampleSomaticCnvByVariantId(
    {
      cnType,
      researchCandidate,
      ...rest
    }: IUpdateSampleSomaticCnv,
    variantId: number,
    biosampleId: string,
  ): Promise<number> {
    let updates = 0;

    // update values
    updates += await this.knex(this.sampleSomaticCnvTable)
      .where('biosample_id', biosampleId)
      .andWhere('variant_id', variantId)
      .update({
        cn_type: cnType,
        research_candidate: researchCandidate,
        ...rest,
      });
    return updates;
  }

  public clearCnvsPathclass(
    biosampleId: string,
  ): Promise<number> {
    return this.knex(this.sampleSomaticCnvTable)
      .update({ pathclass: null })
      .whereNotNull('pathclass')
      .where('biosample_id', biosampleId);
  }

  private baseQuery(
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    return this.knex
      .select({
        biosampleId: 'a.biosample_id',
        variantId: 'a.variant_id',
        geneId: 'a.gene_id',
        gene: 'b.gene',
        chromosome: 'b.chromosome_hg38',
        cytoband: 'b.chromosomeBand_hg38',
        averageCN: 'a.avecopynumber',
        minCn: 'a.minCN',
        maxCn: 'a.maxCN',
        minMinorAlleleCn: 'a.minMinorAlleleCN',
        cnType: 'a.cn_type',
        prism: 'c.gene_lists',
        platform: 'a.platforms',
        rnaTpm: 'a.rna_tpm',
        rnaMedianTpm: 'a.rna_median_tpm',
        rnaZScore: 'a.rna_zscore',
        fc: 'a.fc',
        pathclass: 'a.pathclass',
        researchCandidate: 'a.research_candidate',

        // reportables
        classification: 'a.classification',
        reportable: 'a.reportable',
        targetable: 'a.targetable',

        // helium
        heliumScore: 'a.helium_score',
        heliumBreakdown: 'a.helium_comment',

        // counts
        reportedCount: 'cnt.reported_count',
        targetableCount: 'cnt.targetable_count',
      })
      .from<ISomaticCnv>({ a: this.sampleSomaticCnvTable })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .leftJoin({ b: 'zcc_genes' }, 'a.gene_id', 'b.gene_id')
      .leftJoin({ c: 'zcc_prism_genes' }, 'a.gene_id', 'c.gene_id')
      .leftJoin({ cnt: 'zcc_curated_somatic_cnv_counts' }, (qb) => {
        qb.on('a.gene_id', 'cnt.gene_id');
        qb.andOn('a.cn_type', 'cnt.cn_type');
      })
      .modify(withVariantImportance, 'c.gene_lists', 'a.pathclass');
  }

  private withFilters(qb: Knex.QueryBuilder, filters: ICuratedSampleSomaticCnvsQuery): void {
    qb.andWhere(function filterFunctions() {
      this.orWhere(function defaultFilters() {
        if (filters.defaultFilter) {
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
          this.andWhere(function custom() {
            if (filters.cn && filters.cn.length > 0) {
              this.where('a.minCN', '<=', filters.cn[0]);

              if (filters.cn[1] < Infinity) {
                this.orWhere('a.minCN', '>=', filters.cn[1]);
              }
            }
          })
            .andWhere(function cnTypeFilter() {
              if (filters.cnType && filters.cnType.length > 0) {
                this.whereIn('a.cn_type', filters.cnType);
              }
            })
            .andWhere(function loh() {
              if (filters.isLOH) {
                this.andWhere('a.minMinorAlleleCN', '<', 0.5);
              }
            })
            .andWhere(function custom() {
              if (filters.chromosome) {
                filters.chromosome.forEach((c) => this.orWhere('b.chromosome_hg38', `chr${c}`));
              }
            })
            .andWhere(function custom() {
              if (filters.gene) {
                filters.gene.forEach((g) => this.orWhere('b.gene', g));
              }
            })
            .andWhere(function custom() {
              if (filters.search && filters.search.length) {
                this.where('b.gene', 'like', `%${filters.search}%`);
              }
            })
            .andWhere(function custom() {
              if (filters.classpath) {
                filters.classpath.forEach((c) => this.orWhere('a.pathclass', c));
              }
            })
            .andWhere(function custom() {
              if (filters.sortColumns && filters.sortColumns.includes('RNA Z-Score')) {
                this.whereNot('a.rna_zscore', null);
              }
            })
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
            .modify(hasImportance, 'variant_importance', filters.importance);
        });
    });
  }
}
