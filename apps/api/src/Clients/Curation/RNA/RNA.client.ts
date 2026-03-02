import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IGetReportableVariant } from 'Models/Common/Requests/GetReportableVariant.model';
import {
  ICuratedSampleSomaticRnaQuery,
  IGetRNAByIdQuery,
} from 'Models/Curation/RNA/Requests/RnaSampleQuery.model';
import { IUpdateRnaSeqSample } from 'Models/Curation/RNA/Requests/UpdateRnaSeqBody.model';
import {
  IRnaClassifierVersion,
  RnaClassifierVersionFiltersDTO,
  UpdateRnaClassifierBodyDTO,
} from 'Models/Curation/RNA/RnaClassifier.model';
import {
  IPromoteClassifierBody,
  IRNASeqClassifierData,
  IRNASeqGeneTPMData,
  IRNATSNEData,
  ISomaticRna,
  IUpdateRNAClassifier,
} from 'Models/Curation/RNA/RnaSample.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { filterClassification } from 'Utilities/query/classification.util';
import { withPrismGeneListImportance } from 'Utilities/query/Importance.util';

import { Summary } from 'Models/Curation/Misc.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { withAnalysisSet } from 'Utilities/query/accessControl/withAnalysisSet.util';
import { withAnalysisSetBiosampleXref } from 'Utilities/query/accessControl/withAnalysisSetBiosampleXref.util';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';
import {
  classificationCustomOrder,
  toOrderBySQLQuery,
  toRNAColumn,
} from 'Utilities/transformers/SortMapping.util';

@Injectable()
export class SeqRnaClient {
  private sampleSomanticRnaTable = 'zcc_curated_sample_somatic_rnaseq';

  private sampleClassifierRNATable = 'zcc_curated_sample_somatic_rnaseq_classification';

  private classificationPredictionsTable = 'zcc_rna_classification_predictions';

  private rnaClassifierTable = 'zcc_rna_classifier';

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  public getRnaSeqSamples(
    biosampleId: string,
    filters: ICuratedSampleSomaticRnaQuery,
    user: IUserWithMetadata,
    page?: number,
    limit?: number,
  ): Promise<ISomaticRna[]> {
    let orderByRaw = `
      ${classificationCustomOrder('reportable', 'classification')} desc,
      geneListImportance asc,
      gene asc
    `;
    if (filters.sortColumns) {
      const tableAliases = {
        somaticRNATblAlias: 'rna',
        geneTblAlias: 'gene',
      };
      orderByRaw = toOrderBySQLQuery(
        toRNAColumn,
        tableAliases,
        filters.sortColumns,
        filters.sortDirections,
      );
    }

    const query = this.baseQuery(user)
      .where('rna.biosample_id', biosampleId)
      .andWhere(function isOutlierOrRelapse() {
        this.where('rna.outlier', 1)
          .orWhereNotNull('relapse.biosample_id');
      })
      .modify(this.withFilters, filters)
      .orderByRaw(orderByRaw);

    if (page !== undefined && limit !== undefined) {
      return query
        .limit(limit)
        .offset(page < 1 ? 0 : (page - 1) * limit);
    }

    return query;
  }

  public async getRnaSeqSamplesCount(
    biosampleId: string,
    filters: ICuratedSampleSomaticRnaQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    const data = await this.baseQuery(user)
      .clearSelect()
      .count('* as count')
      .where('rna.biosample_id', biosampleId)
      .andWhere(function isOutlierOrRelapse() {
        this.where('rna.outlier', 1)
          .orWhereNotNull('relapse.fold_change');
      })
      .modify(this.withFilters, filters)
      .first();
    return data.count;
  }

  public async getSeqSampleRNAClassifier(
    biosampleId: string,
    {
      ...filters
    }: IGetReportableVariant,
    user: IUserWithMetadata,
  ): Promise<IRNASeqClassifierData[]> {
    const resp = this.knex
      .select({
        biosampleId: 'classifier.biosample_id',
        classifier: 'classifier.classifier',
        version: 'classifier.version',
        prediction: 'classifier.prediction',
        predictionLabel: 'prediction.prediction_label',
        score: 'classifier.score',
        selectedPrediction: 'classifier.selected_prediction',
        researchCandidate: 'classifier.research_candidate',
        // reportables
        classification: 'classifier.classification',
        reportable: 'classifier.reportable',
        targetable: 'classifier.targetable',
      })
      .from({ classifier: this.sampleClassifierRNATable })
      .modify(withBiosample, 'innerJoin', user, 'classifier.biosample_id')
      .innerJoin(
        { prediction: this.classificationPredictionsTable },
        'classifier.prediction',
        'prediction.prediction',
      )
      .where('classifier.biosample_id', biosampleId)
      .where(function isReportable() {
        if (filters.reportable !== undefined) {
          this.where('classifier.reportable', filters.reportable);
        }
      })
      .andWhere(function isTargetable() {
        if (filters.targetable !== undefined) {
          this.andWhere('classifier.targetable', filters.targetable);
        }
      })
      .modify(filterClassification, 'classifier.classification', filters.isClassified);

    return resp;
  }

  public async getRNASeqGeneTPM(
    geneId: number,
    user: IUserWithMetadata,
  ): Promise<IRNASeqGeneTPMData[]> {
    const relevantBiosampleIds = this.knex
      .distinct('biosample.biosample_id')
      .from({ rna: this.sampleSomanticRnaTable })
      .modify(withBiosample, 'innerJoin', user, 'rna.biosample_id');

    const resp = this.knex
      .select({
        biosampleId: 'biosample.biosample_id',
        patientId: 'biosample.patient_id',
        publicSubjectId: this.knex.raw("CONCAT('zccs', biosample.public_subject_id)"),
        category: 'analysis.zero2_category',
        subcat2: this.knex.raw("COALESCE(analysis.zero2_subcategory2, 'Other')"),
        finalDiagnosis: this.knex.raw("COALESCE(analysis.zero2_final_diagnosis, 'Unknown')"),
        event: 'analysis.sequenced_event',
        zscore: 'e.zscore_mean',
        geneId: 'e.gene_id',
        tpm: 'e.tpm',
      })
      .modify(withBiosample, 'from', user)
      .modify(withAnalysisSetBiosampleXref, 'innerJoin', user, ['biosample.biosample_id', 'xref.biosample_id'])
      .modify(withAnalysisSet, 'innerJoin', user, 'xref.analysis_set_id')
      .leftJoin({ e: this.sampleSomanticRnaTable }, 'e.biosample_id', 'biosample.biosample_id')
      .where('biosample.sample_type', 'rnaseq')
      .andWhere('biosample.biosample_status', 'tumour')
      .andWhere('biosample.biosample_id', 'like', '%-T-R')
      .andWhere('e.gene_id', geneId)
      .whereIn('biosample.biosample_id', relevantBiosampleIds);

    return resp;
  }

  public getRnaClassifiers(
    query: RnaClassifierVersionFiltersDTO,
  ): Promise<IRnaClassifierVersion[]> {
    const resp = this.knex
      .select({
        id: 'a.rna_classifier_id',
        name: 'a.name',
        // doing this so that the model is compatible with
        // the methylation classifiers
        description: 'a.name',
        version: 'a.version',
        note: 'a.note',
        showInAtlas: 'a.show_in_atlas',
        type: this.knex.raw('"RNA_CLASSIFIER"'),
      })
      .from<IRnaClassifierVersion[]>({
        a: this.rnaClassifierTable,
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

  public updateRnaClassifier(
    classifierId: string,
    { note }: UpdateRnaClassifierBodyDTO,
  ): Promise<number> {
    return this.knex.update({
      note,
    })
      .from(this.rnaClassifierTable)
      .where('rna_classifier_id', classifierId);
  }

  public async updateSelectedPrediction(
    biosampleId: string,
    {
      classifier,
      version,
      prediction,
      selectedPrediction,
    }: IPromoteClassifierBody,
  ): Promise<void> {
    await this.knex
      .update({
        selected_prediction: selectedPrediction,
      })
      .from({ a: this.sampleClassifierRNATable })
      .where({

        'a.biosample_id': biosampleId,

        'a.classifier': classifier,

        'a.version': version,

        'a.prediction': prediction,
      });
  }

  public async getRNASummary(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<Summary> {
    const query = this.knex
      .from({ a: this.sampleSomanticRnaTable })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .where('a.biosample_id', biosampleId)
      .andWhere('a.outlier', 1);

    const min = await query.clone().min('a.zscore_mean as min').first();
    const max = await query.clone().max('a.zscore_mean as max').first();
    const mid = await query.clone().avg('a.zscore_mean as mid').first();

    return {
      min: min.min,
      mid: mid.mid,
      max: max.max,
    };
  }

  public async updateRNAClassifier(
    biosampleId: string,
    classifier: string,
    version: string,
    prediction: string,
    { researchCandidate, ...rest }: IUpdateRNAClassifier,
    user: IUserWithMetadata,
  ): Promise<void> {
    const analysisSetId = this.knex
      .select('xref.analysis_set_id')
      .modify(withAnalysisSetBiosampleXref, 'from', user)
      .where('xref.biosample_id', biosampleId)
      .first();

    const rnaseqId = this.knex
      .select('xref.biosample_id')
      .modify(withAnalysisSetBiosampleXref, 'from', user)
      .modify(withBiosample, 'innerJoin', user, 'xref.biosample_id')
      .where({
        'biosample.sample_type': 'rnaseq',
        'xref.analysis_set_id': analysisSetId,
      })
      .first();

    const query = this.knex
      .update({
        research_candidate: researchCandidate,
        ...rest,
      })
      .from({ a: this.sampleClassifierRNATable })
      .where({

        'a.biosample_id': rnaseqId,

        'a.classifier': classifier,

        'a.version': version,

        'a.prediction': prediction,
      });

    await this.knex.transaction(async (trx) => {
      await query.transacting(trx);
    });
  }

  public getRNAByGeneId(
    geneId: number,
    biosampleId: string,
    query: IGetRNAByIdQuery,
    user: IUserWithMetadata,
  ): Promise<ISomaticRna> {
    return this.baseQuery(user)
      .where('rna.biosample_id', biosampleId)
      .andWhere(function outlierQuery() {
        if (query.outlier !== undefined) {
          this.andWhere('rna.outlier', query.outlier);
        }
      })
      .andWhere('rna.gene_id', geneId)
      .first<ISomaticRna>();
  }

  public async updateRNAById(
    {
      geneExpression,
      targetable,
      researchCandidate,
      ...rest
    }: IUpdateRnaSeqSample,
    geneId: number,
    biosampleId: string,
  ): Promise<number> {
    return this.knex({ a: this.sampleSomanticRnaTable })
      .andWhere('a.gene_id', geneId)
      .andWhere('a.biosample_id', biosampleId)
      .update({

        'a.gene_expression': geneExpression,

        'a.targetable': targetable,

        'a.research_candidate': researchCandidate,
        ...rest,
      });
  }

  private baseQuery(
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    return this.knex
      .select({
        biosampleId: 'rna.biosample_id',
        gene: 'gene.gene',
        geneId: 'rna.gene_id',
        geneExpression: 'rna.gene_expression',
        patientFPKM: 'rna.fpkm',
        medianFPKM: 'rna.fpkm_median',
        patientTPM: 'rna.tpm',
        medianTPM: 'rna.tpm_median',
        chromosome: 'gene.chromosome_hg38',
        cytoband: 'gene.chromosomeBand_hg38',
        foldChange: 'rna.fc',
        meanZScore: 'rna.zscore_mean',
        geneLists: 'gene.gene_lists',
        relapseFoldChange: 'relapse.fold_change',
        relapseQValue: 'relapse.q_value',
        pairedSample: 'relapse.biosample_id',
        researchCandidate: 'rna.research_candidate',

        // reportables
        classification: 'rna.classification',
        reportable: 'rna.reportable',
        targetable: 'rna.targetable',

        // counts
        reportedCount: 'counts.reported_count',
        targetableCount: 'counts.targetable_count',
      })
      .modify(withPrismGeneListImportance, 'gene.gene_lists')
      .from<ISomaticRna>({ rna: this.sampleSomanticRnaTable })
      .modify(withBiosample, 'innerJoin', user, 'rna.biosample_id')
      .leftJoin(
        { relapse: 'zcc_rna_relapse_comparison' },
        function joinRelapseTable() {
          this.on('rna.gene_id', '=', 'relapse.gene_id')
            .andOn('rna.biosample_id', '=', 'relapse.relapse_biosample_id');
        },
      )
      .innerJoin({ gene: 'zcc_genes' }, 'rna.gene_id', 'gene.gene_id')
      .leftJoin({ counts: 'zcc_curated_somatic_rnaseq_counts' }, 'rna.gene_id', 'counts.gene_id');
  }

  private withFilters(qb: Knex.QueryBuilder, filters: ICuratedSampleSomaticRnaQuery): void {
    qb.andWhere(function filterFunctions() {
      this.orWhere(function defaultFilters() {
        if (filters.defaultFilter) {
          this.where(function classified() {
            this.modify(filterClassification, 'rna.classification', true);
          })
            .orWhere('rna.reportable', true);
        }
      }).orWhere(function customFilters() {
        this.where(function geneQuery() {
          if (filters.gene) {
            filters.gene.forEach((g) => {
              this.orWhere('gene.gene', g);
            });
          }
        })
          .andWhere(function expressionQuery() {
            if (filters.geneExpression && filters.geneExpression.includes('Unknown')) {
              this.orWhereNull('rna.gene_expression');
            }
            if (filters.geneExpression && filters.geneExpression.length > 0) {
              this.orWhereIn('rna.gene_expression', filters.geneExpression);
            }
          })
          .andWhere(function chromosomeQuery() {
            if (filters.chromosome) {
              filters.chromosome.forEach((c) => {
                this.orWhere('gene.chromosome_hg38', `chr${c}`);
              });
            }
          })
          .andWhere(function searchQuery() {
            if (filters.search) {
              this.andWhere('gene.gene', 'like', `%${filters.search}%`);
            }
          })
          .andWhere(function foldChangeQuery() {
            if (filters.foldChange && filters.foldChange.length > 1) {
              if (filters.foldChange[0] > -Infinity) {
                this.andWhere('rna.fc', '>=', filters.foldChange[0]);
              }
              if (filters.foldChange[1] < Infinity) {
                this.andWhere('rna.fc', '<=', filters.foldChange[1]);
              }
            }
          })
          .andWhere(function zScoreQuery() {
            if (filters.zScore && filters.zScore.length > 1) {
              if (filters.zScore[0] > -Infinity) {
                this.andWhere('rna.zscore_mean', '>=', filters.zScore[0]);
              }
              if (filters.zScore[1] < Infinity) {
                this.andWhere('rna.zscore_mean', '<=', filters.zScore[1]);
              }
            }
          })
          .andWhere(function tpmQuery() {
            if (filters.tpm && filters.tpm.length > 1) {
              if (filters.tpm[0] > -Infinity) {
                this.andWhere('rna.tpm', '>=', filters.tpm[0]);
              }
              if (filters.tpm[1] < Infinity) {
                this.andWhere('rna.tpm', '<=', filters.tpm[1]);
              }
            }
          })
          .andWhere(function fpkmQuery() {
            if (filters.fpkm && filters.fpkm.length > 1) {
              if (filters.fpkm[0] > -Infinity) {
                this.andWhere('rna.fpkm', '>=', filters.fpkm[0]);
              }
              if (filters.fpkm[1] < Infinity) {
                this.andWhere('rna.fpkm', '<=', filters.fpkm[1]);
              }
            }
          })
          .andWhere(function isReportable() {
            if (filters.reportable !== undefined) {
              this.andWhere('rna.reportable', filters.reportable);
            }
          })
          .andWhere(function isTargetable() {
            if (filters.targetable !== undefined) {
              this.andWhere('rna.targetable', filters.targetable);
            }
          })
          .modify(filterClassification, 'rna.classification', filters.isClassified);
      });
    });
  }

  public async getRNATSNEData(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IRNATSNEData[]> {
    const relevantBiosampleIds = this.knex
      .distinct('biosample_id')
      .from(this.sampleSomanticRnaTable);

    return this.knex
      .select({
        biosampleId: 'biosample.biosample_id',
        x: 'e.x',
        y: 'e.y',
        zero2Subcategory2: this.knex.raw("COALESCE(analysis.zero2_subcategory2, 'Other')"),
        zero2FinalDiagnosis: 'analysis.zero2_final_diagnosis',
      })
      .distinct()
      .modify(withBiosample, 'from', user)
      .modify(withAnalysisSetBiosampleXref, 'innerJoin', user, ['xref.biosample_id', 'biosample.biosample_id'])
      .modify(withAnalysisSet, 'innerJoin', user, 'xref.analysis_set_id')
      .leftJoin({ e: 'zcc_rna_tsne' }, 'e.biosample_id', 'biosample.biosample_id')
      .where('biosample.sample_type', 'rnaseq')
      .andWhere('biosample.biosample_status', 'tumour')
      .whereIn('biosample.biosample_id', relevantBiosampleIds)
      .andWhere(function getTumourRNASeqs() {
        this.where('biosample.biosample_id', 'like', '%-T-R')
          .orWhere('biosample.biosample_id', biosampleId);
      });
  }
}
