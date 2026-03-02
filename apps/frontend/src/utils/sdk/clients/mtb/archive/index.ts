import { AxiosInstance } from 'axios';
import { IArchiveSample, IArchiveSamplesQuery } from '../../../../../types/MTB/Archive.types';

export interface IClinicalArchiveClient {
  getArchiveSamples: (
    filters: IArchiveSamplesQuery,
    page?: number,
    limit?: number,
  ) => Promise<IArchiveSample[]>;
  getArchiveSamplesCount: (
    filters: IArchiveSamplesQuery,
  ) => Promise<number>;
}

interface IMappedArchiveQuery extends Omit<IArchiveSamplesQuery, 'genes' | 'geneMutations'> {
  geneIds?: number[];
  geneMutations?: string[];
}

export function createClinicalArchiveClient(instance: AxiosInstance): IClinicalArchiveClient {
  function mapThreadsQuery(query: IArchiveSamplesQuery): IMappedArchiveQuery {
    const params = {
      ...query,
      geneIds: query.genes?.map((g) => g.geneId),
      geneMutations: query.geneMutations?.map((mutation) => `${mutation.variantType}:${mutation.gene}`),
    };
    delete params.genes;
    return params;
  }

  async function getArchiveSamples(
    filters: IArchiveSamplesQuery,
    page = 1,
    limit = 10,
  ): Promise<IArchiveSample[]> {
    const resp = await instance.get<IArchiveSample[]>(
      '/clinical/archive/samples',
      { params: { ...mapThreadsQuery(filters), page, limit } },
    );
    return resp.data;
  }

  async function getArchiveSamplesCount(
    filters: IArchiveSamplesQuery,
  ): Promise<number> {
    const resp = await instance.get<number>(
      '/clinical/archive/samples/count',
      { params: mapThreadsQuery(filters) },
    );
    return resp.data;
  }

  return {
    getArchiveSamples,
    getArchiveSamplesCount,
  };
}
