import { ISVGermlineSearchOptions, SortDirection } from '@/types/Search.types';
import { FilterImportance, IGermlineSV, SVGermlineSummary } from '@/types/SV.types';
import { AxiosInstance } from 'axios';

export interface IGetGermlineSvFilters {
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

export interface IGermlineSvClient {
  getGermlineSVs(
    biosampleId: string,
    filters?: IGetGermlineSvFilters,
    page?: number,
    limit?: number,
  ): Promise<IGermlineSV[]>;
  getReportableGermlineSVs(
    biosampleId: string,
    signal?: AbortSignal,
  ): Promise<IGermlineSV[]>;
  getSampleGermlineSVById(
    biosampleId: string,
    id: string
  ): Promise<IGermlineSV>;
  getGermlineSVSummary(biosampleId: string): Promise<SVGermlineSummary>;
  mapSVGermlineFilters(filters: ISVGermlineSearchOptions): IGetGermlineSvFilters;
  updateGermlineSVById(
    data: Partial<IGermlineSV>,
    biosampleId: string,
    id: string,
  ): Promise<void>;
  promoteGermlineSV(
    biosampleId: string,
    promotedSVId: string,
    analysisSetId: string,
  ): Promise<void>;
  getSampleGermlineSVsCount(
    biosampleId: string,
    filters: IGetGermlineSvFilters
  ): Promise<number>;
  createAndGetBedFile(
    biosampleId: string,
    bedFileContent: IBedFileLine[]
  ): Promise<string | null>;
  clearSvsPathclass(biosampleId: string): Promise<number>;
}

export function createGermlineSvClient(instance: AxiosInstance): IGermlineSvClient {
  async function getGermlineSVs(
    biosampleId: string,
    filters?: IGetGermlineSvFilters,
    page = 1,
    limit = 100,
  ): Promise<IGermlineSV[]> {
    const resp = await instance.post<IGermlineSV[]>(`/curation/${biosampleId}/germlinesv`, {
      ...filters,
      page,
      limit,
    });

    return resp.data;
  }

  async function getReportableGermlineSVs(
    biosampleId: string,
    signal: AbortSignal,
  ): Promise<IGermlineSV[]> {
    const resp = await instance.post<IGermlineSV[]>(
      `/curation/${biosampleId}/germlinesv`,
      {
        reportable: true,
      },
      {
        signal,
      },
    );
    return resp.data;
  }

  async function getSampleGermlineSVById(
    biosampleId: string,
    id: string,
  ): Promise<IGermlineSV> {
    const resp = await instance.get<IGermlineSV>(`/curation/${biosampleId}/germlinesv/${id}`);

    return resp.data;
  }

  async function getGermlineSVSummary(biosampleId: string): Promise<SVGermlineSummary> {
    const resp = await instance.get<SVGermlineSummary>(`/curation/${biosampleId}/germlinesv/summary`);
    return resp.data;
  }

  function mapSVGermlineFilters({
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
  }: ISVGermlineSearchOptions): IGetGermlineSvFilters {
    const filters: IGetGermlineSvFilters = {};

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

  async function updateGermlineSVById(
    data: Partial<IGermlineSV>,
    biosampleId: string,
    id: string,
  ): Promise<void> {
    await instance.put(`/curation/${biosampleId}/germlinesv/${id}`, data);
  }

  async function promoteGermlineSV(
    biosampleId: string,
    promotedSvId: string,
    analysisSetId: string,
  ): Promise<void> {
    await instance.put(`/curation/${biosampleId}/germlinesv/${promotedSvId}/promote/${analysisSetId}`);
  }

  async function getSampleGermlineSVsCount(
    biosampleId: string,
    filters: IGetGermlineSvFilters,
  ): Promise<number> {
    const resp = await instance.post<number>(
      `/curation/${biosampleId}/germlinesv/count`,
      {
        ...filters,
      },
    );

    return resp.data;
  }

  async function createAndGetBedFile(
    biosampleId: string,
    bedFileContent: IBedFileLine[],
  ): Promise<string | null> {
    const requestURL = `/curation/sv/${biosampleId}/bed-file`;
    const resp = await instance.post<string>(requestURL, bedFileContent);
    return resp.data;
  }

  async function clearSvsPathclass(biosampleId: string): Promise<number> {
    const resp = await instance.put<number>(`/curation/${biosampleId}/germlinesv/pathclass`);

    return resp.data;
  }

  return {
    getGermlineSVs,
    getReportableGermlineSVs,
    getSampleGermlineSVById,
    getGermlineSVSummary,
    mapSVGermlineFilters,
    updateGermlineSVById,
    promoteGermlineSV,
    getSampleGermlineSVsCount,
    createAndGetBedFile,
    clearSvsPathclass,
  };
}
