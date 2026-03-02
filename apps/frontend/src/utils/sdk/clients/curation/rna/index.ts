import { AxiosInstance } from 'axios';
import { ISummary } from '../../../../../types/Common.types';
import {
  IGenerateRNAPlotBody,
  IRNAClassifierResultFilters,
  IRNAClassifierTable,
  IRNATSNEData,
  ISomaticRna,
  ITPMData,
  IUpdateRnaSeqBody,
} from '../../../../../types/RNAseq.types';
import { IRNASeqSearchOptions } from '../../../../../types/Search.types';
import type { IClassifierVersionFilters, IClassifierVersion, UpdateClassifierVersion } from '@/types/Classifiers.types';

export interface IGetRNASeqFilters {
  chromosome?: string[];
  gene?: string[];
  geneExpression?: string[];
  search?: string;
  foldChange?: string[];
  zScore?: string[];
  tpm?: string[];
  fpkm?: string[];
  reportable?: boolean;
  sortColumns?: string[];
  sortDirections?: string[];
  defaultFilter?: boolean;
}

export interface IRnaClient {
  getRnaSampleSummary(biosampleId: string): Promise<ISummary>;
  getRnaSeqData(
    biosampleId: string,
    page: number,
    limit: number,
    filters: IGetRNASeqFilters,
  ): Promise<ISomaticRna[]>;
  getRnaSeqDataByGeneId(
    biosampleId: string,
    geneId: string | number,
    outlier?: boolean,
    signal?: AbortSignal,
  ): Promise<ISomaticRna>;
  getRnaSeqDataCount(biosampleId: string, filters: IGetRNASeqFilters): Promise<number>;
  getReportableRnaSeqData(biosampleId: string): Promise<ISomaticRna[]>;
  getRNASeqGeneTPM(
    biosampleId: string,
    geneId: number,
  ): Promise<ITPMData[]>;
  getRNATSNEData(biosampleId: string): Promise<IRNATSNEData[]>;
  mapRNASeqFilters(filters: IRNASeqSearchOptions): IGetRNASeqFilters;
  updateRnaSeq(
    data: IUpdateRnaSeqBody,
    biosampleId: string,
    geneId: number
  ): Promise<void>;
  generateTPMPlot(body: IGenerateRNAPlotBody): Promise<Blob>;
  getRNAClassifierData(
    biosampleId: string,
    filters?: IRNAClassifierResultFilters,
    signal?: AbortSignal,
  ): Promise<IRNAClassifierTable[]>;
  regenerateTPMPlots(
    biosampleId: string,
    subcat2: string
  ): Promise<void>;
  updateSelectedPrediction(
    data: Partial<IRNAClassifierTable>,
    biosampleId: string,
  ): Promise<void>;
  updateRNAClassifierByClassifier(
    data: Partial<IRNAClassifierTable>,
    biosampleId: string,
    classifier: string,
    version: string,
    prediction: string,
  ): Promise<void>;
  getClassifiers(query?: IClassifierVersionFilters): Promise<IClassifierVersion[]>;
  updateClassifier(
    classifierId: string,
    data: UpdateClassifierVersion
  ): Promise<void>;
}

export function createRnaClient(instance: AxiosInstance): IRnaClient {
  async function getRnaSampleSummary(biosampleId: string): Promise<ISummary> {
    const resp = await instance.get<ISummary>(`/curation/${biosampleId}/rna/summary`);
    return resp.data;
  }
  async function getRnaSeqData(
    biosampleId: string,
    page: number,
    limit: number,
    filters: IGetRNASeqFilters,
  ): Promise<ISomaticRna[]> {
    const resp = await instance.post<ISomaticRna[]>(`/curation/${biosampleId}/rna`, {
      ...filters,
      page,
      limit,
    });

    return resp.data;
  }

  async function getRnaSeqDataByGeneId(
    biosampleId: string,
    geneId: number | string,
    outlier?: boolean,
    signal?: AbortSignal,
  ): Promise<ISomaticRna> {
    const resp = await instance.get<ISomaticRna>(
      `/curation/${biosampleId}/rna/${geneId}`,
      {
        params: {
          outlier,
        },
        signal,
      },
    );

    return resp.data;
  }

  async function getRNASeqGeneTPM(
    biosampleId: string,
    geneId: number,
  ): Promise<ITPMData[]> {
    const resp = await instance.get<ITPMData[]>(
      `/curation/${biosampleId}/rna/tpm/${geneId}`,
    );

    return resp.data;
  }

  async function getRnaSeqDataCount(
    biosampleId: string,
    filters: IGetRNASeqFilters,
  ): Promise<number> {
    const resp = await instance.post<number>(`/curation/${biosampleId}/rna/count`, {
      ...filters,
    });

    return resp.data;
  }

  async function getReportableRnaSeqData(
    biosampleId: string,
  ): Promise<ISomaticRna[]> {
    const resp = await instance.post<ISomaticRna[]>(
      `/curation/${biosampleId}/rna`,
      {
        reportable: true,
      },
    );
    return resp.data;
  }

  async function getRNATSNEData(biosampleId: string): Promise<IRNATSNEData[]> {
    const resp = await instance.get<IRNATSNEData[]>(`/curation/${biosampleId}/rna/tsne`);
    return resp.data;
  }

  async function updateRnaSeq(
    data: IUpdateRnaSeqBody,
    biosampleId: string,
    geneId: number,
  ): Promise<void> {
    return instance.put(`/curation/${biosampleId}/rna/${geneId}`, data);
  }

  async function getRNAClassifierData(
    biosampleId: string,
    filters?: IRNAClassifierResultFilters,
    signal?: AbortSignal,
  ): Promise<IRNAClassifierTable[]> {
    const resp = await instance.post<IRNAClassifierTable[]>(
      `/curation/${biosampleId}/rna/classifier`,
      filters,
      {
        signal,
      },
    );
    return resp.data;
  }

  async function updateSelectedPrediction(
    data: Partial<IRNAClassifierTable>,
    biosampleId: string,
  ): Promise<void> {
    return instance.put(
      `/curation/${biosampleId}/rna/classifier/promote`,
      data,
    );
  }

  async function updateRNAClassifierByClassifier(
    data: Partial<IRNAClassifierTable>,
    biosampleId: string,
    classifier: string,
    version: string,
    prediction: string,
  ): Promise<void> {
    await instance.put(
      `/curation/${biosampleId}/rna/classifier/${classifier}/${version}`,
      data,
      {
        params: {
          prediction: encodeURIComponent(prediction),
        },
      },
    );
  }

  function mapRNASeqFilters({
    chromosome,
    genename,
    genesearchquery,
    geneExpression,
    foldChange,
    zScore,
    tpm,
    fpkm,
    reportable,
    sortColumns,
    sortDirections,
  }: IRNASeqSearchOptions): IGetRNASeqFilters {
    const filters: IGetRNASeqFilters = {};

    if (chromosome) filters.chromosome = chromosome.map((chr) => chr);

    if (genename) filters.gene = genename.map((g) => g.gene);

    if (geneExpression && geneExpression.length > 0) filters.geneExpression = geneExpression;

    if (genesearchquery) filters.search = genesearchquery;

    if (foldChange.min > foldChange.defaults[0] || foldChange.max < foldChange.defaults[1]) {
      filters.foldChange = [foldChange.min.toString(), foldChange.max.toString()];
    }

    if (zScore.min > zScore.defaults[0] || zScore.max < zScore.defaults[1]) {
      filters.zScore = [zScore.min.toString(), zScore.max.toString()];
    }

    if (tpm.min > tpm.defaults[0] || tpm.max < tpm.defaults[1]) {
      filters.tpm = [tpm.min.toString(), tpm.max.toString()];
    }

    if (fpkm.min > fpkm.defaults[0] || fpkm.max < fpkm.defaults[1]) {
      filters.fpkm = [fpkm.min.toString(), fpkm.max.toString()];
    }

    if (reportable) filters.reportable = reportable;

    if (sortColumns && sortColumns.length > 0) {
      filters.sortColumns = sortColumns;
      filters.sortDirections = sortDirections;
    }

    return filters;
  }

  async function generateTPMPlot(body: IGenerateRNAPlotBody): Promise<Blob> {
    const plot = await instance.get<Blob>('/rna-plot', {
      params: {
        ...body,
      },
      responseType: 'blob',
    });

    return plot.data;
  }

  async function regenerateTPMPlots(
    biosampleId: string,
    subcat2: string,
  ): Promise<void> {
    await instance.put(
      `/curation/${biosampleId}/rna/regenerate`,
      {
        subcat2,
      },
    );
  }

  async function getClassifiers(
    query?: IClassifierVersionFilters,
  ): Promise<IClassifierVersion[]> {
    const resp = await instance.get<IClassifierVersion[]>(
      '/rna-classifiers',
      {
        params: query,
      },
    );

    return resp.data;
  }

  async function updateClassifier(
    classifierId: string,
    data: UpdateClassifierVersion,
  ): Promise<void> {
    await instance.patch(
      `/rna-classifiers/${classifierId}`,
      data,
    );
  }

  return {
    getRnaSampleSummary,
    getRnaSeqData,
    getRnaSeqDataByGeneId,
    getRNASeqGeneTPM,
    getRnaSeqDataCount,
    getReportableRnaSeqData,
    getRNATSNEData,
    mapRNASeqFilters,
    updateRnaSeq,
    generateTPMPlot,
    regenerateTPMPlots,
    getRNAClassifierData,
    updateSelectedPrediction,
    updateRNAClassifierByClassifier,
    getClassifiers,
    updateClassifier,
  };
}
