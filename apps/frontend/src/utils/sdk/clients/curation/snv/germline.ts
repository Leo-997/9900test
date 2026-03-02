import { AxiosInstance } from 'axios';
import {
  IReportableVariant,
  ISummary,
  PathClass,
  Phenotype,
} from '../../../../../types/Common.types';
import { HeliumSummary } from '../../../../../types/Helium.types';
import { ISNVGermlineSearchOptions } from '../../../../../types/Search.types';
import {
  IChromPosRefAlt, IGermlineSNV, IReportableGermlineSNV, VariantZygosity, Zygosity,
} from '../../../../../types/SNV.types';

export interface IUpdateGermlineSNVBody extends Partial<IReportableVariant> {
  pathclass?: PathClass;
  phenotype?: Phenotype;
  pecan?: boolean | null;
  zygosity?: Zygosity | null;
  researchCandidate?: boolean | null;
}

export interface IGetSnvGermlineFilters {
  chromosome?: string[];
  gene: string[];
  search?: string;
  variantIds?: string[];
  classpath?: string[];
  consequence?: string[];
  vcf?: boolean;
  gnomad?: number[];
  vaf?: number[];
  reads?: string[];
  impact?: string[];
  unfiltered?: boolean;
  reportable?: boolean;
  sortColumns?: string[];
  sortDirections?: string[];
  defaultFilter?: boolean;
}

export interface IGermlineSnvClient {
  getAllGermlineSnv(
    biosampleId: string,
    filters?: IGetSnvGermlineFilters,
    page?: number,
    limit?: number
  ): Promise<IGermlineSNV[]>;
  getGermlineSnvByVariantId(
    biosampleId: string,
    cpra: IChromPosRefAlt,
  ): Promise<IGermlineSNV>;
  getVariantZygosity(
    biosampleId: string,
    variantIds: string[],
    tumourBiosampleId?: string,
    signal?: AbortSignal,
  ): Promise<VariantZygosity[]>;
  getAllGermlineSnvCount(
    biosampleId: string,
    filters?: IGetSnvGermlineFilters,
  ): Promise<number>;
  getHeliumSummary(biosampleId: string): Promise<ISummary>;
  getReportableSampleGermlineSnvs(
    biosampleId: string,
    signal?: AbortSignal,
  ): Promise<IReportableGermlineSNV[]>;
  updateCuratedSampleGermlineSnvById(
    biosampleId: string,
    data: Partial<IUpdateGermlineSNVBody>,
    cpra: IChromPosRefAlt,
  ): Promise<number>;
  mapSnvGermlineFilters(
    filters: ISNVGermlineSearchOptions
  ): IGetSnvGermlineFilters;
  clearSnvsPathclass(biosampleId: string): Promise<number>;
}

export function createGermlineSnvClient(
  instance: AxiosInstance,
): IGermlineSnvClient {
  async function getAllGermlineSnv(
    biosampleId: string,
    filters?: IGetSnvGermlineFilters,
    page = 1,
    limit = 100,
  ): Promise<IGermlineSNV[]> {
    const resp = await instance.post<IGermlineSNV[]>(
      `/curation/${biosampleId}/germlinesnv`,
      {
        ...filters,
        page,
        limit,
      },
    );

    return resp.data;
  }

  async function getGermlineSnvByVariantId(
    biosampleId: string,
    cpra: IChromPosRefAlt,
  ): Promise<IGermlineSNV> {
    const resp = await instance.get<IGermlineSNV>(
      `/curation/${biosampleId}/germlinesnv`,
      {
        params: cpra,
      },
    );

    return resp.data;
  }

  async function getVariantZygosity(
    biosampleId: string,
    variantIds: string[],
    tumourBiosampleId?: string,
    signal?: AbortSignal,
  ): Promise<VariantZygosity[]> {
    const resp = await instance.get<VariantZygosity[]>(
      `/curation/${biosampleId}/germlinesnv/zygosity`,
      {
        params: {
          variantIds,
          biosampleId: tumourBiosampleId,
        },
        signal,
      },
    );

    return resp.data;
  }

  async function getAllGermlineSnvCount(
    biosampleId: string,
    filters: IGetSnvGermlineFilters,
  ): Promise<number> {
    const resp = await instance.post<number>(
      `/curation/${biosampleId}/germlinesnv/count`,
      {
        ...filters,
      },
    );

    return resp.data;
  }

  async function getReportableSampleGermlineSnvs(
    biosampleId: string,
    signal?: AbortSignal,
  ): Promise<IReportableGermlineSNV[]> {
    const resp = await instance.get<IReportableGermlineSNV[]>(
      `/curation/${biosampleId}/germlinesnv/reportable`,
      {
        signal,
      },
    );

    return resp.data;
  }

  async function updateCuratedSampleGermlineSnvById(
    biosampleId: string,
    data: IUpdateGermlineSNVBody,
    cpra: IChromPosRefAlt,
  ): Promise<number> {
    const resp = await instance.put(
      `/curation/${biosampleId}/germlinesnv/`,
      {
        ...data,
        ...cpra,
      },
    );
    return resp.data;
  }

  async function getHeliumSummary(biosampleId: string): Promise<ISummary> {
    const resp = await instance.get<HeliumSummary>(
      `/curation/${biosampleId}/germlinesnv/summary`,
    );
    const { data } = resp;
    return { min: data.minScore, mid: data.avgScore, max: data.maxScore };
  }

  function mapSnvGermlineFilters({
    chromosome,
    genename,
    genesearchquery,
    classpath,
    consequence,
    vcf,
    gnomad,
    vaf,
    reads,
    unfiltered,
    reportable,
    sortColumns,
    sortDirections,
  }: ISNVGermlineSearchOptions): IGetSnvGermlineFilters {
    const filters: IGetSnvGermlineFilters = {
      gene: [],
    };

    if (chromosome) filters.chromosome = chromosome.map((chr) => chr);

    if (genename) filters.gene = genename.map((g) => g.gene);

    if (genesearchquery) filters.search = genesearchquery;

    if (classpath) filters.classpath = classpath.map((cls) => cls);

    if (consequence) filters.consequence = consequence.map((cons) => cons);

    if (unfiltered) filters.unfiltered = unfiltered;

    if (gnomad.min > gnomad.defaults[0] || gnomad.max < gnomad.defaults[1]) {
      filters.gnomad = [gnomad.min, gnomad.max];
    }

    if (vaf.min > vaf.defaults[0] || vaf.max < vaf.defaults[1]) {
      filters.vaf = [vaf.min, vaf.max];
    }

    if (reads.min > reads.defaults[0] || reads.max < reads.defaults[1]) {
      filters.reads = [reads.min.toString(), reads.max.toString()];
    }

    if (vcf) filters.vcf = true;

    if (reportable) filters.reportable = true;

    if (sortColumns && sortColumns.length > 0) {
      filters.sortColumns = sortColumns;
      filters.sortDirections = sortDirections;
    }

    return filters;
  }

  async function clearSnvsPathclass(biosampleId: string): Promise<number> {
    const resp = await instance.put<number>(`/curation/${biosampleId}/germlinesnv/pathclass`);

    return resp.data;
  }

  return {
    getAllGermlineSnv,
    getGermlineSnvByVariantId,
    getVariantZygosity,
    getAllGermlineSnvCount,
    getHeliumSummary,
    getReportableSampleGermlineSnvs,
    updateCuratedSampleGermlineSnvById,
    mapSnvGermlineFilters,
    clearSnvsPathclass,
  };
}
