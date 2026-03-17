import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IReviewerData } from 'Models/ClinicalVersion/ClinicalVersion.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';

@Injectable()
export class ReviewerClient {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  private reviewTable = 'zcc_clinical_reviewer';

  public async getReviewersByVersionId(
    clinicalVersionId: string,
  ): Promise<IReviewerData[]> {
    return this.knex
      .select({
        reviewerId: 'a.clinical_reviewer_id',
        status: 'a.status',
        group: 'a.role',
      })
      .from({ a: this.reviewTable })
      .where('a.clinical_version_id', clinicalVersionId);
  }

  // Place holder for is reviewer checking for the roles
}
