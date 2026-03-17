import { AxiosInstance } from 'axios';
import { ISVSearchOptions, SortDirection } from '../../../../../types/Search.types';
import { FilterImportance, ISomaticSV, SVSummary } from '../../../../../types/SV.types';

export interface IGetSomaticSvFilters {
  chromosome?: string[];
  gene?: string[];
  search?: string;
  classpath?: string[];
  importance?: FilterImportance[];
  inframe?: string[];
  platform?: string[];
  rnaConfidence?: string[];
  svType?: string[];
  reportable?: boolean;
  inMolecularReport?: boolean;
  sortColumns?: string[];
  sortDirections?: SortDirection[];
  defaultFilter?: boolean;
}

export interface IBedFileLine {
  chr: string;
  pos1: number;
  pos2: number;
}

export interface ISomaticSvClient {
  getSVs(
    biosampleId: string,
    filters?: IGetSomaticSvFilters,
    page?: number,
    limit?: number,
  ): Promise<ISomaticSV[]>;
  getSVById(biosampleId: string, id: string): Promise<ISomaticSV>;
  getSVsCount(biosampleId: string, filters: IGetSomaticSvFilters): Promise<number>;
  getReportableSVs(
    biosampleId: string,
    signal?: AbortSignal,
  ): Promise<ISomaticSV[]>;
  getSVSummary(biosampleId: string): Promise<SVSummary>;
  mapSvFilters(filters: ISVSearchOptions): IGetSomaticSvFilters;
  updateSvById(
    data: Partial<ISomaticSV>,
    biosampleId: string,
    id: number
  ): Promise<void>;
  promoteSV(biosampleId: string, promotedSvId: number, analysisSetId: string): Promise<void>;
  createAndGetBedFile(
    biosampleId: string,
    bedFileContent: IBedFileLine[]
  ): Promise<string | null>;
  clearSvsPathclass(biosampleId: string): Promise<number>;
}

export function createSomaticSvClient(instance: AxiosInstance): ISomaticSvClient {
  async function getSVs(
    biosampleId: string,
    filters?: IGetSomaticSvFilters,
    page = 1,
    limit = 100,
  ): Promise<ISomaticSV[]> {
    const resp = await instance.post<ISomaticSV[]>(`/curation/${biosampleId}/sv`, {
      ...filters,
      page,
      limit,
    });

    return resp.data;
  }

  async function getSVById(
    biosampleId: string,
    id: string,
  ): Promise<ISomaticSV> {
    const resp = await instance.get<ISomaticSV>(`/curation/${biosampleId}/sv/${id}`);

    return resp.data;
  }

  async function getReportableSVs(
    biosampleId: string,
    signal?: AbortSignal,
  ): Promise<ISomaticSV[]> {
    const resp = await instance.post<ISomaticSV[]>(
      `/curation/${biosampleId}/sv`,
      {
        reportable: true,
      },
      {
        signal,
      },
    );
    return resp.data;
  }

  async function getSVsCount(
    biosampleId: string,
    filters: IGetSomaticSvFilters,
  ): Promise<number> {
    const resp = await instance.post<number>(
      `/curation/${biosampleId}/sv/count`,
      {
        ...filters,
      },
    );

    return resp.data;
  }

  async function getSVSummary(biosampleId: string): Promise<SVSummary> {
    const resp = await instance.get<SVSummary>(`/curation/${biosampleId}/sv/summary`);
    return resp.data;
  }

  function mapSvFilters({
    chromosome,
    genename,
    classpath,
    genesearchquery,
    geneimportancehigh,
    geneimportancemediumhigh,
    geneimportancemediumlow,
    geneimportancelow,
    inframe,
    platform,
    rnaConfidence,
    fusionevent,
    reportable,
    sortColumns,
    sortDirections,
  }: ISVSearchOptions): IGetSomaticSvFilters {
    const filters: IGetSomaticSvFilters = {};

    if (chromosome) filters.chromosome = chromosome.map((chr) => chr);

    if (genename) filters.gene = genename.map((g) => g.gene);

    if (genesearchquery) filters.search = genesearchquery;

    if (classpath) filters.classpath = classpath.map((cls) => cls);

    if (geneimportancehigh) {
      if (filters.importance) {
        filters.importance.push('high');
      } else {
        filters.importance = ['high'];
      }
    }

    if (geneimportancemediumhigh) {
      if (filters.importance) {
        filters.importance.push('mediumhigh');
      } else {
        filters.importance = ['mediumhigh'];
      }
    }

    if (geneimportancemediumlow) {
      if (filters.importance) {
        filters.importance.push('mediumlow');
      } else {
        filters.importance = ['mediumlow'];
      }
    }

    if (geneimportancelow) {
      if (filters.importance) {
        filters.importance.push('low');
      } else {
        filters.importance = ['low'];
      }
    }

    if (inframe) filters.inframe = inframe;
    if (platform) filters.platform = platform;
    if (rnaConfidence) filters.rnaConfidence = rnaConfidence;

    if (fusionevent) filters.svType = fusionevent;

    if (reportable) filters.reportable = reportable;

    if (sortColumns && sortColumns.length > 0) {
      filters.sortColumns = sortColumns;
      filters.sortDirections = sortDirections;
    }

    return filters;
  }

  async function updateSvById(
    data: Partial<ISomaticSV>,
    biosampleId: string,
    id: number,
  ): Promise<void> {
    await instance.put(`/curation/${biosampleId}/sv/${id}`, data);
  }

  async function clearSvsPathclass(biosampleId: string): Promise<number> {
    const resp = await instance.put<number>(`/curation/${biosampleId}/sv/pathclass`);

    return resp.data;
  }

  async function promoteSV(
    biosampleId: string,
    promotedSvId: number,
    analysisSetId: string,
  ): Promise<void> {
    await instance.put(`/curation/${biosampleId}/sv/${promotedSvId}/promote/${analysisSetId}`);
  }

  async function createAndGetBedFile(
    biosampleId: string,
    bedFileContent: IBedFileLine[],
  ): Promise<string | null> {
    const requestURL = `/curation/${biosampleId}/sv/bed-file`;
    const resp = await instance.post<string>(requestURL, bedFileContent);
    return resp.data;
  }

  return {
    getSVs,
    getSVById,
    getSVsCount,
    getReportableSVs,
    getSVSummary,
    mapSvFilters,
    updateSvById,
    promoteSV,
    createAndGetBedFile,
    clearSvsPathclass,
  };
}
