import { Injectable } from '@nestjs/common';
import { QCDataClient } from 'Clients/Precuration/QCMetrics/QCData.client';
import {
  IImmunoprofile,
  IRNASeqMetrics,
  ISeqMetrics,
} from 'Models/Precuration/QCData.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';

@Injectable()
export class QCDataService {
  constructor(
    private readonly qcDataClient: QCDataClient,
  ) {}

  public async getMetricsData(biosampleId: string, user: IUserWithMetadata): Promise<ISeqMetrics> {
    return this.qcDataClient.getMetricsData(biosampleId, user);
  }

  public async getRNASeqMetrics(biosampleId: string, user: IUserWithMetadata): Promise<IRNASeqMetrics> {
    return this.qcDataClient.getRNASeqMetrics(biosampleId, user);
  }

  async getImmunoprofile(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<IImmunoprofile> {
    return this.qcDataClient.getImmunoprofile(biosampleId, user);
  }

  public async getReportLink(
    biosampleId: string,
    user: IUserWithMetadata,
  ): Promise<string> {
    return this.qcDataClient.getReportLink(biosampleId, user);
  }
}
