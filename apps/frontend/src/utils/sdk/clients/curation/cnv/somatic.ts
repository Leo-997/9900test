import { AxiosInstance } from 'axios';
import { cnvCNTypeOptions } from '../../../../../constants/options';
import {
  CNVCNType,
  ICNVSummary, IFilterImportance,
  ISomaticCNV,
  IUpdateCNVBody,
} from '../../../../../types/CNV.types';
import { ICNVSearchOptions } from '../../../../../types/Search.types';

export interface IGetSomaticCnvFilters {
  chromosome?: string[];
  inMolecularReport?: boolean;
  gene?: string[];
  search?: string;
  classpath?: string[];
  importance?: IFilterImportance[];
  cn?: number[];
  cnType?: string[];
  isLOH?: boolean;
  reportable?: boolean;
  sortColumns?: string[];
  sortDirections?: string[];
  defaultFilter?: boolean;
}
export interface ISomaticCnvClient {
  getCuratedSampleSomaticCnvSummary(biosampleId: string): Promise<ICNVSummary>;
  getCnvRecords(
    filters: IGetSomaticCnvFilters,
    biosampleId: string,
    page?: number,
    limit?: number,
    signal?: AbortSignal,
  ): Promise<ISomaticCNV[]>;
  getCuratedSampleSomaticCnvByVariantId(
    biosampleId: string,
    variantId: string,
  ): Promise<ISomaticCNV>;
  getCnvRecordsCount(
    filters: IGetSomaticCnvFilters,
    biosampleId: string
  ): Promise<number>;
  getReportableSampleSomaticCnvs(
    biosampleId: string,
    signal?: AbortSignal,
  ): Promise<ISomaticCNV[]>;
  mapCnvFilters(filters: ICNVSearchOptions): IGetSomaticCnvFilters;
  updateCnvRecordById(
    biosampleId: string,
    variantId: number,
    data: IUpdateCNVBody
  ): Promise<number>;
  clearCnvsPathclass(biosampleId: string): Promise<number>;
}

export function createSomaticCnvClient(
  instance: AxiosInstance,
): ISomaticCnvClient {
  async function getCuratedSampleSomaticCnvSummary(
    biosampleId: string,
  ): Promise<ICNVSummary> {
    const resp = await instance.get<ICNVSummary>(
      `/curation/${biosampleId}/cnv/summary`,
    );
    return resp.data;
  }

  async function getCnvRecords(
    filters: IGetSomaticCnvFilters,
    biosampleId: string,
    page = 1,
    limit = 100,
    signal: AbortSignal | undefined = undefined,
  ): Promise<ISomaticCNV[]> {
    const resp = await instance.post<ISomaticCNV[]>(
      `/curation/${biosampleId}/cnv`,
      {
        ...filters,
        page,
        limit,
      },
      {
        signal,
      },
    );

    return resp.data;
  }

  async function getCuratedSampleSomaticCnvByVariantId(
    biosampleId: string,
    variantId: string,
  ): Promise<ISomaticCNV> {
    const resp = await instance.get<ISomaticCNV>(`/curation/${biosampleId}/cnv/${variantId}`);

    return resp.data;
  }

  async function getReportableSampleSomaticCnvs(
    biosampleId: string,
    signal?: AbortSignal,
  ): Promise<ISomaticCNV[]> {
    const resp = await instance.post<ISomaticCNV[]>(
      `/curation/${biosampleId}/cnv`,
      {
        reportable: true,
      },
      {
        signal,
      },
    );
    return resp.data;
  }

  async function getCnvRecordsCount(
    filters: IGetSomaticCnvFilters,
    biosampleId: string,
  ): Promise<number> {
    const resp = await instance.post<number>(
      `/curation/${biosampleId}/cnv/count`,
      {
        ...filters,
      },
    );

    return resp.data;
  }

  function mapCnvFilters({
    cn,
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
  }: ICNVSearchOptions): IGetSomaticCnvFilters {
    const filters: IGetSomaticCnvFilters = {};

    if (cn) filters.cn = cn.map((c) => c);

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

    if (cnType) {
      filters.cnType = cnType.map(
        (t) => cnvCNTypeOptions.find((o) => o.name === t)?.value as CNVCNType,
      );
    }

    if (cnloh) filters.isLOH = true;

    if (reportable) filters.reportable = reportable;

    if (sortColumns?.length !== 0) {
      filters.sortColumns = sortColumns;
      filters.sortDirections = sortDirections;
    }

    return filters;
  }

  async function updateCnvRecordById(
    biosampleId: string,
    variantId: number,
    data: IUpdateCNVBody,
  ): Promise<number> {
    const resp = await instance.put<number>(
      `/curation/${biosampleId}/cnv/${variantId}`,
      data,
    );

    return resp.data;
  }

  async function clearCnvsPathclass(biosampleId: string): Promise<number> {
    const resp = await instance.put<number>(`/curation/${biosampleId}/cnv/pathclass`);

    return resp.data;
  }

  return {
    getCuratedSampleSomaticCnvSummary,
    getCnvRecords,
    getCuratedSampleSomaticCnvByVariantId,
    getCnvRecordsCount,
    getReportableSampleSomaticCnvs,
    mapCnvFilters,
    updateCnvRecordById,
    clearCnvsPathclass,
  };
}
