import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

import { ICuratedSampleSomaticSnvsQuery } from 'Models/Curation/SNV/Requests/CuratedSampleSomaticSNVsQuery.model';
import {
  withPrismGeneListImportance,
  withVariantImportance,
} from 'Utilities/query/Importance.util';
import { filterClassification } from 'Utilities/query/classification.util';

import { ISomaticSnv, type SNVVariantSeenInBiosampleDTO } from 'Models/Curation/SNV/CuratedSampleSomaticSNV.model';
import { IUpdateCuratedSampleSomaticSNVsByIdBody } from 'Models/Curation/SNV/Requests/UpdateCuratedSampleSomaticSNVsByIdBody.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withPagination } from 'Utilities/query/misc.util';

import { HeliumSummary } from 'Models/Curation/Misc.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { withChromosomeNumericValue } from 'Utilities/query/Chromosome.util';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';
import {
  classificationCustomOrder,
  pathclassCustomOrder,
  toOrderBySQLQuery, toSNVColumn,
} from 'Utilities/transformers/SortMapping.util';
import { VariantSeenInBiosample, type VariantCounts } from '@zero-dash/types';
import { withAnalysisSetBiosampleXref } from 'Utilities/query/accessControl/withAnalysisSetBiosampleXref.util';
import { withAnalysisSet } from 'Utilities/query/accessControl/withAnalysisSet.util';
import { CountsService } from 'Services/Curation/Counts/Counts.service';
import type { ICounts } from 'Models/Common/Common.model';

@Injectable()
export class SnvCurationClient {
  private sampleSomaticSnvTable = 'zcc_curated_sample_somatic_snv';

  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    private readonly countsService: CountsService,
  ) {}

  public async getCuratedSampleSomaticSnvs(
    biosampleId: string,
    filters: ICuratedSampleSomaticSnvsQuery,
    user: IUserWithMetadata,
    page = 1,
    limit = 100,
  ): Promise<ISomaticSnv[]> {
    const {
      sortColumns,
      sortDirections,
      consequence,
    } = filters;

    // set sorting
    let orderByRaw = `
      ${classificationCustomOrder('reportable', 'classification', 'pathclass')} desc, 
      ${pathclassCustomOrder('pathclass')} desc,
      helium_score desc,
      variant_importance asc,
      genes.gene
    `;
    if (sortColumns) {
      const tableAliases = {
        somaticSNVTblAlias: 'somaticSnv',
        geneTblAlias: 'genes',
      };
      orderByRaw = toOrderBySQLQuery(toSNVColumn, tableAliases, sortColumns, sortDirections);
    }

    return this.baseQuery(biosampleId, user, consequence)
      .where('somaticSnv.biosample_id', biosampleId)
      .andWhere('somaticSnv.genotype', '<>', './.')
      .modify(this.withFilters, filters)
      .orderByRaw(orderByRaw)
      .modify(withPagination, page, limit);
  }

  public async getCuratedSampleSomaticSnvByVariantId(
    biosampleId: string,
    variantId: string,
    user: IUserWithMetadata,
  ): Promise<ISomaticSnv> {
    return this.baseQuery(biosampleId, user)
      .where('somaticSnv.genotype', '<>', './.')
      .andWhere('somaticSnv.biosample_id', biosampleId)
      .andWhere('somaticSnv.variant_id', variantId)
      .modify(withBiosample, 'innerJoin', user, 'somaticSnv.biosample_id')
      .first();
  }

  public async getCuratedSampleSomaticSnvsCount(
    biosampleId: string,
    filters: ICuratedSampleSomaticSnvsQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    const data = await this.baseQuery(biosampleId, user, filters.consequence)
      .clearSelect()
      .count<Record<string, number>>('* as count')
      .where('somaticSnv.biosample_id', biosampleId)
      .andWhere('somaticSnv.genotype', '<>', './.')
      .modify(this.withFilters, filters)
      .first();

    return data ? data.count : 0;
  }

  public async getSampleHeliumSummary(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<HeliumSummary> {
    const avg = await this.knex({ somaticSnv: this.sampleSomaticSnvTable })
      .where('somaticSnv.biosample_id', biosampleId)
      .avg('somaticSnv.helium_score as avg')
      .modify(withBiosample, 'innerJoin', user, 'somaticSnv.biosample_id')
      .first();

    return {
      biosampleId,
      minScore: 0,
      maxScore: 1,
      avgScore: avg.avg,
    };
  }

  public async updateCuratedSampleSomaticSnvById(
    {
      pecan,
      platform,
      researchCandidate,
      ...rest
    }: IUpdateCuratedSampleSomaticSNVsByIdBody,
    snvId: number,
    biosampleId: string,
  ): Promise<number> {
    let updates = 0;

    const platforms = platform !== 'No' ? platform : null;

    // update pecan first
    if (pecan !== undefined) {
      updates += await this.knex({ samp: this.sampleSomaticSnvTable })
        .join({ snv: 'zcc_curated_snv_anno' }, 'samp.variant_id', 'snv.variant_id')
        .where('biosample_id', biosampleId)
        .andWhere('internal_id', snvId)
        .update({
          pecan,
        });
    }

    // update remaining columns second
    if (
      platform !== undefined
      || Object.values(rest).some((a) => a !== undefined)
    ) {
      updates += await this.knex(this.sampleSomaticSnvTable)
        .where('biosample_id', biosampleId)
        .andWhere('internal_id', snvId)
        .update({
          platforms,
          research_candidate: researchCandidate,
          ...rest,
        });
    }

    return updates;
  }

  public getCountsByVariantId(
    variantId: string,
    user: IUserWithMetadata,
    inGermline = false,
  ): Promise<VariantCounts[]> {
    return this.knex
      .select({
        variantId: 'somaticSnv.variant_id',
        zero2Category: 'analysis.zero2_category',
        zero2Subcategory1: 'analysis.zero2_subcategory1',
        zero2Subcategory2: 'analysis.zero2_subcategory2',
        zero2FinalDiagnosis: 'analysis.zero2_final_diagnosis',
      })
      .countDistinct('biosample.biosample_id as count')
      .from({ somaticSnv: this.sampleSomaticSnvTable })
      .modify(withBiosample, 'innerJoin', user, 'somaticSnv.biosample_id')
      .modify(withAnalysisSetBiosampleXref, 'innerJoin', user, ['biosample.biosample_id', 'xref.biosample_id'])
      .modify(withAnalysisSet, 'innerJoin', user, 'xref.analysis_set_id')
      .where('variant_id', variantId)
      .andWhere(function applyInGermlineFilter() {
        if (inGermline === false) {
          this.where('somaticSnv.in_germline', false)
            .orWhereNull('somaticSnv.in_germline');
        } else if (inGermline === true) {
          this.where('somaticSnv.in_germline', true);
        }
      })
      .groupBy(
        'analysis.zero2_category',
        'analysis.zero2_subcategory1',
        'analysis.zero2_subcategory2',
        'analysis.zero2_final_diagnosis',
      );
  }

  public getSeenInByVariantId(
    variantId: string,
    user: IUserWithMetadata,
    query: SNVVariantSeenInBiosampleDTO,
  ): Promise<VariantSeenInBiosample[]> {
    return this.knex.distinct({
      variantId: 'somaticSnv.variant_id',
      analysisSetId: 'xref.analysis_set_id',
      patientId: 'analysis.patient_id',
      sequencedEvent: 'analysis.sequenced_event',
      biosampleId: 'xref.biosample_id',
      zero2Category: 'analysis.zero2_category',
      zero2Subcategory1: 'analysis.zero2_subcategory1',
      zero2Subcategory2: 'analysis.zero2_subcategory2',
      zero2FinalDiagnosis: 'analysis.zero2_final_diagnosis',
    })
      .from({ somaticSnv: this.sampleSomaticSnvTable })
      .modify(withBiosample, 'innerJoin', user, 'somaticSnv.biosample_id')
      .modify(withAnalysisSetBiosampleXref, 'innerJoin', user, ['biosample.biosample_id', 'xref.biosample_id'])
      .modify(withAnalysisSet, 'innerJoin', user, 'xref.analysis_set_id')
      .where('somaticSnv.variant_id', variantId)
      .andWhere(function applyInGermlineFilter() {
        if (query.inGermline === false) {
          this.where('somaticSnv.in_germline', false)
            .orWhereNull('somaticSnv.in_germline');
        } else if (query.inGermline === true) {
          this.where('somaticSnv.in_germline', true);
        }
      })
      .modify(withPagination, query.page, query.limit);
  }

  public async getReportableCountsByVariantId(
    variantId: string,
    user: IUserWithMetadata,
  ): Promise<ICounts> {
    return this.countsService.getCounts(
      this.sampleSomaticSnvTable,
      'variant_id',
      variantId,
      user,
    );
  }

  private baseQuery(
    biosampleId: string,
    user: IUserWithMetadata,
    consequence: string[] = [],
  ): Knex.QueryBuilder {
    const consequenceVariantQuery = this.getConsequenceFilter(biosampleId, consequence);
    return this.knex
      .select({
        internalId: 'somaticSnv.internal_id',
        biosampleId: 'somaticSnv.biosample_id',
        variantId: 'somaticSnv.variant_id',
        geneId: 'genes.gene_id',
        gene: 'genes.gene',
        chr: 'snv.chr',
        pos: 'snv.pos',
        snvRef: 'snv.ref',
        alt: 'snv.alt',
        hgvs: 'snv.hgvs',
        genotype: 'somaticSnv.genotype',
        consequence: 'snv.consequence',
        altad: 'somaticSnv.altad',
        depth: 'somaticSnv.depth',
        adjustedCopyNumber: 'somaticSnv.adjustedcopynumber',
        copyNumber: 'somaticSnv.copynumber',
        biallelic: 'somaticSnv.biallelic',
        loh: 'somaticSnv.loh',
        inGermline: 'somaticSnv.in_germline',
        subclonalLikelihood: 'somaticSnv.subclonalLikelihood',
        geneLists: 'genes.gene_lists',
        pathScore: 'somaticSnv.pathscore',
        platforms: 'somaticSnv.platforms',
        rnaTpm: 'somaticSnv.rna_tpm',
        rnaVafNo: 'somaticSnv.rna_vaf_no',
        rnaAltad: 'somaticSnv.rna_altad',
        rnaDepth: 'somaticSnv.rna_depth',
        rnaImpact: 'somaticSnv.rna_impact',
        panelVaf: 'somaticSnv.panel_vaf',
        adjustedVaf: 'somaticSnv.adjustedvaf',
        pecan: 'anno.pecan',
        hotspot: 'snv.hotspot',
        pathclass: 'somaticSnv.pathclass',
        zygosity: 'somaticSnv.zygosity',
        researchCandidate: 'somaticSnv.research_candidate',
        gnomadAFGenomePopmax: 'anno.gnomad_af_genome',
        gnomadAFExomePopmax: 'anno.gnomad_af_exome_popmax',
        mgrbAC: 'anno.mgrb_ac',
        mgrbAN: 'anno.mgrb_an',
        cosmicId: 'anno.cosmic_id',

        // reportable
        classification: 'somaticSnv.classification',
        reportable: 'somaticSnv.reportable',
        targetable: 'somaticSnv.targetable',

        // helium
        heliumScore: 'somaticSnv.helium_score',
        heliumBreakdown: 'somaticSnv.helium_comment',
      })
      .from<ISomaticSnv>({ somaticSnv: this.sampleSomaticSnvTable })
      .modify(withBiosample, 'innerJoin', user, 'somaticSnv.biosample_id')
      .innerJoin(
        { snv: 'zcc_curated_snv' },
        'somaticSnv.variant_id',
        'snv.variant_id',
      )
      .innerJoin(
        { anno: 'zcc_curated_snv_anno' },
        'somaticSnv.variant_id',
        'anno.variant_id',
      )
      .innerJoin({ genes: 'zcc_genes' }, 'snv.gene_id', 'genes.gene_id')
      .leftJoin(consequenceVariantQuery, 'snv.variant_id', 'consequenceVariant.variantId')
      .modify(withPrismGeneListImportance, 'genes.gene_lists')
      .modify(
        withVariantImportance,
        'genes.gene_lists',
        'somaticSnv.pathclass',
      )
      .modify(withChromosomeNumericValue, 'snv.chr');
  }

  private withFilters(
    qb: Knex.QueryBuilder,
    filters: ICuratedSampleSomaticSnvsQuery,
  ): void {
    qb
      .andWhere(function customFilters() {
        this.orWhere(function defaultFilters() {
          if (filters.defaultFilter) {
            this.orWhere(function classified() {
              this.modify(filterClassification, 'somaticSnv.classification', true);
            })
              .orWhere('somaticSnv.reportable', true)
              .orWhere(function pathclass() {
                this.whereIn('somaticSnv.pathclass', [
                  'C5: Pathogenic',
                  'C4: Likely Pathogenic',
                  'C3.8: VOUS',
                ]);
              });
          }
        })
          .orWhere(function frontendFilters() {
            this.where(function gnomadFilter() {
              if (filters.gnomad) {
                this.orWhereNull('anno.gnomad_af_genome')
                  .orWhere(function custom() {
                    this.where('anno.gnomad_af_genome', '>=', filters.gnomad[0])
                      .andWhere('anno.gnomad_af_genome', '<=', filters.gnomad[1]);
                  });
              }
            })
              .andWhere(function vafFilter() {
                if (filters.vaf && filters.vaf.length > 0) {
                  this.whereRaw('ROUND(somaticSnv.altad / somaticSnv.depth, 2) >= ?', filters.vaf[0])
                    .andWhereRaw('ROUND(somaticSnv.altad / somaticSnv.depth, 2) <= ?', filters.vaf[1]);
                }
              })
              .andWhere(function readsFilter() {
                if (filters.reads && filters.reads.length > 0) {
                  this.where('somaticSnv.altad', '>=', filters.reads[0]);
                  if (filters.reads[1] < Infinity) {
                    this.andWhere('somaticSnv.altad', '<=', filters.reads[1]);
                  }
                }
              })
              .andWhere(function isLoh() {
                if (filters.loh) {
                  this.whereNotNull('somaticSnv.LOH')
                    .andWhere('somaticSnv.LOH', '<>', 'No');
                }
              })
              .andWhere(function searchGenes() {
                if (filters.search && filters.search.length) {
                  this.where('genes.gene', 'like', `%${filters.search}%`);
                }
                if (filters.minPathscore) {
                  this.andWhere('somaticSnv.pathscore', '>=', filters.minPathscore);
                }
                if (filters.maxPathscore) {
                  this.andWhere('somaticSnv.pathscore', '<=', filters.maxPathscore);
                }
              })
              .andWhere(function chromosomeFilter() {
                if (filters.chromosome) {
                  filters.chromosome.forEach((c) => {
                    this.orWhere('genes.chromosome_hg38', `chr${c}`);
                  });
                }
              })
              .andWhere(function geneFilter() {
                if (filters.gene) {
                  filters.gene.forEach((g) => {
                    this.orWhere('genes.gene', g);
                  });
                }
              })
              .andWhere(function consequenceFilter() {
                if (filters.consequence && filters.consequence.length > 0) {
                  this.whereNotNull('consequenceVariant.groupedConsequence');
                }
              })
              .andWhere(function classpathFilter() {
                if (filters.classpath) {
                  filters.classpath.forEach((c) => {
                    this.orWhere('somaticSnv.pathclass', c);
                  });
                }
              })
              .andWhere(function biallelicFilter() {
                if (filters.biallelic) {
                  this.andWhere('somaticSnv.biallelic', filters.biallelic);
                }
              })
              .andWhere(function platformFilter() {
                if (filters.platform) {
                  filters.platform.forEach((c) => {
                    this.orWhere('somaticSnv.platforms', c);
                  });
                }
              })
              .andWhere(function failedFilter() {
                this.orWhere('somaticSnv.vcf_filter_pass', true);
                this.orWhere('somaticSnv.vcf_filter_pass', null);
                if (filters.vcf) {
                  this.orWhere('somaticSnv.vcf_filter_pass', false);
                }
              })
              .andWhere(function notNullHGVS() {
                this.whereNotNull('snv.hgvs');
              })
              .andWhere(function isReportable() {
                if (filters.reportable !== undefined) {
                  this.andWhere('somaticSnv.reportable', filters.reportable);
                }
              })
              .andWhere(function isTargetable() {
                if (filters.targetable !== undefined) {
                  this.andWhere('somaticSnv.targetable', filters.targetable);
                }
              })
              .modify(filterClassification, 'somaticSnv.classification', filters.isClassified);
          });
      });
  }

  private getConsequenceFilter(
    biosampleId: string,
    consequence?: string[],
  ): Knex.QueryBuilder {
    return this.knex
      .select({
        variantId: 'a.variant_id',
        groupedConsequence: this.knex.raw('group_concat(consequence separator "&")'),
      })
      .from({ a: 'zcc_consequence_variant' })
      .leftJoin({ b: 'zcc_curated_sample_somatic_snv' }, 'a.variant_id', 'b.variant_id')
      .where('b.biosample_id', biosampleId)
      .andWhere(function customBuilder() {
        if (consequence && consequence.length > 0) {
          this.whereIn('a.variant_id', function variantIdFilter() {
            this.select('variant_id')
              .from('zcc_consequence_variant')
              .whereIn('consequence', consequence);
          });
        }
      })
      .groupBy('a.variant_id')
      .as('consequenceVariant');
  }

  public clearSnvsPathclass(
    biosampleId: string,
  ): Promise<number> {
    return this.knex(this.sampleSomaticSnvTable)
      .update({ pathclass: null })
      .whereNotNull('pathclass')
      .where('biosample_id', biosampleId);
  }
}
