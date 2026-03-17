import { Inject, Injectable } from '@nestjs/common';
import { ReportableVariantsClient } from 'Clients/ReportableVariants/ReportableVariants.client';
import { IUpdateReportableVariantBody } from 'Models/Curation/ReportableVariants/ReportableVariantsBody';
import { IGetReportableVariantData, IGetReportableVariantQuery } from 'Models/Curation/ReportableVariants/ReportableVariantsQuery';
import { IUserWithMetadata } from 'Models/Users/Users.model';

@Injectable()
export class ReportableVariantsService {
  constructor(
    @Inject(ReportableVariantsClient) private readonly repVariantsClient: ReportableVariantsClient,
  ) {}

  public async getReportableVariants(
    analysisSetId: string,
    query: IGetReportableVariantQuery,
    user: IUserWithMetadata,
  ): Promise<IGetReportableVariantData[]> {
    return this.repVariantsClient.getReportableVariants(analysisSetId, query, user);
  }

  public async updateReportableVariant(
    analysisSetId: string,
    biosampleId: string,
    body: IUpdateReportableVariantBody,
  ): Promise<void> {
    return this.repVariantsClient.updateReportableVariant(analysisSetId, biosampleId, body);
  }
}
