import { AxiosInstance, AxiosResponse } from 'axios';
import { Chromosome, IGene, IResponseBody } from '../../../types/Common.types';
import { IGetDrugHitsPlotsFilters, IHTSCulturePlots, IHTSDrugHitsPlots } from '../../../types/HTS.types';
import {
  CircosPlots,
  IMethGenePlot,
  IPlot,
  IRNASeqGenePlot,
  IRNASeqHMPlots,
  LinxPlot,
  MethPlots,
  MutSigPlots,
  Plot,
  QCPlots,
} from '../../../types/Plot.types';

export interface IPlotsClient {
  getLinxPlots(biosampleId: string): Promise<LinxPlot[]>;
  generateLinxPlot(biosampleId: string, genes: IGene[], chr?: Chromosome): Promise<IResponseBody>;
  deleteLinxPlot(
    biosampleId: string,
    fileId: string,
  ): Promise<string>;

  getQCPlots(biosampleId: string): Promise<QCPlots>;
  getCircosPlots(biosampleId: string): Promise<CircosPlots>;

  getMutSigPlots(biosampleId: string): Promise<MutSigPlots>;

  getMethPlots(biosampleId: string): Promise<MethPlots>;
  updateMGMTPlot(
    file: File,
    biosampleId: string
  ): Promise<void>;

  getMethGenePlot(methId: string, gene: string): Promise<string>;

  getRNASeqGenePlot(biosampleId: string, gene: number): Promise<string>;
  postRNASeqGenePlot(
    formData: Blob,
    biosampleId: string,
    geneId: number
  ): Promise<AxiosResponse<Plot>>;

  getRNASeqClassifierPlots(biosampleId: string): Promise<IRNASeqHMPlots>;

  getFusionPlot(biosampleId: string, startGene: string, endGene: string): Promise<IPlot>;

  getHTSCulturePlots(biosampleId: string): Promise<IHTSCulturePlots>;
  getHTSHitsPlots(
    biosampleId: string,
    drugId: string,
    filters?: IGetDrugHitsPlotsFilters,
  ): Promise<IHTSDrugHitsPlots>;
}

export function createPlotsClient(
  instance: AxiosInstance,
): IPlotsClient {
  // LINX PLOTS
  async function getLinxPlots(biosampleId: string): Promise<LinxPlot[]> {
    const resp = await instance.get<LinxPlot[]>(`plot/${biosampleId}/linx`);
    return resp.data;
  }

  async function generateLinxPlot(
    biosampleId: string,
    genes: IGene[],
    chr?: Chromosome,
  ): Promise<IResponseBody> {
    const resp = await instance.post<IResponseBody>(
      `plot/${biosampleId}/linx/generate`,
      {
        chr,
        genes,
      },
    );

    return resp.data;
  }

  async function deleteLinxPlot(
    biosampleId: string,
    fileId: string,
  ): Promise<string> {
    const resp = await instance.delete<string>(`plot/${biosampleId}/linx/delete/${fileId}`);

    return resp.data;
  }

  // QC PLOTS
  async function getQCPlots(biosampleId: string): Promise<QCPlots> {
    const resp = await instance.get<QCPlots>(
      `plot/${biosampleId}/qc`,
    );

    return resp.data;
  }

  // CIRCOS PLOTS
  async function getCircosPlots(biosampleId: string): Promise<CircosPlots> {
    const resp = await instance.get<CircosPlots>(
      `plot/${biosampleId}/circos`,
    );

    return resp.data;
  }

  // MUTSIG PLOTS
  async function getMutSigPlots(biosampleId: string): Promise<MutSigPlots> {
    const resp = await instance.get<MutSigPlots>(
      `plot/${biosampleId}/mutsig`,
    );

    return resp.data;
  }

  // METH PLOTS
  async function getMethPlots(
    biosampleId: string,
  ): Promise<MethPlots> {
    try {
      const resp = await instance.get<MethPlots>(
        `plot/${biosampleId}/meth`,
      );
      return resp.data;
    } catch (error) {
      return {
        cnProfile: '',
        methProfile: '',
        mgmt: '',
      };
    }
  }

  // METH GENE PLOTS
  async function getMethGenePlot(
    methSampleId: string,
    gene: string,
  ): Promise<string> {
    try {
      const resp = await instance.get<IMethGenePlot>(
        `plot/${methSampleId}/meth/${gene}`,
      );
      return resp.data.plotURL;
    } catch (error) {
      return '';
    }
  }

  // RNASEQ PLOTS
  async function getRNASeqGenePlot(
    biosampleId: string,
    geneId: number,
  ): Promise<string> {
    try {
      const resp = await instance.get<IRNASeqGenePlot>(
        `plot/${biosampleId}/rna/${geneId}`,
      );
      return resp.data.plotURL;
    } catch (error) {
      return '';
    }
  }

  async function postRNASeqGenePlot(
    file: File,
    biosampleId: string,
    geneId: number,
  ): Promise<AxiosResponse<Plot>> {
    const formData = new FormData();
    formData.append('file', file);
    const resp = await instance.post(
      `plot/${biosampleId}/rna/${geneId}`,
      formData,
      {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return resp;
  }

  async function getFusionPlot(
    rnaseqId: string,
    startGene: string,
    endGene: string,
  ): Promise<IPlot> {
    try {
      const resp = await instance.get<IPlot>(
        `plot/${rnaseqId}/rna/fusion/${startGene}/${endGene}`,
      );
      return resp.data;
    } catch (error) {
      return { fileId: '', plotURL: '' };
    }
  }

  async function updateMGMTPlot(
    file: File,
    biosampleId: string,
  ): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    await instance.post(
      `plot/${biosampleId}/mgmt`,
      formData,
      {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  }

  async function getRNASeqClassifierPlots(
    biosampleId: string,
  ): Promise<IRNASeqHMPlots> {
    const resp = await instance.get<IRNASeqHMPlots>(
      `plot/${biosampleId}/rna`,
    );
    return resp.data;
  }

  async function getHTSCulturePlots(biosampleId: string): Promise<IHTSCulturePlots> {
    const resp = await instance.get<IHTSCulturePlots>(`plot/${biosampleId}/hts`);
    return resp.data;
  }

  async function getHTSHitsPlots(
    biosampleId: string,
    drugId: string,
    filters?: IGetDrugHitsPlotsFilters,
  ): Promise<IHTSDrugHitsPlots> {
    const resp = await instance.get<IHTSDrugHitsPlots>(`plot/${biosampleId}/hts/${drugId}`, {
      params: filters,
    });
    return resp.data;
  }

  return {
    getLinxPlots,
    generateLinxPlot,
    deleteLinxPlot,

    getQCPlots,
    getCircosPlots,

    getMutSigPlots,

    getMethPlots,
    updateMGMTPlot,
    getMethGenePlot,

    getRNASeqGenePlot,
    postRNASeqGenePlot,

    getFusionPlot,

    getRNASeqClassifierPlots,

    getHTSCulturePlots,
    getHTSHitsPlots,
  };
}
