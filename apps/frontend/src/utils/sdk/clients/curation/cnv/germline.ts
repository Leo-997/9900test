import { AxiosInstance } from 'axios';
import type { VariantSeenInBiosample } from '@zero-dash/types';
import { cnvCNTypeOptions } from '../../../../../constants/options';
import {
  CNVCNType, IFilterImportance, IGermlineCNV, IUpdateCNVBody,
} from '../../../../../types/CNV.types';
import { ISummary } from '../../../../../types/Common.types';
import { ICNVGermlineSearchOptions } from '../../../../../types/Search.types';

export interface IGetGermlineCnvFilters {
  chromosome?: string[];
  gene?: string[];
  search?: string;
  classpath?: string[];
  importance?: IFilterImportance[];
  cn?: string[];
  cnType?: string[];
  isLOH?: boolean;
  reportable?: boolean;
  inMolecularReport?: boolean;
  sortColumns?: Array<string>;
  sortDirections?: Array<string>;
}

export interface IGermlineCnvClient {
  getCuratedSampleGermlineCnvSummary(biosampleId: string): Promise<ISummary>;
  getAllGermlineCnv(
    biosampleId: string,
    filters: IGetGermlineCnvFilters,
    page?: number,
    limit?: number
  ): Promise<IGermlineCNV[]>;
  getGermlineCnvByVariantId(
    biosampleId: string,
    variantId: string,
  ): Promise<IGermlineCNV>;
  getAllGermlineCnvCount(biosampleId: string, filters: IGetGermlineCnvFilters): Promise<number>;
  getSeenInByGeneId(
      biosampleId: string,
      variantId: number,
      page?: number,
      limit?: number,
    ): Promise<VariantSeenInBiosample[]>;
  getAllReportableGermlineCnv(
    biosampleId: string,
    signal?: AbortSignal,
  ): Promise<IGermlineCNV[]>;
  mapCnvGermlineFilters(filters: ICNVGermlineSearchOptions): IGetGermlineCnvFilters;
  updateRecordByVariantId(
    data: IUpdateCNVBody,
    biosampleId: string,
    variantId: number
  ): Promise<void>;
  clearCnvsPathclass(biosampleId: string): Promise<number>;
}

export function createGermlineCnvClient(
  instance: AxiosInstance,
): IGermlineCnvClient {
  async function getCuratedSampleGermlineCnvSummary(
    biosampleId: string,
  ): Promise<ISummary> {
    const resp = await instance.get<ISummary>(
      `/curation/${biosampleId}/germlinecnv/summary`,
    );
    return resp.data;
  }

  async function getAllGermlineCnv(
    biosampleId: string,
    filters: IGetGermlineCnvFilters,
    page = 1,
    limit = 100,
  ): Promise<IGermlineCNV[]> {
    const resp = await instance.post<IGermlineCNV[]>(
      `/curation/${biosampleId}/germlinecnv`,
      {
        ...filters,
        page,
        limit,
      },
    );

    return resp.data;
  }

  async function getGermlineCnvByVariantId(
    biosampleId: string,
    variantId: string,
  ): Promise<IGermlineCNV> {
    const resp = await instance.get<IGermlineCNV>(`/curation/${biosampleId}/germlinecnv/${variantId}`);

    return resp.data;
  }

  async function getAllGermlineCnvCount(
    biosampleId: string,
    filters: IGetGermlineCnvFilters,
  ): Promise<number> {
    const resp = await instance.post<number>(
      `/curation/${biosampleId}/germlinecnv/count`,
      {
        ...filters,
      },
    );

    return resp.data;
  }

  async function getSeenInByGeneId(
    biosampleId: string,
    geneId: number,
    page = 1,
    limit = 20,
  ): Promise<VariantSeenInBiosample[]> {
    const resp = await instance.get<VariantSeenInBiosample[]>(
      `/curation/${biosampleId}/germlinecnv/${geneId}/seen-in`,
      {
        params: {
          page,
          limit,
        },
      },
    );

    return resp.data;
  }

  async function getAllReportableGermlineCnv(
    biosampleId: string,
    signal?: AbortSignal,
  ): Promise<IGermlineCNV[]> {
    const resp = await instance.post<IGermlineCNV[]>(
      `/curation/${biosampleId}/germlinecnv`,
      {
        reportable: true,
      },
      {
        signal,
      },
    );

    return resp.data;
  }

  function mapCnvGermlineFilters({
    chromosome,
    genename,
    classpath,
    genesearchquery,
    geneimportancehigh,
    geneimportancemediumhigh,
    geneimportancemediumlow,
    geneimportancelow,
    cnType,
    cnloh,
    reportable,
    sortColumns,
    sortDirections,
  }: ICNVGermlineSearchOptions): IGetGermlineCnvFilters {
    const filters: IGetGermlineCnvFilters = {};

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

    if (cnType && cnType.length > 0) {
      filters.cnType = cnType.map(
        (t) => cnvCNTypeOptions.find((o) => o.name === t)?.value as CNVCNType,
      );
    }

    if (cnloh) filters.isLOH = true;

    if (reportable) filters.reportable = reportable;

    if (sortColumns && sortColumns.length > 0) {
      filters.sortColumns = sortColumns;
      filters.sortDirections = sortDirections;
    }

    return filters;
  }

  async function updateRecordByVariantId(
    data: Partial<IGermlineCNV>,
    biosampleId: string,
    variantId: number,
  ): Promise<void> {
    await instance.put(`/curation/${biosampleId}/germlinecnv/${variantId}`, data);
  }

  async function clearCnvsPathclass(biosampleId: string): Promise<number> {
    const resp = await instance.put<number>(`/curation/${biosampleId}/germlinecnv/pathclass`);

    return resp.data;
  }

  return {
    getCuratedSampleGermlineCnvSummary,
    getAllGermlineCnv,
    getGermlineCnvByVariantId,
    getAllGermlineCnvCount,
    getSeenInByGeneId,
    getAllReportableGermlineCnv,
    mapCnvGermlineFilters,
    updateRecordByVariantId,
    clearCnvsPathclass,
  };
}
