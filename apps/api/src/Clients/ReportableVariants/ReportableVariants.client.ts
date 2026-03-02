import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IUpdateReportableVariantBody } from 'Models/Curation/ReportableVariants/ReportableVariantsBody';
import { IGetReportableVariantData, IGetReportableVariantQuery } from 'Models/Curation/ReportableVariants/ReportableVariantsQuery';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withAnalysisSet } from 'Utilities/query/accessControl/withAnalysisSet.util';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';

@Injectable()
export class ReportableVariantsClient {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  private repVariantsTable = 'zcc_curated_reportable_variants';

  public async getReportableVariants(
    analysisSetId: string,
    query: IGetReportableVariantQuery,
    user: IUserWithMetadata,
  ): Promise<IGetReportableVariantData[]> {
    return this.selectReportableVariantsBase(user)
      .modify(this.withRepVariantsFilters, analysisSetId, query);
  }

  public async updateReportableVariant(
    analysisSetId: string,
    biosampleId: string,
    body: IUpdateReportableVariantBody,
  ): Promise<void> {
    const {
      variantType, variantId, reports,
    } = body;

    await this.knex(this.repVariantsTable)
      .where({
        analysis_set_id: analysisSetId,
        biosample_id: biosampleId,
        variant_type: variantType,
        variant_id: variantId,
      })
      .whereNotIn('report_type', reports)
      .del();

    if (reports.length) {
      await this.knex.insert(reports.map((report) => ({
        analysis_set_id: analysisSetId,
        biosample_id: biosampleId,
        variant_type: variantType,
        variant_id: variantId,
        report_type: report,
      })))
        .into(this.repVariantsTable)
        .onConflict(['analysis_set_id', 'biosample_id', 'variant_type', 'variant_id', 'report_type'])
        .ignore();
    }
  }

  private selectReportableVariantsBase(
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    return this.knex
      .select({
        analysisSetId: 'variants.analysis_set_id',
        biosampleId: 'variants.biosample_id',
        variantType: 'variants.variant_type',
        variantId: 'variants.variant_id',
        reportType: 'variants.report_type',
        order: 'variants.order',
      })
      .from({ variants: this.repVariantsTable })
      .modify(withAnalysisSet, 'innerJoin', user, 'variants.analysis_set_id')
      .modify(withBiosample, 'innerJoin', user, 'variants.biosample_id');
  }

  private withRepVariantsFilters(
    qb: Knex.QueryBuilder,
    analysisSetId: string,
    query: IGetReportableVariantQuery,
  ): void {
    const {
      reports, variantId, variantType, biosampleId,
    } = query;

    qb.where(function filters() {
      if (reports && reports.length) {
        this.whereIn('variants.report_type', reports);
      }

      if (analysisSetId) {
        this.andWhere('variants.analysis_set_id', analysisSetId);
      }

      if (biosampleId) {
        this.andWhere('variants.biosample_id', biosampleId);
      }

      if (variantId) {
        this.andWhere('variants.variant_id', variantId);
      }

      if (variantType && variantType.length) {
        this.whereIn('variants.variant_type', variantType);
      }
    });
  }
}
