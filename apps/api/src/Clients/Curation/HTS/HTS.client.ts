import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { v4 as uuid } from 'uuid';

import { KNEX_CONNECTION } from 'Modules/Knex/constants';

import {
  HTSResultSummary,
  IHTSCulture,
  IHTSDrugCombination,
  IHTSResult,
} from 'Models/Curation/HTS/HTS.model';

import { ICreateHTSCombination } from 'Models/Curation/HTS/Requests/CreateHTSCombination.model';
import { HTSSortColumns, IGetHTSCombinationsQuery, IGetHTSResultQuery } from 'Models/Curation/HTS/Requests/PaginatedHtsResults';
import { IUpdateHTSCombination } from 'Models/Curation/HTS/Requests/UpdateHTSCombination.model';
import { IUpdateHTSCultureBody } from 'Models/Curation/HTS/Requests/UpdateHTSCultureBody.model';
import {
  UpdateHTSResultByIdBodyDTO,
} from 'Models/Curation/HTS/Requests/UpdateHTSResultByIdBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';
import { withPagination } from 'Utilities/query/misc.util';
import { htsHitOrder, htsReportableHitOrder, htsZScoreNullOrder } from 'Utilities/transformers/SortMapping.util';

@Injectable()
export class HTSClient {
  private htsCultureTable = 'zcc_hts_culture';

  private htsDrugStats = 'zcc_hts_drugstats';

  private htsDrugCombinationTable = 'zcc_hts_drug_combinations';

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  public async getHTSCulture(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IHTSCulture[]> {
    return this.knex
      .select({
        biosampleId: 'hts.biosample_id',
        biomaterial: 'hts.biomaterial',
        screenName: 'hts.screen_name',
        htsEvent: 'hts.hts_event',
        htsSeedDate: 'hts.hts_seed_date',
        htsScreenDate: 'hts.hts_screen_date',
        htsEndpointDate: 'hts.hts_endpoint_date',
        htsDurationDays: 'hts.hts_duration_days',
        htsNumDrugs: 'hts.hts_num_drugs',
        htsNumConcs: 'hts.hts_num_concs',
        htsScreenFormat: 'hts.hts_screen_format',
        htsPassage: 'hts.hts_passage',
        htsNumCells: 'hts.hts_num_cells',
        htsViabilityPct: 'hts.hts_viability_pct',
        htsCondCulture: 'hts.hts_cond_culture',
        htsScreenPlatform: 'hts.hts_screen_platform',
        htsRocki: 'hts.hts_rocki',
        htsCondIncubation: 'hts.hts_cond_incubation',
        htsCultureValidMethod: 'hts.hts_culture_validation',
        htsValidMethod: 'hts.hts_valid_method',
        htsValidResult: 'hts.hts_valid_result',
        qcPcCnt: 'hts.qc_pc_cnt',
        qcNcCnt: 'hts.qc_nc_cnt',
        qcL1Cnt: 'hts.qc_l1_cnt',
        qcL1R: 'hts.qc_l1_r',
        qcL2Cnt: 'hts.qc_l2_cnt',
        qcL2R: 'hts.qc_l2_r',
        qcL3Cnt: 'hts.qc_l3_cnt',
        qcL3R: 'hts.qc_l3_r',
        qcL4Cnt: 'hts.qc_l4_cnt',
        qcL4R: 'hts.qc_l4_r',
        qcStatus: 'hts.qc_status',
        screenStatus: 'hts.screen_status',
        qcComment: 'hts.qc_comment',
        version: 'hts.version',
        comments: 'hts.comments',
        wholeCohortCount: 'hts.whole_cohort_count',
        subcohort: 'hts.subcohort',
        subcohortCount: 'hts.subcohort_count',
        controlChangeRatio: 'hts.control_change_ratio',
        createdAt: 'hts.created_at',
        updatedAt: 'hts.updated_at',
        createdBy: 'hts.created_by',
        updatedBy: 'hts.updated_by',
      })
      .from<IHTSCulture>({ hts: this.htsCultureTable })
      .modify(withBiosample, 'innerJoin', user, 'hts.biosample_id')
      .where('hts.biosample_id', biosampleId);
  }

  public async getHTSResult(
    biosampleId: string,
    filters: IGetHTSResultQuery,
    user: IUserWithMetadata,
    page = 1,
    limit = 10,
  ): Promise<IHTSResult[]> {
    const sortMap: Record<HTSSortColumns, string> = {

      'Z-Score': 'drugStats.zscore_auc',
      IC50: 'drugStats.ic50_patient',
    };

    return this.getHTSResultsBase(user)
      .modify(this.withHTSResultsFilters, filters)
      .andWhere('drugStats.biosample_id', biosampleId)
      .orderBy(
        filters.sortColumns && filters.sortDirections
          ? filters.sortColumns.map((c, i) => ({
            column: sortMap[c],
            order: filters.sortDirections[i] ?? 'asc',
          }))
          : [],
      )
      .orderByRaw(htsHitOrder('drugStats'))
      .orderByRaw(htsReportableHitOrder('drugStats'))
      .orderByRaw(htsZScoreNullOrder('drugStats'))
      .orderBy('drugStats.zscore_auc', 'asc')
      .orderBy('drugStats.zscore_ic50_log2', 'asc')
      .modify(withPagination, page, limit);
  }

  public async getHTSResultCount(
    biosampleId: string,
    filters: IGetHTSResultQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    const count = await this.getHTSResultsBase(user)
      .clearSelect()
      .count({ count: '*' })
      .where('drugStats.biosample_id', biosampleId)
      .modify(this.withHTSResultsFilters, filters)
      .first();

    return count ? count.count : 0;
  }

  public async getHTSResultById(
    biosampleId: string,
    screenId: string,
    user: IUserWithMetadata,
  ): Promise<IHTSResult> {
    return this.getHTSResultsBase(user)
      .andWhere('drugStats.screen_id', screenId)
      .andWhere('drugStats.biosample_id', biosampleId)
      .first();
  }

  public async getZScoreSummary(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<HTSResultSummary> {
    const minAucZScore = await this.knex
      .from({ hts: this.htsDrugStats })
      .modify(withBiosample, 'innerJoin', user, 'hts.biosample_id')
      .where('hts.biosample_id', biosampleId)
      .min({ min: 'zscore_auc' })
      .first();
    const maxAucZScore = await this.knex
      .from({ hts: this.htsDrugStats })
      .modify(withBiosample, 'innerJoin', user, 'hts.biosample_id')
      .where('hts.biosample_id', biosampleId)
      .max({ max: 'zscore_auc' })
      .first();

    const minIc50ZScore = await this.knex
      .from({ hts: this.htsDrugStats })
      .modify(withBiosample, 'innerJoin', user, 'hts.biosample_id')
      .where('hts.biosample_id', biosampleId)
      .min({ min: 'zscore_ic50_log2' })
      .first();
    const maxIc50ZScore = await this.knex
      .from({ hts: this.htsDrugStats })
      .modify(withBiosample, 'innerJoin', user, 'hts.biosample_id')
      .where('hts.biosample_id', biosampleId)
      .max({ max: 'zscore_ic50_log2' })
      .first();

    const minLc50ZScore = await this.knex
      .from({ hts: this.htsDrugStats })
      .modify(withBiosample, 'innerJoin', user, 'hts.biosample_id')
      .where('hts.biosample_id', biosampleId)
      .min({ min: 'zscore_lc50_log2' })
      .first();
    const maxLc50ZScore = await this.knex
      .from({ hts: this.htsDrugStats })
      .modify(withBiosample, 'innerJoin', user, 'hts.biosample_id')
      .where('hts.biosample_id', biosampleId)
      .max({ max: 'zscore_lc50_log2' })
      .first();

    return {
      aucZScore: {
        min: Math.min(-2, minAucZScore.min),
        max: Math.max(-2, maxAucZScore.max),
        mid: -2,
      },
      ic50ZScore: {
        min: Math.min(-2, minIc50ZScore.min),
        max: Math.max(-2, maxIc50ZScore.max),
        mid: -2,
      },
      lc50ZScore: {
        min: Math.min(-2, minLc50ZScore.min),
        max: Math.max(-2, maxLc50ZScore.max),
        mid: -2,
      },
    };
  }

  public async updateHtsResultById(
    {
      hit, reportable, reportingRationale, correlation, reportTargets,
    }: UpdateHTSResultByIdBodyDTO,
    screenId: string,
    biosampleId: string,
  ): Promise<number> {
    return this.knex(this.htsDrugStats)
      .where('biosample_id', biosampleId)
      .andWhere('screen_id', screenId)
      .update({
        report_targets: reportTargets,
        hit,
        reportable,
        reporting_rationale: reportingRationale,
        correlation,
      });
  }

  private getHTSResultsBase(
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    return this.knex
      .select({
        screenId: 'drugStats.screen_id',
        biosampleId: 'drugStats.biosample_id',
        screened: 'drugStats.screened',
        reportTargets: 'drugStats.report_targets',
        aucPatient: 'drugStats.auc_patient',
        aucZScore: 'drugStats.zscore_auc',
        aucMedian: 'drugStats.auc_median',
        aucZScoreSubcohort: 'drugStats.zscore_auc_subcohort',
        aucMedianSubcohort: 'drugStats.auc_median_subcohort',
        ic50Patient: 'drugStats.ic50_patient',
        ic50Log2ZScore: 'drugStats.zscore_ic50_log2',
        ic50Log2Median: 'drugStats.ic50_log2_median',
        ic50Log2: 'drugStats.ic50_log2',
        ic50Log2ZScoreSubcohort: 'drugStats.zscore_ic50_log2_subcohort',
        ic50Log2MedianSubcohort: 'drugStats.ic50_log2_median_subcohort',
        ln50Patient: 'drugStats.ln50_patient',
        ln50Median: 'drugStats.ln50_median',
        lc50: 'drugStats.lc50',
        lc50Log2ZScore: 'drugStats.zscore_lc50_log2',
        lc50Log2Median: 'drugStats.lc50_log2_median',
        lc50Log2ZScoreSubcohort: 'drugStats.zscore_lc50_log2_subcohort',
        lc50Log2MedianSubcohort: 'drugStats.lc50_log2_median_subcohort',
        lc50Log2: 'drugStats.lc50_log2',
        cmax: 'drugStats.cmax',
        effectCmax: 'drugStats.effect_cmax',
        css: 'drugStats.css',
        effectCss: 'drugStats.effect_css',
        crew: 'drugStats.crew',
        maximumEffectMtc: 'drugStats.maximum_effect_mtc',
        changeRatio: 'drugStats.change_ratio',
        candidateHit: 'drugStats.candidate_hit',
        hit: 'drugStats.hit',
        reportable: 'drugStats.reportable',
        reportingRationale: 'drugStats.reporting_rationale',
        correlation: 'drugStats.correlation',
      })
      .from<IHTSResult>({ drugStats: this.htsDrugStats })
      .modify(withBiosample, 'innerJoin', user, 'drugStats.biosample_id');
  }

  private withHTSResultsFilters(
    qb: Knex.QueryBuilder,
    filters: IGetHTSResultQuery,
  ): void {
    qb
      .where(function inputFilters() {
        if (filters.screenIds && filters.screenIds.length > 0) {
          this.whereIn('drugStats.screen_id', filters.screenIds);
        }
        if (filters.hit) {
          this.where('drugStats.reporting_rationale', 'HIT');
        }
        if (filters.hit === false) {
          this.whereNot('drugStats.reporting_rationale', 'HIT')
            .whereNotNull('drugStats.reporting_rationale');
        }
        if (filters.reportable !== undefined) {
          this.where('drugStats.reportable', filters.reportable);
        }
      });
  }

  public async getDrugCombinations(
    biosampleId: string,
    query: IGetHTSCombinationsQuery,
    user: IUserWithMetadata,
  ): Promise<IHTSDrugCombination[]> {
    return this.selectDrugCombinationsBase(user)
      .where('combination.biosample_id', biosampleId)
      .where(function filters() {
        if (query.screenIds?.length) {
          this.whereIn('combination.screen_id_1', query.screenIds)
            .orWhereIn('combination.screen_id_2', query.screenIds);
        }
        if (query.hit) {
          this.where('combination.reporting_rationale', 'HIT');
        }
        if (query.hit === false) {
          this.whereNot('combination.reporting_rationale', 'HIT')
            .whereNotNull('combination.reporting_rationale');
        }
        if (query.reportable !== undefined) {
          this.where('combination.reportable', query.reportable);
        }
      });
  }

  public async getDrugCombinationsById(
    biosampleId: string,
    combinationId: string,
    user: IUserWithMetadata,
  ): Promise<IHTSDrugCombination[]> {
    return this.selectDrugCombinationsBase(user)
      .where('combination.biosample_id', biosampleId)
      .where('combination.id', combinationId);
  }

  public async updateHTSCulture(
    biosampleId: string,
    screenName: string,
    body: IUpdateHTSCultureBody,
  ): Promise<void> {
    await this.knex.update({
      screen_status: body.screenStatus,
    })
      .from(this.htsCultureTable)
      .where('biosample_id', biosampleId)
      .where('screen_name', screenName);
  }

  public async createDrugCombination(
    biosampleId: string,
    body: ICreateHTSCombination,
  ): Promise<string> {
    const id = uuid();

    await this.knex
      .insert({
        id,
        biosample_id: biosampleId,
        screen_id_1: body.screenId1,
        screen_id_2: body.screenId2,
        combination_effect: body.combinationEffect,
        effect_cmax_screen_1: body.effectCmaxScreen1,
        effect_css_screen_1: body.effectCmaxScreen2,
        effect_cmax_screen_2: body.effectCssScreen1,
        effect_css_screen_2: body.effectCssScreen2,
        combination_effect_cmax: body.effectCmaxCombo,
        combination_effect_css: body.effectCssCombo,
      })
      .into(this.htsDrugCombinationTable);

    return id;
  }

  public async updateDrugCombination(
    id: string,
    body: IUpdateHTSCombination,
  ): Promise<void> {
    await this.knex
      .update({
        screen_id_1: body.screenId1,
        screen_id_2: body.screenId2,
        combination_effect: body.combinationEffect,
        effect_cmax_screen_1: body.effectCmaxScreen1,
        effect_css_screen_1: body.effectCmaxScreen2,
        effect_cmax_screen_2: body.effectCssScreen1,
        effect_css_screen_2: body.effectCssScreen2,
        combination_effect_cmax: body.effectCmaxCombo,
        combination_effect_css: body.effectCssCombo,
        reportable: body.reportable,
        reporting_rationale: body.reportingRationale,
        correlation: body.correlation,
      })
      .from(this.htsDrugCombinationTable)
      .where('id', id);
  }

  private selectDrugCombinationsBase(
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    return this.knex
      .select({
        id: 'combination.id',
        biosampleId: 'combination.biosample_id',
        screenId1: 'combination.screen_id_1',
        screenId2: 'combination.screen_id_2',
        combinationEffect: 'combination.combination_effect',
        effectCmaxScreen1: 'combination.effect_cmax_screen_1',
        effectCmaxScreen2: 'combination.effect_css_screen_1',
        effectCssScreen1: 'combination.effect_cmax_screen_2',
        effectCssScreen2: 'combination.effect_css_screen_2',
        effectCmaxCombo: 'combination.combination_effect_cmax',
        effectCssCombo: 'combination.combination_effect_css',
        reportable: 'combination.reportable',
        reportingRationale: 'combination.reporting_rationale',
        correlation: 'combination.correlation',
      })
      .from({ combination: this.htsDrugCombinationTable })
      .modify(withBiosample, 'innerJoin', user, 'combination.biosample_id');
  }
}
