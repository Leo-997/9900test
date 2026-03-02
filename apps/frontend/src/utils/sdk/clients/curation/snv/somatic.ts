import { AxiosInstance } from 'axios';

import type { VariantSeenInBiosample } from '@zero-dash/types/dist/src/variants/Variants.types';
import {
  IReportableVariant,
  ISummary,
  PathClass,
  Platforms,
} from '../../../../../types/Common.types';
import { HeliumSummary } from '../../../../../types/Helium.types';
import { ISNVSearchOptions } from '../../../../../types/Search.types';
import { ISomaticSnv, Zygosity } from '../../../../../types/SNV.types';

export interface IUpdateCuratedSampleSomaticSNVsByIdBody extends Partial<IReportableVariant> {
  pathclass?: PathClass;
  platform?: Platforms | 'No';
  pecan?: boolean | null;
  zygosity?: Zygosity | null;
  researchCandidate?: boolean | null;
}

export interface IGetSomaticSnvFilters {
  chromosome?: string[];
  gene?: string[];
  search?: string;
  classpath?: string[];
  consequence?: string[];
  vcf?: boolean;
  inMolecularReport?: boolean;
  gnomad?: number[];
  vaf?: number[];
  reads?: string[];
  platform?: string[];
  impact?: string[];
  loh?: boolean;
  biallelic?: boolean;
  unfiltered?: boolean;
  minPathscore?: number;
  maxPathscore?: number;
  reportable?: boolean | 'null';
  sortColumns?: string[];
  sortDirections?: string[];
  defaultFilter?: boolean;
}

export interface ISomaticSnvClient {
  getCuratedSampleSomaticSnvHeliumSummary(biosampleId: string): Promise<ISummary>;
  getCuratedSampleSomaticSnvs(
    biosampleId: string,
    filters?: IGetSomaticSnvFilters,
    page?: number,
    limit?: number,
    params?: {
      search?: string;
      reportable?: 'true' | 'false' | 'null';
      minPathscore?: number;
      maxPathscore?: number;
    }
  ): Promise<ISomaticSnv[]>;
  getCuratedSampleSomaticSnvByVariantId(
    biosampleId: string,
    variantId: string
  ): Promise<ISomaticSnv>;
  getCuratedSampleSomaticSnvsCount(
    biosampleId: string,
    filters?: IGetSomaticSnvFilters
  ): Promise<number>;
  getSeenInByVariantId(
    biosampleId: string,
    variantId: string,
    inGermline?: boolean,
    page?: number,
    limit?: number,
  ): Promise<VariantSeenInBiosample[]>;
  getReportableSampleSomaticSnvs(
    biosampleId: string,
    signal?: AbortSignal,
  ): Promise<ISomaticSnv[]>;
  updateCuratedSampleSomaticSnvById(
    data: IUpdateCuratedSampleSomaticSNVsByIdBody,
    biosampleId: string,
    snvId: number
  ): Promise<number>;
  clearSnvsPathclass(biosampleId: string): Promise<number>;
  mapSnvFilters(filters: ISNVSearchOptions): IGetSomaticSnvFilters;
}

export function createSomaticSnvClient(
  instance: AxiosInstance,
): ISomaticSnvClient {
  async function getCuratedSampleSomaticSnvHeliumSummary(
    biosampleId: string,
  ): Promise<ISummary> {
    const resp = await instance.get<HeliumSummary>(
      `/curation/${biosampleId}/snv/summary`,
    );
    const { data } = resp;
    return { min: data.minScore, max: data.maxScore, mid: data.avgScore };
  }

  async function getCuratedSampleSomaticSnvs(
    biosampleId: string,
    filters: IGetSomaticSnvFilters,
    page = 1,
    limit = 100,
  ): Promise<ISomaticSnv[]> {
    const resp = await instance.post<ISomaticSnv[]>(
      `/curation/${biosampleId}/snv`,
      {
        ...filters,
        limit,
        page,
      },
    );

    return resp.data;
  }

  async function getCuratedSampleSomaticSnvByVariantId(
    biosampleId: string,
    variantId: string,
  ): Promise<ISomaticSnv> {
    const resp = await instance.get<ISomaticSnv>(
      `/curation/${biosampleId}/snv/${variantId}`,
    );

    return resp.data;
  }

  async function getCuratedSampleSomaticSnvsCount(
    biosampleId: string,
    filters: IGetSomaticSnvFilters,
  ): Promise<number> {
    const resp = await instance.post<number>(
      `/curation/${biosampleId}/snv/count`,
      {
        ...filters,
      },
    );

    return resp.data;
  }

  async function getSeenInByVariantId(
    biosampleId: string,
    variantId: string,
    inGermline = false,
    page = 1,
    limit = 20,
  ): Promise<VariantSeenInBiosample[]> {
    const resp = await instance.get<VariantSeenInBiosample[]>(
      `/curation/${biosampleId}/snv/${variantId}/seen-in`,
      {
        params: {
          inGermline,
          page,
          limit,
        },
      },
    );

    return resp.data;
  }

  async function getReportableSampleSomaticSnvs(
    biosampleId: string,
    signal?: AbortSignal,
  ): Promise<ISomaticSnv[]> {
    const resp = await instance.post<ISomaticSnv[]>(
      `/curation/${biosampleId}/snv`,
      {
        reportable: true,
        vcf: true,
      },
      {
        signal,
      },
    );

    return resp.data;
  }

  async function updateCuratedSampleSomaticSnvById(
    data: IUpdateCuratedSampleSomaticSNVsByIdBody,
    biosampleId: string,
    snvId: number,
  ): Promise<number> {
    const resp = await instance.put<number>(
      `/curation/${biosampleId}/snv/${snvId}`,
      data,
    );

    return resp.data;
  }

  async function clearSnvsPathclass(biosampleId: string): Promise<number> {
    const resp = await instance.put<number>(`/curation/${biosampleId}/snv/pathclass`);

    return resp.data;
  }

  function mapSnvFilters({
    chromosome,
    genename,
    genesearchquery,
    classpath,
    consequence,
    vcf,
    gnomad,
    vaf,
    platform,
    reads,
    biallelic,
    loh,
    unfiltered,
    reportable,
    sortColumns,
    sortDirections,
  }: ISNVSearchOptions): IGetSomaticSnvFilters {
    const filters: IGetSomaticSnvFilters = {};

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

    if (loh) filters.loh = true;

    if (vcf) filters.vcf = true;

    if (platform) filters.platform = platform.map((plat) => plat);

    if (biallelic) filters.biallelic = true;

    if (reportable) filters.reportable = true;

    if (sortColumns && sortColumns.length > 0) {
      filters.sortColumns = sortColumns;
      filters.sortDirections = sortDirections;
    }

    return filters;
  }

  return {
    getCuratedSampleSomaticSnvHeliumSummary,
    getCuratedSampleSomaticSnvs,
    getCuratedSampleSomaticSnvByVariantId,
    getCuratedSampleSomaticSnvsCount,
    getSeenInByVariantId,
    getReportableSampleSomaticSnvs,
    updateCuratedSampleSomaticSnvById,
    clearSnvsPathclass,
    mapSnvFilters,
  };
}
