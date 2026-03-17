import { AxiosInstance } from 'axios';
import { ISampleRequest, SampleResponse } from '../../../types/IGV.types';

export interface IIGVClient {
  getSampleLinks({
    sampleIds,
  }): Promise<SampleResponse>;
}

export function createIGVClient(
  instance: AxiosInstance,
): IIGVClient {
  async function getSampleLinks({
    sampleIds,
  }: ISampleRequest): Promise<SampleResponse> {
    const resp = await instance.post<SampleResponse>('/igv/links', {
      sampleIds,
    });

    return resp.data;
  }

  return {
    getSampleLinks,
  };
}
