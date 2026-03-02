import { ISampleCorrectionFlag, ISampleUpdateCorrectionFlag, NewCorrectionFlagInput } from '@/types/Corrections.types';
import { AxiosInstance } from 'axios';

export interface ICorrectionFlagsClient {
  getCorrectionFlags(analysisSetId: string): Promise<ISampleCorrectionFlag[]>;
  createNewCorrectionFlag(
    data: NewCorrectionFlagInput,
    analysisSetId: string
  ): Promise<Record<'id', number>>;
  updateCorrectionFlag(
    analysisSetId: string,
    flagId: number,
    data: ISampleUpdateCorrectionFlag,
  ): Promise<string>;
}

export function createFlagsClient(instance: AxiosInstance): ICorrectionFlagsClient {
  async function getCorrectionFlags(
    analysisSetId: string,
  ): Promise<ISampleCorrectionFlag[]> {
    const resp = await instance.get<ISampleCorrectionFlag[]>(
      'correction-flags',
      {
        params: {
          analysisSetId,
        },
      },
    );

    return resp.data;
  }

  async function createNewCorrectionFlag(
    data: Omit<NewCorrectionFlagInput, 'tempId'>,
    analysisSetId: string,
  ): Promise<Record<'id', number>> {
    const resp = await instance.post<Record<'id', number>>('/correction-flags', {
      ...data,
      analysisSetId,
    });
    return resp.data;
  }

  async function updateCorrectionFlag(
    analysisSetId: string,
    flagId: number,
    data: ISampleUpdateCorrectionFlag,
  ): Promise<string> {
    const resp = await instance.patch(`/correction-flags/${analysisSetId}/${flagId}`, data);

    return resp.data;
  }

  return {
    getCorrectionFlags,
    createNewCorrectionFlag,
    updateCorrectionFlag,
  };
}
