import { AxiosInstance } from 'axios';
import { IPathway } from '../../../../../components/Pathways/PathwaysListItem';

export interface IPathwaysClient {
  getAllPathways(
    biosampleId: string,
    search?: string,
    page?: number,
    limit?: number,
  ): Promise<IPathway[]>
  getAllPathwaysCount(
    biosampleId: string,
    search?: string,
  ): Promise<number>
}

export function createPathwaysClient(instance: AxiosInstance): IPathwaysClient {
  async function getAllPathways(
    biosampleId: string,
    search?: string,
    page = 1,
    limit = 100,
  ): Promise<IPathway[]> {
    const resp = await instance.get(
      `/curation/${biosampleId}/pathways`,
      {
        params: {
          page,
          limit,
          search,
        },
      },
    );

    return resp.data;
  }

  async function getAllPathwaysCount(biosampleId: string, search?: string): Promise<number> {
    const resp = await instance.get(
      `/curation/${biosampleId}/pathways/count`,
      {
        params: {
          search,
        },
      },
    );

    return resp.data;
  }

  return {
    getAllPathways,
    getAllPathwaysCount,
  };
}
