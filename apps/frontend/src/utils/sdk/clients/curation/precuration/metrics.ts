import { IImmunoprofile, IRNASeqMetrics, ISeqMetrics } from '@/types/Precuration/QCMetrics.types';
import { AxiosInstance } from 'axios';

export interface IMetricsClient {
  getMetrics: (biosampleId: string) => Promise<ISeqMetrics>;
  getRNASeqMetrics: (biosampleId: string) => Promise<IRNASeqMetrics>;
  getImmunoprofile: (biosampleId: string) => Promise<IImmunoprofile>;
  getReportLink(sampleId: string): Promise<string>;
}

export function createMetricsClient(instance: AxiosInstance): IMetricsClient {
  async function getMetrics(biosampleId: string): Promise<ISeqMetrics> {
    const resp = await instance.get<ISeqMetrics>(`/qcdata/${biosampleId}/metrics`);
    return resp.data;
  }

  async function getImmunoprofile(biosampleId: string): Promise<IImmunoprofile> {
    const resp = await instance.get<IImmunoprofile>(
      `/qcdata/${biosampleId}/immunoprofile`,
    );
    return resp.data;
  }

  async function getRNASeqMetrics(biosampleId: string): Promise<IRNASeqMetrics> {
    const resp = await instance.get<IRNASeqMetrics>(`/qcdata/${biosampleId}/rnaseq-metrics`);
    return resp.data;
  }

  async function getReportLink(sampleId: string): Promise<string> {
    const resp = await instance.get<string>(`qcdata/${sampleId}/report`);
    return resp.data;
  }

  return {
    getMetrics,
    getRNASeqMetrics,
    getImmunoprofile,
    getReportLink,
  };
}
