import { Inject, Injectable } from '@nestjs/common';
import type { VariantCounts, VariantSeenInBiosample } from '@zero-dash/types';
import type { PaginationDTO } from '@zero-dash/types/dist/src/common/Pagination.types';
import { Knex } from 'knex';
import { IGermlineCnv } from 'Models/Curation/GermlineCNV/CuratedSampleGermlineCnv.model';
import { ICuratedSampleGermlineCnvQuery } from 'Models/Curation/GermlineCNV/Requests/CuratedSampleGermlineCnvQuery.model';
import { IUpdateSampleGermlineCnv } from 'Models/Curation/GermlineCNV/Requests/UpdateSampleGermlineCnvBody.model';
import { Summary } from 'Models/Curation/Misc.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';

import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withAnalysisSet } from 'Utilities/query/accessControl/withAnalysisSet.util';
import { withAnalysisSetBiosampleXref } from 'Utilities/query/accessControl/withAnalysisSetBiosampleXref.util';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';
import { filterClassification } from 'Utilities/query/classification.util';

import { hasImportance, withVariantImportance } from 'Utilities/query/Importance.util';
import { withPagination } from 'Utilities/query/misc.util';
import { classificationCustomOrder, toGermlineCNVColumn, toOrderBySQLQuery } from 'Utilities/transformers/SortMapping.util';

@Injectable()
export class GermlineCnvCurationClient {
  private sampleGermlineCnvTable = 'zcc_curated_sample_germline_cnv';

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  public async getCuratedSampleGermlineCnvs(
    biosampleId: string,
    filters: ICuratedSampleGermlineCnvQuery,
    user: IUserWithMetadata,
    page = 1,
    limit = 100,
  ): Promise<IGermlineCnv[]> {
    const {
      sortColumns,
      sortDirections,
    } = filters;

    // set sorting
    let orderByRaw = `
      ${classificationCustomOrder('reportable', 'classification', 'pathclass')} desc,
      pathscore desc,
      variant_importance asc,
      b.gene
    `;
    if (sortColumns) {
      const tableAliases = {
        germlineCNVTblAlias: 'a',
        geneTblAlias: 'b',
      };
      orderByRaw = toOrderBySQLQuery(
        toGermlineCNVColumn,
        tableAliases,
        sortColumns,
        sortDirections,
      );
    }

    return this.baseQuery(user)
      .where('a.biosample_id', biosampleId)
      .modify(this.withFilters, filters)
      .orderByRaw(orderByRaw)
      .modify(withPagination, page, limit);
  }

  public async getCuratedSampleGermlineCnvsCount(
    biosampleId: string,
    filters: ICuratedSampleGermlineCnvQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    const data = await this.baseQuery(user)
      .clearSelect()
      .count<Record<string, number>>('* as count')
      .where('a.biosample_id', biosampleId)
      .modify(this.withFilters, filters);

    let count = 0;
    data.forEach((row) => {
      count += row.count;
    });

    return count;
  }

  public async getCuratedSampleGermlineCnvByVariantId(
    biosampleId: string,
    variantId: number,
    user: IUserWithMetadata,
  ): Promise<IGermlineCnv> {
    return this.baseQuery(user)
      .where('a.biosample_id', biosampleId)
      .andWhere('a.variant_id', variantId)
      .first<IGermlineCnv>();
  }

  public async getSampleCopyNumberSummary(biosampleId: string): Promise<Summary> {
    // copy number summary
    const minCN = await this.knex(this.sampleGermlineCnvTable)
      .where('biosample_id', biosampleId)
      .min('avecopynumber as min')
      .first();
    const maxCN = await this.knex(this.sampleGermlineCnvTable)
      .where('biosample_id', biosampleId)
      .max('avecopynumber as max')
      .first();
    const avgCN = await this.knex(this.sampleGermlineCnvTable)
      .where('biosample_id', biosampleId)
      .avg('avecopynumber as avg')
      .first();

    return {
      min: minCN.min,
      max: maxCN.max,
      mid: avgCN.avg,
    };
  }

  public async updateCuratedSampleGermlineCnvByVariantId(
    {
      cnType,
      researchCandidate,
      ...rest
    }: IUpdateSampleGermlineCnv,
    biosampleId: string,
    variantId: number,
  ): Promise<number> {
    let updates = 0;

    // update values
    updates += await this.knex(this.sampleGermlineCnvTable)
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
    return this.knex(this.sampleGermlineCnvTable)
      .update({ pathclass: null })
      .whereNotNull('pathclass')
      .where('biosample_id', biosampleId);
  }

  public getCountsByGeneId(
    variantId: string,
    user: IUserWithMetadata,
  ): Promise<VariantCounts[]> {
    return this.knex
      .select({
        variantId: 'a.gene_id',
        zero2Category: 'analysis.zero2_category',
        zero2Subcategory1: 'analysis.zero2_subcategory1',
        zero2Subcategory2: 'analysis.zero2_subcategory2',
        zero2FinalDiagnosis: 'analysis.zero2_final_diagnosis',
      })
      .countDistinct('biosample.biosample_id as count')
      .from({ a: this.sampleGermlineCnvTable })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .modify(withAnalysisSetBiosampleXref, 'innerJoin', user, ['biosample.biosample_id', 'xref.biosample_id'])
      .modify(withAnalysisSet, 'innerJoin', user, 'xref.analysis_set_id')
      .where('gene_id', variantId)
      .groupBy(
        'analysis.zero2_category',
        'analysis.zero2_subcategory1',
        'analysis.zero2_subcategory2',
        'analysis.zero2_final_diagnosis',
      );
  }

  public getSeenInByGeneId(
    variantId: string,
    user: IUserWithMetadata,
    query: PaginationDTO,
  ): Promise<VariantSeenInBiosample[]> {
    return this.knex.distinct({
      variantId: 'a.gene_id',
      analysisSetId: 'xref.analysis_set_id',
      patientId: 'analysis.patient_id',
      sequencedEvent: 'analysis.sequenced_event',
      biosampleId: 'xref.biosample_id',
      zero2Category: 'analysis.zero2_category',
      zero2Subcategory1: 'analysis.zero2_subcategory1',
      zero2Subcategory2: 'analysis.zero2_subcategory2',
      zero2FinalDiagnosis: 'analysis.zero2_final_diagnosis',
    })
      .from({ a: this.sampleGermlineCnvTable })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .modify(withAnalysisSetBiosampleXref, 'innerJoin', user, ['biosample.biosample_id', 'xref.biosample_id'])
      .modify(withAnalysisSet, 'innerJoin', user, 'xref.analysis_set_id')
      .where('a.gene_id', variantId)
      .modify(withPagination, query.page, query.limit);
  }

  private baseQuery(
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    return this.knex
      .select({
        variantId: 'a.variant_id',
        geneId: 'a.gene_id',
        gene: 'b.gene',
        biosampleId: 'a.biosample_id',
        chromosome: 'b.chromosome_hg38',
        cytoband: 'b.chromosomeBand_hg38',
        averageCN: 'a.avecopynumber',
        cnType: 'a.cn_type',
        prism: 'b.gene_lists',
        platform: 'a.platforms',
        pathclass: 'a.pathclass',
        pathscore: 'a.pathscore',
        totalSampleCount: 'c.sample_count',
        cancerTypeCount: 'c.cancer_types',
        maxCN: 'a.avecopynumber',
        minCN: 'a.avecopynumber',
        researchCandidate: 'a.research_candidate',

        // reportables
        classification: 'a.classification',
        reportable: 'a.reportable',
        targetable: 'a.targetable',

        // counts
        reportedCount: 'c.reported_count',
        targetableCount: 'c.targetable_count',
      })
      .from<IGermlineCnv[]>({ a: this.sampleGermlineCnvTable })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .leftJoin({ b: 'zcc_genes' }, 'a.gene_id', 'b.gene_id')
      .leftJoin({ c: 'zcc_curated_germline_cnv_counts' }, function countsJoin() {
        this.on('a.gene_id', 'c.gene_id').andOn('a.cn_type', 'c.cn_type');
      })
      .modify(withVariantImportance, 'b.gene_lists', 'a.pathclass');
  }

  private withFilters(qb: Knex.QueryBuilder, filters: ICuratedSampleGermlineCnvQuery): void {
    qb.andWhere(function customWhereBuilder() {
      if (filters.cn && filters.cn.length > 0) {
        this.where('a.avecopynumber', '<=', filters.cn[0]);

        if (filters.cn[1] < Infinity) {
          this.orWhere('a.avecopynumber', '>=', filters.cn[1]);
        }
      }
    })
      .andWhere(function customWhereBuilder() {
        if (filters.cnType && filters.cnType.length > 0) {
          this.whereIn('a.cn_type', filters.cnType);
        }
      })
      .andWhere(function customWhereBuilder() {
        if (filters.isLOH === true) {
          this.andWhere('a.cn_type', 'LOH');
        }
      })
      .andWhere(function customWhereBuilder() {
        if (filters.chromosome) {
          filters.chromosome.forEach((c) => {
            this.orWhere('b.chromosome_hg38', `chr${c}`);
          });
        }
      })
      .andWhere(function customWhereBuilder() {
        if (filters.gene) {
          filters.gene.forEach((g) => {
            this.orWhere('b.gene', g);
          });
        }
      })
      .andWhere(function custom() {
        if (filters.search && filters.search.length) {
          this.where('b.gene', 'like', `%${filters.search}%`);
        }
      })
      .andWhere(function custom() {
        if (filters.classpath) {
          filters.classpath.forEach((c) => {
            this.orWhere('a.pathclass', c);
          });
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
  }
}
