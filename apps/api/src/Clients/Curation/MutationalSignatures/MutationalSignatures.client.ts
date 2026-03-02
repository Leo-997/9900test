import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IGetReportableVariant } from 'Models/Common/Requests/GetReportableVariant.model';
import {
  ISignatureData,
} from 'Models/Curation/MutationalSignatures/MutationalSignatures.model';
import { IUpdateSignature } from 'Models/Curation/MutationalSignatures/Requests/UpdateSignatureBodyDTO.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';
import { filterClassification } from 'Utilities/query/classification.util';

@Injectable()
export class MutationalSignaturesClient {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) {}

  public getSigData(
    biosampleId: string,
    filters: IGetReportableVariant,
    user: IUserWithMetadata,
  ): Promise<ISignatureData[]> {
    return this.baseQuery(user)
      .where('a.biosample_id', biosampleId)
      .modify(this.withFilters, filters)
      .orderBy('contribution', 'desc');
  }

  public async getSigById(
    biosampleId: string,
    variantId: string,
    user: IUserWithMetadata,
  ): Promise<ISignatureData> {
    return this.baseQuery(user)
      .where('a.biosample_id', biosampleId)
      .andWhere('a.signature', variantId)
      .first();
  }

  public async updateSigs(
    biosampleId: string,
    sig: string,
    {
      researchCandidate,
      ...rest
    }: IUpdateSignature,
  ): Promise<number> {
    return this.knex
      .where('a.biosample_id', biosampleId)
      .andWhere('a.signature', sig)
      .update({
        research_candidate: researchCandidate,
        ...rest,
      })
      .from<ISignatureData>({ a: 'zcc_curated_sample_somatic_mutsig' });
  }

  private baseQuery(
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    return this.knex
      .select({
        signature: 'a.signature',
        contribution: 'a.sig_contrib',

        classification: 'a.classification',
        reportable: 'a.reportable',
        targetable: 'a.targetable',

        // counts
        reportedCount: 'b.reported_count',
        targetableCount: 'b.targetable_count',
      })
      .from({ a: 'zcc_curated_sample_somatic_mutsig' })
      .modify(withBiosample, 'innerJoin', user, 'a.biosample_id')
      .leftJoin(
        { b: 'zcc_curated_somatic_mutsig_counts' },
        'a.signature',
        'b.signature',
      );
  }

  private withFilters(qb: Knex.QueryBuilder, filters: IGetReportableVariant): void {
    qb.andWhere(function isReportable() {
      if (filters.reportable !== undefined) {
        this.andWhere('a.reportable', filters.reportable);
      }
    })
      .andWhere(function isTargetable() {
        if (filters.targetable !== undefined) {
          this.andWhere('a.targetable', filters.targetable);
        }
      })
      .modify(filterClassification, 'a.classification', filters.isClassified);
  }
}
