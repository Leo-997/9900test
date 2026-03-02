import { useSnackbar } from 'notistack';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
} from 'react';
import { IGermlineCNV, ISomaticCNV } from '../types/CNV.types';
import { IArmCNSummary, IParsedCytogeneticsData, ISampleCytoband } from '../types/Cytogenetics.types';
import { IDetailedHTSResult } from '../types/HTS.types';
import { IMethylationData, IMethylationGeneData, IMethylationPredictionData } from '../types/Methylation.types';
import { ISignatureData } from '../types/MutationalSignatures.types';
import { IRNAClassifierTable, ISomaticRna } from '../types/RNAseq.types';
import { IReportableGermlineSNV, ISomaticSnv } from '../types/SNV.types';
import { IGermlineSV, ISomaticSV } from '../types/SV.types';
import { parseCytoData } from '../utils/functions/parseCytoData';
import { isClassified } from '../utils/functions/reportable/isClassified';
import { useAnalysisSet } from './AnalysisSetContext';
import { useZeroDashSdk } from './ZeroDashSdkContext';

interface IProps {
  children: ReactNode;
}

interface ISummaryData {
  loading: boolean;
  snvs?: ISomaticSnv[];
  cnvs?: ISomaticCNV[];
  svs?: ISomaticSV[];
  rna?: ISomaticRna[];
  armCnvs?: IParsedCytogeneticsData[];
  reportableCytobands?: ISampleCytoband[];
  targetableCytobands?: ISampleCytoband[];
  armCnSummary: IArmCNSummary;
  germlineArmCnvs?: IParsedCytogeneticsData[];
  reportableGermlineBands?: ISampleCytoband[];
  targetableGermlineBands?: ISampleCytoband[];
  germlineArmCnSummary: IArmCNSummary;
  germlineSnvs?: IReportableGermlineSNV[];
  germlineSvs?: IGermlineSV[];
  germlineCnvs?: IGermlineCNV[];
  classifiers?: IMethylationData[];
  rnaClassifiers?: IRNAClassifierTable[];
  methGenes?: IMethylationGeneData[];
  methPrediction?: IMethylationPredictionData | null;
  setMethPrediction?: Dispatch<SetStateAction<IMethylationPredictionData | null | undefined>>;
  mutsig?: ISignatureData[];
  htsResults?: IDetailedHTSResult[];
}

// NOTE:
// All references to 'methPrediction' have been left on this context,
// even though it is not currently being used in the Meth Summary,
// just in case Curators want to use it again in the future

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SummaryDataContext = createContext<ISummaryData>({} as ISummaryData);
SummaryDataContext.displayName = 'SummaryDataContext';

export const useSummaryData = (): ISummaryData => useContext(SummaryDataContext);

export function SummaryDataProvider({ children }: IProps): JSX.Element {
  const {
    tumourBiosample, methBiosample, germlineBiosample, rnaBiosample, htsBiosamples,
  } = useAnalysisSet();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState<boolean>(true);
  const [snvs, setSnvs] = useState<ISomaticSnv[]>();
  const [cnvs, setCnvs] = useState<ISomaticCNV[]>();
  const [svs, setSvs] = useState<ISomaticSV[]>();
  const [rna, setRna] = useState<ISomaticRna[]>();
  const [armCnvs, setArmCnvs] = useState<IParsedCytogeneticsData[]>();
  const [reportableCytobands, setReportableCytobands] = useState<ISampleCytoband[]>([]);
  const [targetableCytobands, setTargetableCytobands] = useState<ISampleCytoband[]>([]);
  const [armCnSummary, setArmCnSummary] = useState<IArmCNSummary>({
    p: { min: 0, max: 0 },
    q: { min: 0, max: 0 },
  });
  const [germlineSnvs, setGermlineSnvs] = useState<IReportableGermlineSNV[]>();
  const [germlineCnvs, setGermlineCnvs] = useState<IGermlineCNV[]>();
  const [germlineSvs, setGermlineSvs] = useState<IGermlineSV[]>();
  const [germlineArmCnvs, setGermlineArmCnvs] = useState<IParsedCytogeneticsData[]>();
  const [reportableGermlineBands, setReportableGermlineBands] = useState<ISampleCytoband[]>([]);
  const [targetableGermlineBands, setTargetableGermlineBands] = useState<ISampleCytoband[]>([]);
  const [germlineArmCnSummary, setGermlineArmCnSummary] = useState<IArmCNSummary>({
    p: { min: 0, max: 0 },
    q: { min: 0, max: 0 },
  });
  const [classifiers, setClassifiers] = useState<IMethylationData[]>();
  const [rnaClassifiers, setRNAClassifiers] = useState<IRNAClassifierTable[]>();
  const [methGenes, setMethGenes] = useState<IMethylationGeneData[]>();
  const [methPrediction, setMethPrediction] = useState<IMethylationPredictionData | null>();
  const [mutsig, setMutsig] = useState<ISignatureData[]>();
  const [htsResults, setHTSResults] = useState<IDetailedHTSResult[]>();

  const isCytoReportable = (
    data: IParsedCytogeneticsData,
    cytobands: ISampleCytoband[],
  ): boolean => isClassified(data.p) || isClassified(data.q)
        || cytobands.filter((cyto) => cyto.chr === data.chr).length > 0;

  useEffect(() => {
    if (tumourBiosample?.biosampleId) {
      zeroDashSdk.snv.somatic.getReportableSampleSomaticSnvs(
        tumourBiosample.biosampleId,
      ).then((res) => {
        setSnvs(res);
      });
    } else {
      setSnvs([]);
    }
  }, [tumourBiosample?.biosampleId, zeroDashSdk]);

  useEffect(() => {
    if (tumourBiosample?.biosampleId) {
      zeroDashSdk.cnv.somatic.getReportableSampleSomaticCnvs(
        tumourBiosample.biosampleId,
      ).then((data) => {
        setCnvs(data);
      });
    } else {
      setCnvs([]);
    }
  }, [zeroDashSdk, tumourBiosample?.biosampleId]);

  useEffect(() => {
    if (tumourBiosample?.biosampleId) {
      zeroDashSdk.sv.somatic.getReportableSVs(
        tumourBiosample.biosampleId,
      ).then((res) => {
        setSvs(res);
      });
    } else {
      setSvs([]);
    }
  }, [tumourBiosample?.biosampleId, zeroDashSdk]);

  useEffect(() => {
    if (rnaBiosample?.biosampleId) {
      zeroDashSdk.rna.getReportableRnaSeqData(
        rnaBiosample.biosampleId,
      ).then((res) => {
        setRna(res);
      });
    } else {
      setRna([]);
    }
  }, [rnaBiosample?.biosampleId, zeroDashSdk]);

  useEffect(() => {
    async function fetchData(): Promise<void> {
      if (rnaBiosample?.biosampleId) {
        try {
          const resp = await zeroDashSdk.rna.getRNAClassifierData(
            rnaBiosample.biosampleId,
            { reportable: true },
          );

          setRNAClassifiers(resp);
        } catch (err) {
          enqueueSnackbar('There was an issue fetching the data', { variant: 'error' });
        }
      } else {
        setRNAClassifiers([]);
      }
    }
    fetchData();
  }, [rnaBiosample?.biosampleId, zeroDashSdk.rna, enqueueSnackbar]);

  useEffect(() => {
    if (tumourBiosample?.biosampleId) {
      zeroDashSdk.cytogenetics.somatic.getCytogeneticsData(
        tumourBiosample.biosampleId,
      ).then((res) => {
        zeroDashSdk.cytogenetics.somatic.getAnnotations(
          tumourBiosample.biosampleId,
        ).then(async (genesData) => {
          const reportableCytos = await zeroDashSdk.cytogenetics.somatic.getCytobands(
            tumourBiosample.biosampleId,
            {
              reportable: true,
            },
          );
          setReportableCytobands(reportableCytos);
          const targetableCytos = await zeroDashSdk.cytogenetics.somatic.getCytobands(
            tumourBiosample?.biosampleId,
            {
              targetable: true,
            },
          );
          setTargetableCytobands(targetableCytos);

          const parsedData = parseCytoData(res, genesData);
          setArmCnSummary({
            p: {
              min: Math.min(...parsedData.map((d) => d.p.avgCN)),
              max: Math.max(...parsedData.map((d) => d.p.avgCN)),
            },
            q: {
              min: Math.min(...parsedData.map((d) => d.q.avgCN)),
              max: Math.max(...parsedData.map((d) => d.q.avgCN)),
            },
          });
          const filteredParsedData = parsedData.filter(
            (cyto) => isCytoReportable(cyto, reportableCytos),
          );
          setArmCnvs(filteredParsedData);
        });
      });
    } else {
      setArmCnvs([]);
    }
  }, [zeroDashSdk.cytogenetics, tumourBiosample?.biosampleId]);

  useEffect(() => {
    if (germlineBiosample?.biosampleId) {
      zeroDashSdk.snv.germline.getReportableSampleGermlineSnvs(
        germlineBiosample.biosampleId,
      ).then((res) => {
        setGermlineSnvs(res);
      });
    } else {
      setGermlineSnvs([]);
    }
  }, [
    germlineBiosample?.biosampleId,
    zeroDashSdk.snv.germline,
  ]);

  useEffect(() => {
    if (germlineBiosample?.biosampleId) {
      zeroDashSdk.cnv.germline.getAllReportableGermlineCnv(
        germlineBiosample.biosampleId,
      ).then((res) => {
        setGermlineCnvs(res);
      });
    } else {
      setGermlineCnvs([]);
    }
  }, [
    germlineBiosample?.biosampleId,
    zeroDashSdk.cnv.germline,
  ]);

  useEffect(() => {
    if (germlineBiosample?.biosampleId) {
      zeroDashSdk.sv.germline.getReportableGermlineSVs(
        germlineBiosample.biosampleId,
      ).then((res) => {
        setGermlineSvs(res);
      });
    } else {
      setGermlineSvs([]);
    }
  }, [
    germlineBiosample?.biosampleId,
    zeroDashSdk.sv.germline,
  ]);

  useEffect(() => {
    if (methBiosample?.biosampleId) {
      zeroDashSdk.methylation.getMethylationData(
        methBiosample.biosampleId,
        { isClassified: true },
      ).then((res) => {
        setClassifiers(res.filter((r) => r.reportable || r.classification === 'Not Reportable - Display').map((r) => ({
          ...r,
          methId: methBiosample?.aliases.find((a) => a.aliasType === 'methylation')?.alias || '',
          class: r.groupName
            ? r.groupName.replace(/([Mm]ethylation class )/, '')
            : '-',
        })));
      });
    } else {
      setClassifiers([]);
    }
  }, [
    methBiosample?.aliases,
    methBiosample?.biosampleId,
    zeroDashSdk.methylation,
  ]);

  const getGenePlot = useCallback(async (m: IMethylationGeneData): Promise<string> => {
    if (m.gene && methBiosample?.biosampleId) {
      try {
        const resp = await zeroDashSdk.plots.getMethGenePlot(
          methBiosample.biosampleId,
          m.gene,
        );
        return resp;
      } catch (err) {
        enqueueSnackbar('There was an issue loading the methylation plots.', { variant: 'error' });
      }
    }
    return '';
  }, [methBiosample?.biosampleId, enqueueSnackbar, zeroDashSdk.plots]);

  const processMethGeneResp = useCallback(async (
    data: IMethylationGeneData[],
  ): Promise<Record<string, string>> => {
    const genePlotMap: Record<string, string> = {};
    await Promise.all(data.map(async (m) => {
      const plotUrl = await getGenePlot(m);
      genePlotMap[m.gene] = plotUrl;
    }));
    return genePlotMap;
  }, [getGenePlot]);

  useEffect(() => {
    async function fetchData(): Promise<void> {
      if (methBiosample?.biosampleId) {
        try {
          const methGeneResp = await zeroDashSdk.methylation.getMethylationGeneData(
            methBiosample?.biosampleId,
            { reportable: true },
          );

          // Add MGMT gene even if it is not reportable,
          // as MGMT list item needs to be shown in Meth Summary
          if (!methGeneResp.filter((g) => g.gene.toUpperCase() === 'MGMT').length) {
            const res = await zeroDashSdk.methylation.getMethylationGeneData(
              methBiosample?.biosampleId,
            );
            const mgmt = res.find((g) => g.gene.toUpperCase() === 'MGMT');
            if (mgmt) methGeneResp.push(mgmt);
          }

          const genePlotMap = await processMethGeneResp(methGeneResp);
          setMethGenes(
            methGeneResp.map((m) => ({
              ...m,
              methId: methBiosample?.aliases.find((a) => a.aliasType === 'methylation')?.alias || '',
              methSampleId: methBiosample?.biosampleId,
              status: m.status || 'unknown',
              genePlot: genePlotMap[m.gene],
            })),
          );
        } catch (err) {
          enqueueSnackbar('There was an issue fetching the data', { variant: 'error' });
        }
      } else {
        setMethGenes([]);
      }
    }
    fetchData();
  }, [
    methBiosample?.aliases,
    methBiosample?.biosampleId,
    zeroDashSdk.methylation,
    zeroDashSdk.plots,
    enqueueSnackbar,
    processMethGeneResp,
  ]);

  useEffect(() => {
    if (methBiosample?.biosampleId) {
      zeroDashSdk.methylation.getMethylationPrediction(
        methBiosample?.biosampleId,
      ).then((res) => {
        setMethPrediction(res);
        zeroDashSdk.plots.getMethPlots(methBiosample?.biosampleId)
          .then((plots) => {
            const methPred: IMethylationPredictionData = {
              ...res,
              methId: methBiosample?.aliases.find((a) => a.aliasType === 'methylation')?.alias || '',
              plotUrl: plots.mgmt,
            };
            setMethPrediction(methPred);
          });
      })
        .catch(() => {
          setMethPrediction(null);
        });
    } else {
      setMethPrediction(null);
    }
  }, [
    methBiosample?.biosampleId,
    zeroDashSdk,
    methBiosample?.aliases,
  ]);

  useEffect(() => {
    if (tumourBiosample?.biosampleId) {
      zeroDashSdk.mutsig.getReportableSignatures(
        tumourBiosample?.biosampleId,
      ).then((res) => {
        setMutsig(res);
      });
    } else {
      setMutsig([]);
    }
  }, [tumourBiosample?.biosampleId, zeroDashSdk]);

  useEffect(() => {
    async function getReportableHTSResults(): Promise<void> {
      if (htsBiosamples) {
        const results = await Promise.all(htsBiosamples.map((biosample) => (
          zeroDashSdk.hts.getHTSResults(
            biosample.biosampleId,
            { reportable: true },
          )
        ))).then((res) => res.flat());
        const screens = results.length > 0
          ? await zeroDashSdk.services.drugs.getDrugScreens({
            ids: results.map((result) => result.screenId),
          })
          : [];
        const drugs = screens.length > 0
          ? await zeroDashSdk.services.drugs.getDrugs({
            ids: screens.map((screen) => screen.drugId),
          }, 1, 10)
          : [];
        setHTSResults(results.map((result) => {
          const screen = screens.find((s) => s.id === result.screenId);
          const drug = drugs.find((d) => d.id === screen?.drugId);
          return {
            ...result,
            compoundId: drug?.internalId,
            drugId: drug?.id || result.screenId,
            drugName: drug?.name,
            targets: screen?.targets,
            classes: screen?.classes,
          };
        }));
      } else {
        setHTSResults([]);
      }
    }
    getReportableHTSResults();
  }, [
    htsBiosamples,
    zeroDashSdk.services.drugs,
    zeroDashSdk.hts,
  ]);

  useEffect(() => {
    if (germlineBiosample?.biosampleId) {
      zeroDashSdk.cytogenetics.germline.getCytogeneticsData(
        germlineBiosample.biosampleId,
      ).then(async (res) => {
        const reportableCytos = await zeroDashSdk.cytogenetics.germline.getCytobands(
          germlineBiosample.biosampleId,
          {
            reportable: true,
          },
        );
        setReportableGermlineBands(reportableCytos);
        const targetableCytos = await zeroDashSdk.cytogenetics.germline.getCytobands(
          germlineBiosample?.biosampleId,
          {
            targetable: true,
          },
        );
        setTargetableGermlineBands(targetableCytos);

        const parsedData = parseCytoData(res);
        setGermlineArmCnSummary({
          p: {
            min: Math.min(...parsedData.map((d) => d.p.avgCN)),
            max: Math.max(...parsedData.map((d) => d.p.avgCN)),
          },
          q: {
            min: Math.min(...parsedData.map((d) => d.q.avgCN)),
            max: Math.max(...parsedData.map((d) => d.q.avgCN)),
          },
        });
        const filteredParsedData = parsedData.filter(
          (cyto) => isCytoReportable(cyto, reportableCytos),
        );
        setGermlineArmCnvs(filteredParsedData);
      });
    } else {
      setGermlineArmCnvs([]);
    }
  }, [germlineBiosample?.biosampleId, zeroDashSdk.cytogenetics.germline]);

  useEffect(() => {
    if (
      snvs && cnvs && svs
      && rna && rnaClassifiers
      && armCnvs
      && reportableCytobands && targetableCytobands
      && germlineSnvs && germlineCnvs && germlineSvs
      && germlineArmCnvs
      && reportableGermlineBands && targetableGermlineBands
      && classifiers && methPrediction && methGenes !== undefined
      && mutsig
    ) {
      setLoading(false);
    }
  }, [
    snvs,
    cnvs,
    svs,
    rna,
    rnaClassifiers,
    armCnvs,
    reportableCytobands,
    targetableCytobands,
    germlineSnvs,
    germlineSvs,
    germlineCnvs,
    classifiers,
    methPrediction,
    methGenes,
    mutsig,
    germlineArmCnvs,
    reportableGermlineBands,
    targetableGermlineBands,
  ]);

  const value = useMemo(() => ({
    loading,
    snvs,
    cnvs,
    svs,
    rna,
    rnaClassifiers,
    armCnvs,
    reportableCytobands,
    targetableCytobands,
    armCnSummary,
    germlineArmCnvs,
    reportableGermlineBands,
    targetableGermlineBands,
    germlineArmCnSummary,
    germlineSnvs,
    germlineSvs,
    germlineCnvs,
    classifiers,
    methGenes,
    methPrediction,
    setMethPrediction,
    mutsig,
    htsResults,
  }), [
    armCnSummary,
    armCnvs,
    classifiers,
    methGenes,
    cnvs,
    germlineCnvs,
    germlineSnvs,
    germlineSvs,
    loading,
    methPrediction,
    mutsig,
    htsResults,
    reportableCytobands,
    rna,
    rnaClassifiers,
    snvs,
    svs,
    targetableCytobands,
    germlineArmCnvs,
    reportableGermlineBands,
    targetableGermlineBands,
    germlineArmCnSummary,
  ]);

  return (
    <SummaryDataContext.Provider
      value={value}
    >
      {children}
    </SummaryDataContext.Provider>
  );
}
