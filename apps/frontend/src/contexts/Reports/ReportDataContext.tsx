import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import {
  createContext,
  Dispatch,
  JSX,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { clinicalReportTypes, localStorageKey } from '@/constants/Reports/reports';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IClinicalCommentThread } from '@/types/Comments/ClinicalComments.types';
import {
  IDetailedHTSDrugCombination, IDetailedHTSResult, IHTSCulture,
} from '@/types/HTS.types';
import { IInterpretation } from '@/types/MTB/Interpretations.types';
import { IMolecularAlterationDetail } from '@/types/MTB/MolecularAlteration.types';
import { IClinicalVersionRaw } from '@/types/MTB/MTB.types';
import { IFetchRecommendation } from '@/types/MTB/Recommendation.types';
import { IPurity } from '@/types/Precuration/Purity.types';
import { IImmunoprofile } from '@/types/Precuration/QCMetrics.types';
import { IGeneList } from '@/types/Reports/GeneLists.types';
import { mapGroupName } from '@/utils/functions/mapGroupName';
import { defaultEmptyList } from '../../constants/Curation/genes';
import { IGermlineCNV, ISomaticCNV } from '../../types/CNV.types';
import { ICurationCommentThread } from '../../types/Comments/CurationComments.types';
import { ICytogeneticsData, ISampleCytoband } from '../../types/Cytogenetics.types';
import { IEvidenceLink } from '../../types/Evidence/Evidences.types';
import { IMethylationData, IMethylationGeneData } from '../../types/Methylation.types';
import { IPatient } from '../../types/Patient/Patient.types';
import { IGetReportableVariantData } from '../../types/Reports/ReportableVariants.types';
import { IRNAClassifierTable, IRNASeqReportData } from '../../types/RNAseq.types';
import { GenePanel, IBiomaterial } from '../../types/Samples/Sample.types';
import { IReportableGermlineSNV, ISomaticSnv } from '../../types/SNV.types';
import { IGermlineSV, ISomaticSV } from '../../types/SV.types';
import filterReportableVariants from '../../utils/functions/reports/filterReportableVariants';
import getGeneName from '../../utils/functions/reports/getGeneName';
import { useAnalysisSet } from '../AnalysisSetContext';
import { usePatient } from '../PatientContext';
import { useZeroDashSdk } from '../ZeroDashSdkContext';
import { useReport } from './CurrentReportContext';

interface IProps {
  children: ReactNode;
}

interface IReportData {
  reportAnalysisSet: IAnalysisSet;
  reportPatient: IPatient;
  somaticGenes?: IGeneList | null;
  germlineGenes?: IGeneList | null;
  isPanel: boolean;
  biomaterials?: IBiomaterial[];
  purity?: IPurity;
  immunoprofile?: IImmunoprofile;
  classifiers?: IMethylationData[];
  methGenes?: IMethylationGeneData[];
  reportableVariants: IGetReportableVariantData[];
  rna?: IRNASeqReportData[];
  rnaClassifiers?: IRNAClassifierTable[];
  snvs?: ISomaticSnv[];
  cnvs?: ISomaticCNV[];
  cytogenetics?: ICytogeneticsData[];
  cytobands?: ISampleCytoband[];
  svs?: ISomaticSV[];
  germlineSnvs?: IReportableGermlineSNV[];
  germlineCnvs?: IGermlineCNV[];
  germlineSvs?: IGermlineSV[];
  germlineCytogenetics?: ICytogeneticsData[];
  germlineCytobands?: ISampleCytoband[];
  curationCommentEvidenceLinks: IEvidenceLink[];
  clinicalCommentEvidenceLinks: IEvidenceLink[];
  recommendationEvidenceLinks: IEvidenceLink[];
  reportEvidenceLinks: IEvidenceLink[];
  curationCommentThreads: ICurationCommentThread[];
  getCurationCommentThreads: () => Promise<ICurationCommentThread[]>;
  recommendations: IFetchRecommendation[],
  setRecommendations: Dispatch<SetStateAction<IFetchRecommendation[]>>,
  interpretations: IInterpretation[],
  getInterpretations: () => Promise<void>,
  clinicalCommentThreads: IClinicalCommentThread[],
  getClinicalCommentThreads: () => Promise<IClinicalCommentThread[]>,
  latestClinVersion?: IClinicalVersionRaw;
  culture?: IHTSCulture;
  htsResults?: IDetailedHTSResult[];
  htsCombinations?: IDetailedHTSDrugCombination[];
  isLoading?: boolean;
  reportMolAlterations: IMolecularAlterationDetail[];
  unsavedCommentIds: string[];
  setUnsavedCommentIds: Dispatch<SetStateAction<string[]>>;
  getRecommendations: () => Promise<void>;
  errorLoadingItems: string[];
}

export const ReportDataContext = createContext<IReportData | undefined>(undefined);
ReportDataContext.displayName = 'ReportDataContext';

export const useReportData = (): IReportData => {
  const ctx = useContext(ReportDataContext);
  if (!ctx) {
    throw new Error('Report data context is not available at this scope');
  }

  return ctx;
};

export function ReportDataProvider({
  children,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const {
    reportType,
    selectedReport,
    pendingReport,
    reportMetadata,
    copyPrevReportComments,
    setCopyPrevReportComments,
    approve,
    setIsGeneratingReport,
    isApproving,
    setIsApproving,
  } = useReport();
  const { enqueueSnackbar } = useSnackbar();
  const { patient } = usePatient();
  const {
    analysisSet,
    purity,
    immunoprofile,
    tumourBiosample,
    germlineBiosample,
    rnaBiosample,
    methBiosample,
    htsBiosamples,
    htsCultures,
  } = useAnalysisSet();

  const biomaterials = useMemo<IBiomaterial[]>(() => {
    const bm: Record<string, IBiomaterial> = {};
    for (const biosample of analysisSet.biosamples || []) {
      if (bm[biosample.biomaterialId]) {
        bm[biosample.biomaterialId].assays?.push({
          sampleType: biosample.sampleType,
          biosampleType: biosample.biosampleType,
        });
      } else {
        bm[biosample.biomaterialId] = {
          biomaterialId: biosample.biomaterialId,
          biosampleStatus: biosample.biosampleStatus,
          tissue: biosample.specimen,
          preservation: biosample.specimenState,
          collectionDate: biosample.collectionDate,
          processingDate: biosample.processingDate,
          assays: [
            {
              sampleType: biosample.sampleType,
              biosampleType: biosample.biosampleType,
            },
          ],
        };
      }
    }
    return Object.values(bm);
  }, [analysisSet.biosamples]);

  const [loadingItems, setLoadingItems] = useState<string[]>([]);
  const [errorLoadingItems, setErrorLoadingItems] = useState<string[]>([]);
  const [somaticGenes, setSomaticGenes] = useState<IGeneList | null>();
  const [germlineGenes, setGermlineGenes] = useState<IGeneList | null>();
  const [classifiers, setClassifiers] = useState<IMethylationData[]>([]);
  const [methGenes, setMethGenes] = useState<IMethylationGeneData[]>([]);
  const [reportableVariants, setReportableVariants] = useState<IGetReportableVariantData[]>([]);
  const [rna, setRna] = useState<IRNASeqReportData[]>();
  const [rnaClassifiers, setRnaClassifiers] = useState<IRNAClassifierTable[]>([]);
  const [snvs, setSnvs] = useState<ISomaticSnv[]>();
  const [cnvs, setCnvs] = useState<ISomaticCNV[]>();
  const [cytogenetics, setCytogenetics] = useState<ICytogeneticsData[]>();
  const [cytobands, setCytobands] = useState<ISampleCytoband[]>();
  const [svs, setSvs] = useState<ISomaticSV[]>();
  const [germlineSnvs, setGermlineSnvs] = useState<IReportableGermlineSNV[]>();
  const [germlineCnvs, setGermlineCnvs] = useState<IGermlineCNV[]>();
  const [germlineSvs, setGermlineSvs] = useState<IGermlineSV[]>();
  const [germlineCytogenetics, setGermlineCytogenetics] = useState<ICytogeneticsData[]>();
  const [germlineCytobands, setGermlineCytobands] = useState<ISampleCytoband[]>();
  // Evidence linked to recommendations
  const [
    recommendationEvidenceLinks,
    setRecommendationEvidenceLinks,
  ] = useState<IEvidenceLink[]>([]);
  // Evidence linked to the report directly
  // This is for historical reports created before the above methods were available
  const [
    reportEvidenceLinks,
    setReportEvidenceLinks,
  ] = useState<IEvidenceLink[]>([]);
  // Germline and molecular reports only
  const [
    curationCommentThreads,
    setCurationCommentThreads,
  ] = useState<ICurationCommentThread[]>([]);
  // MTB / Preclinical report only
  const [latestClinVersion, setLatestClinVersion] = useState<IClinicalVersionRaw>();
  const [
    reportMolAlterations,
    setMolReportAlterations,
  ] = useState<IMolecularAlterationDetail[]>([]);
  const [recommendations, setRecommendations] = useState<IFetchRecommendation[]>([]);
  const [interpretations, setInterpretations] = useState<IInterpretation[]>([]);
  const [
    clinicalCommentThreads,
    setClinicalCommentThreads,
  ] = useState<IClinicalCommentThread[]>([]);
  const [culture, setCulture] = useState<IHTSCulture>();
  const [htsResults, setHtsResults] = useState<IDetailedHTSResult[]>();
  const [htsCombinations, setHtsCombinations] = useState<IDetailedHTSDrugCombination[]>();
  // For drafting comments
  const [unsavedCommentIds, setUnsavedCommentIds] = useState<string[]>([]);

  const isPanel = useMemo(() => Boolean(analysisSet.biosamples?.some(
    (biosample) => biosample.sampleType === 'panel',
  )), [analysisSet.biosamples]);

  // Get evidence for Molecular and Germline reports
  const curationCommentEvidenceLinks: IEvidenceLink[] = useMemo(() => {
    if (clinicalReportTypes.includes(reportType)) return [];

    const isThreadUsedInReport = (thread: ICurationCommentThread): boolean => Boolean(
      reportableVariants?.some(
        (v) => v.variantId === thread.entityId && v.variantType === thread.entityType,
      ) || (
        thread.entityType === 'CYTOGENETICS'
        && (
          cytobands?.some(((c) => c.chr === thread.entityId))
          || cytogenetics?.some(((c) => c.chr === thread.entityId))
        )
      ) || (
        thread.entityType
        && thread.entityType === reportType
        && thread.entityId === pendingReport?.id
      ),
    );

    if (reportableVariants && curationCommentThreads) {
      return curationCommentThreads
        .filter((thread) => isThreadUsedInReport(thread))
        .flatMap((thread) => (
          // Ensure the comment is used in the report
          thread.comments?.filter((c) => (
            c.reportOrder
          ) || (
            thread.type === 'GERMLINE'
            && reportType === 'GERMLINE_REPORT'
            && c.type === 'VARIANT_INTERPRETATION'
          ) || (
            thread.entityType === reportType
            && thread.entityId === pendingReport?.id
          )) || []
        ))
        .flatMap((comment) => comment.evidence || []);
    }
    return [];
  }, [
    curationCommentThreads,
    cytobands,
    cytogenetics,
    pendingReport?.id,
    reportType,
    reportableVariants,
  ]);

  // Get evidence for MTB report
  const clinicalCommentEvidenceLinks: IEvidenceLink[] = useMemo(() => {
    if (!clinicalReportTypes.includes(reportType)) return [];

    const interpretationEvidence = interpretations
      .flatMap((interpretation) => interpretation.comments)
      .flatMap((comment) => comment.evidence || []);

    const commentInputEvidence = clinicalCommentThreads
      .filter((thread) => (
        thread.entityType === reportType && thread.entityId === pendingReport?.id
      ))
      .flatMap((thread) => thread.comments)
      .flatMap((comment) => comment?.evidence || []);

    return [...interpretationEvidence, ...commentInputEvidence];
  }, [clinicalCommentThreads, interpretations, pendingReport?.id, reportType]);

  const getPanel = useCallback((aset: IAnalysisSet): GenePanel => {
    if ((
      pendingReport?.type === 'MOLECULAR_REPORT'
      && reportMetadata?.['molecular.hidePanel'] === 'true'
    )) {
      if (aset.genePanel === 'CNS') return 'CNS no panel';
      if (aset.genePanel === 'Neuroblastoma') return 'NBL no panel';
      return 'Hide gene panel';
    }
    if (isPanel) {
      return 'No panel';
    }
    return aset.genePanel;
  }, [isPanel, reportMetadata, pendingReport?.type]);

  const shouldGetStandardPanel = useMemo(() => (
    reportType === 'MOLECULAR_REPORT'
      && !isPanel
      && getPanel(analysisSet) !== 'NBL no panel'
      && getPanel(analysisSet) !== 'CNS no panel'
      && getPanel(analysisSet) !== 'Hide gene panel'
      && getPanel(analysisSet) !== 'No panel'
  ), [analysisSet, getPanel, isPanel, reportType]);

  const getInterpretations = useCallback(async (
    signal?: AbortSignal,
  ): Promise<void> => {
    if (latestClinVersion?.id && (reportType === 'MTB_REPORT' || reportType === 'PRECLINICAL_REPORT')) {
      zeroDashSdk.mtb.interpretations.getInterpretations(
        latestClinVersion.id,
        {
          reportType,
        },
        signal,
      )
        .then(async (resp) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'interpretations'));
          // for every interpretation get the comments and targets
          setInterpretations(
            resp
              .sort((a, b) => (a.order || 0) - (b.order || 0)),
          );
        })
        .catch(() => {
          setInterpretations([]);
          setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'interpretations'])));
          enqueueSnackbar('Cannot fetch interpretations, please try again', { variant: 'error' });
        });
    }
  }, [
    latestClinVersion?.id,
    reportType,
    zeroDashSdk.mtb.interpretations,
    enqueueSnackbar,
  ]);

  const getRecommendations = useCallback(async (
    signal?: AbortSignal,
  ) => {
    if (latestClinVersion?.id) {
      try {
        setErrorLoadingItems((prev) => prev.filter((item) => item !== 'recommendations'));

        const recs = await zeroDashSdk.mtb.recommendation.getAllRecommendations(
          latestClinVersion.id,
          {
            reportType: [reportType],
          },
          undefined,
          undefined,
          signal,
        );

        const getRecOrder = (rec: IFetchRecommendation): number => (
          rec.links?.find((l) => l.entityType === 'REPORT' && l.entityId === reportType)?.order ?? 0
        );
        setRecommendations(recs.sort((a, b) => {
          if (!getRecOrder(a)) return -1;
          if (!getRecOrder(b)) return 1;
          return getRecOrder(a) - getRecOrder(b);
        }));
      } catch {
        setRecommendations([]);
        setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'recommendations'])));
        enqueueSnackbar('Cannot fetch recommendations, please try again', { variant: 'error' });
      }
    }
  }, [
    latestClinVersion?.id,
    zeroDashSdk.mtb.recommendation,
    reportType,
    enqueueSnackbar,
  ]);

  const getCurationCommentThreads = useCallback(async (
    signal?: AbortSignal,
  ): Promise<ICurationCommentThread[]> => (
    zeroDashSdk.curationComments.getCommentThreads(
      {
        analysisSetIds: [analysisSet.analysisSetId],
        threadType: reportType === 'MOLECULAR_REPORT' ? ['MOLECULAR'] : ['GERMLINE'],
        includeComments: true,
      },
      signal,
    )
      .then((resp) => {
        setErrorLoadingItems((prev) => prev.filter((item) => item !== 'curationCommentThreads'));
        setCurationCommentThreads(resp);
        return resp;
      })
      .catch((e) => {
        if ((e as AxiosError).code === 'ERR_CANCELED') return [];
        setCurationCommentThreads([]);
        setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'curationCommentThreads'])));
        enqueueSnackbar('Cannot fetch comments, please try again', { variant: 'error' });
        return [];
      })
  ), [
    analysisSet.analysisSetId,
    reportType,
    zeroDashSdk.curationComments,
    enqueueSnackbar,
  ]);

  const getClinicalCommentThreads = useCallback(async (
    signal?: AbortSignal,
  ): Promise<IClinicalCommentThread[]> => {
    if (latestClinVersion?.id && clinicalReportTypes.includes(reportType)) {
      return zeroDashSdk.mtb.comment.getCommentThreads(
        {
          clinicalVersionId: latestClinVersion.id,
          threadType: ['REPORTS'],
          entityType: [reportType],
          includeComments: true,
        },
        signal,
      )
        .then((resp) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'clinicalCommentThreads'));
          setClinicalCommentThreads(resp);
          return resp;
        })
        .catch(() => {
          setClinicalCommentThreads([]);
          setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'clinicalCommentThreads'])));
          enqueueSnackbar('Cannot fetch comments, please try again', { variant: 'error' });
          return [];
        });
    }
    return [];
  }, [
    enqueueSnackbar,
    latestClinVersion?.id,
    reportType,
    zeroDashSdk.mtb.comment,
    setClinicalCommentThreads,
  ]);

  const value = useMemo(() => ({
    reportPatient: patient,
    reportAnalysisSet: {
      ...analysisSet,
      genePanel: getPanel(analysisSet),
    },
    isPanel,
    somaticGenes,
    germlineGenes,
    biomaterials,
    purity,
    immunoprofile,
    classifiers,
    methGenes,
    reportableVariants,
    rna,
    rnaClassifiers,
    snvs,
    cnvs,
    cytogenetics,
    cytobands,
    svs,
    germlineSnvs,
    germlineCnvs,
    germlineSvs,
    germlineCytogenetics,
    germlineCytobands,
    curationCommentThreads,
    getCurationCommentThreads,
    clinicalCommentThreads,
    getClinicalCommentThreads,
    curationCommentEvidenceLinks,
    clinicalCommentEvidenceLinks,
    recommendationEvidenceLinks,
    reportEvidenceLinks,
    latestClinVersion,
    reportMolAlterations,
    recommendations,
    setRecommendations,
    interpretations,
    getInterpretations,
    culture,
    htsResults,
    htsCombinations,
    isLoading: loadingItems.length > 0,
    unsavedCommentIds,
    setUnsavedCommentIds,
    getRecommendations,
    errorLoadingItems,
  }), [
    patient,
    analysisSet,
    biomaterials,
    purity,
    immunoprofile,
    isPanel,
    classifiers,
    cnvs,
    cytobands,
    cytogenetics,
    errorLoadingItems,
    germlineCnvs,
    germlineGenes,
    germlineSnvs,
    germlineSvs,
    germlineCytogenetics,
    germlineCytobands,
    methGenes,
    reportableVariants,
    rna,
    rnaClassifiers,
    snvs,
    somaticGenes,
    svs,
    loadingItems.length,
    curationCommentThreads,
    getCurationCommentThreads,
    clinicalCommentThreads,
    getClinicalCommentThreads,
    curationCommentEvidenceLinks,
    clinicalCommentEvidenceLinks,
    recommendationEvidenceLinks,
    reportEvidenceLinks,
    latestClinVersion,
    reportMolAlterations,
    recommendations,
    setRecommendations,
    interpretations,
    getInterpretations,
    culture,
    htsResults,
    htsCombinations,
    getPanel,
    unsavedCommentIds,
    setUnsavedCommentIds,
    getRecommendations,
  ]);

  useEffect(() => {
    const controller = new AbortController();

    if (latestClinVersion) {
      setLoadingItems((prev) => [...prev, 'molAlterations']);
      zeroDashSdk.mtb.molAlteration.getMolAlterations(
        latestClinVersion.id,
        {},
        controller.signal,
      )
        .then((resp) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'molAlterations'));
          setMolReportAlterations(resp);
        })
        .catch((e) => {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setMolReportAlterations([]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'molAlterations'])));
            enqueueSnackbar('Cannot fetch molecular alterations data, please try again', { variant: 'error' });
          }
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'molAlterations')));
    }

    return () => {
      controller.abort();
    };
  }, [enqueueSnackbar, latestClinVersion, zeroDashSdk.mtb.molAlteration]);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingItems((prev) => [...prev, 'somaticGeneList']);
    zeroDashSdk.services.reports.getGeneLists(
      {
        genePanel: shouldGetStandardPanel ? analysisSet.genePanel : 'No panel',
        type: 'somatic',
        isHighRisk: !shouldGetStandardPanel,
      },
      undefined,
      undefined,
      controller.signal,
    )
      .then(async (resp) => {
        setErrorLoadingItems((prev) => prev.filter((item) => item !== 'somaticGeneList'));
        if (resp && resp.length > 0 && resp[0].genes?.length) {
          setSomaticGenes(resp[0]);
        } else {
          setSomaticGenes(defaultEmptyList);
        }
      })
      .catch((e) => {
        if ((e as AxiosError).code !== 'ERR_CANCELED') {
          setSomaticGenes(defaultEmptyList);
          setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'somaticGeneList'])));
          enqueueSnackbar('Cannot fetch somatic genes list data, please try again', { variant: 'error' });
        }
      })
      .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'somaticGeneList')));

    return () => {
      controller.abort();
    };
  }, [
    analysisSet?.genePanel,
    enqueueSnackbar,
    isPanel,
    reportType,
    zeroDashSdk.gene,
    zeroDashSdk.services.reports,
    shouldGetStandardPanel,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingItems((prev) => [...prev, 'germlineGeneList']);
    zeroDashSdk.services.reports.getGeneLists(
      {
        genePanel: shouldGetStandardPanel ? analysisSet.genePanel : 'No panel',
        type: 'germline',
        isHighRisk: !shouldGetStandardPanel,
      },
      undefined,
      undefined,
      controller.signal,
    )
      .then(async (resp) => {
        setErrorLoadingItems((prev) => prev.filter((item) => item !== 'germlineGeneList'));
        if (resp && resp.length > 0 && resp[0].genes?.length) {
          setGermlineGenes(resp[0]);
        } else {
          setGermlineGenes(defaultEmptyList);
        }
      })
      .catch((e) => {
        if ((e as AxiosError).code !== 'ERR_CANCELED') {
          setGermlineGenes(defaultEmptyList);
          setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'germlineGeneList'])));
          enqueueSnackbar('Cannot fetch germline genes list data, please try again', { variant: 'error' });
        }
      })
      .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'germlineGeneList')));

    return () => {
      controller.abort();
    };
  }, [
    analysisSet?.genePanel,
    enqueueSnackbar,
    isPanel,
    reportType,
    zeroDashSdk.gene,
    zeroDashSdk.services.reports,
    shouldGetStandardPanel,
  ]);

  useEffect(() => {
    const controller = new AbortController();

    if (methBiosample?.biosampleId) {
      setLoadingItems((prev) => [...prev, 'classifiers']);
      zeroDashSdk.methylation.getMethylationData(
        methBiosample.biosampleId,
        {
          isClassified: true,
        },
        controller.signal,
      )
        .then((resp) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'classifiers'));
          setClassifiers(resp);
        })
        .catch((e) => {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setClassifiers([]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'classifiers'])));
            enqueueSnackbar('Cannot fetch classifiers data, please try again', { variant: 'error' });
          }
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'classifiers')));
    }

    return () => {
      controller.abort();
    };
  }, [zeroDashSdk.methylation, methBiosample?.biosampleId, enqueueSnackbar]);

  useEffect(() => {
    if (methBiosample?.biosampleId) {
      setLoadingItems((prev) => [...prev, 'methGenes']);
      zeroDashSdk.methylation.getMethylationGeneData(
        methBiosample.biosampleId,
      )
        .then((resp) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'methGenes'));
          setMethGenes(resp.filter((g) => (
            g.gene.toUpperCase() === 'MGMT'
            || g.reportable
          )));
        })
        .catch((e) => {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setMethGenes([]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'methGenes'])));
            enqueueSnackbar('Cannot fetch methylation genes data, please try again', { variant: 'error' });
          }
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'methGenes')));
    }
  }, [enqueueSnackbar, methBiosample?.biosampleId, zeroDashSdk.methylation]);

  useEffect(() => {
    const controller = new AbortController();

    if (analysisSet.analysisSetId) {
      setLoadingItems((prev) => [...prev, 'reportableVariants']);
      zeroDashSdk.reportableVariants.getReportableVariants(
        analysisSet.analysisSetId,
        {
          reports: [reportType],
        },
        controller.signal,
      )
        .then((res) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'reportableVariants'));
          setReportableVariants(res);
        })
        .catch((e) => {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setReportableVariants([]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'reportableVariants'])));
            enqueueSnackbar('Cannot fetch reportable variants data, please try again', { variant: 'error' });
          }
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'reportableVariants')));
    }

    return () => {
      controller.abort();
    };
  }, [
    zeroDashSdk.reportableVariants,
    analysisSet.analysisSetId,
    reportType,
    enqueueSnackbar,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    // start with an empty baseline as this effect uses prev a lot
    setRna([]);
    const rnaReportableVariants = filterReportableVariants(reportableVariants || [], 'RNA_SEQ');

    // Call for all Reportable RNAs.
    if (rnaBiosample?.biosampleId && rnaReportableVariants.length) {
      const rnaPromises = rnaReportableVariants.map(
        (reportVariant) => zeroDashSdk.rna.getRnaSeqDataByGeneId(
          rnaBiosample.biosampleId,
          reportVariant.variantId,
          undefined,
          controller.signal,
        ),
      );
      setLoadingItems((prev) => [...prev, 'reportableRNA']);
      Promise.all(rnaPromises)
        .then((rnas) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'reportableRNA'));
          setRna((prev) => {
            // Filtering new genes in case the below API call finishes first
            // and rna State is populated.
            const newGenes = rnas.filter(
              (r) => prev?.every((prevGene) => prevGene.geneId !== r.geneId),
            );
            return [
              ...(prev || []).map((prevItem) => (
                {
                  ...prevItem,
                  gene: getGeneName(prevItem.gene),
                  type: rnas.some((r) => r.geneId === prevItem.geneId) ? [...prevItem.type, 'reportable'] : prevItem.type,
                }
              )),
              ...newGenes.map((g) => (
                {
                  ...g,
                  gene: getGeneName(g.gene),
                  type: ['reportable'],
                }
              )),
            ];
          });
        })
        .catch((e) => {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setRna((prev) => [...(prev || [])]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'reportableRNA'])));
            enqueueSnackbar('Cannot fetch RNAs data, please try again', { variant: 'error' });
          }
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'reportableRNA')));
    }

    // Call for CNS only, gets EZHIP gene.
    if (
      (analysisSet.genePanel === 'CNS' || analysisSet.genePanel === 'CNS no panel')
      && rnaBiosample?.biosampleId
    ) {
      setLoadingItems((prev) => [...prev, 'ezhip']);
      zeroDashSdk?.gene.getGenes({ gene: 'EZHIP' })
        .then((genes) => {
          if (genes.length === 0) return undefined;

          return zeroDashSdk.rna.getRnaSeqDataByGeneId(
            rnaBiosample?.biosampleId,
            genes[0].geneId || 0,
            undefined,
            controller.signal,
          )
            .then((data) => {
              setErrorLoadingItems((prev) => prev.filter((item) => item !== 'ezhipReportableRNA'));
              setRna((prev) => {
                if (prev?.some((p) => p.geneId === data.geneId)) {
                  return prev.map((p) => ({
                    ...p,
                    type: data.geneId === p.geneId ? [...p.type, 'ezhip'] : p.type,
                  }));
                }
                return [
                  ...(prev || []),
                  {
                    ...data,
                    type: ['ezhip'],
                  },
                ];
              });
            });
        })
        .catch((e) => {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setRna((prev) => [
              ...(prev || []),
            ]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'ezhipReportableRNA'])));
            enqueueSnackbar('Cannot fetch EZHIP gene RNA data, please try again', { variant: 'error' });
          }
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'ezhip')));
    }
    return () => {
      controller.abort();
    };
  }, [
    analysisSet.genePanel,
    rnaBiosample?.biosampleId,
    enqueueSnackbar,
    reportableVariants,
    zeroDashSdk.gene,
    zeroDashSdk.rna,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    const getRNAClassifierData = async (): Promise<void> => {
      if (rnaBiosample?.biosampleId) {
        try {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'rnaClassifiers'));
          setLoadingItems((prev) => [...prev, 'rnaClassifiers']);

          const result = await zeroDashSdk.rna.getRNAClassifierData(
            rnaBiosample.biosampleId,
            { isClassified: true },
            controller.signal,
          );
          const filteredResult = result.filter((rnaClass) => rnaClass.classifier !== 'TALLSorts');
          setRnaClassifiers(filteredResult);
        } catch (e) {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setRnaClassifiers([]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'rnaClassifiers'])));
            enqueueSnackbar('Error fetching RNA classifiers data.', { variant: 'error' });
          }
        } finally {
          setLoadingItems((prev) => prev.filter((item) => item !== 'rnaClassifiers'));
        }
      }
    };

    getRNAClassifierData();

    return () => {
      controller.abort();
    };
  }, [enqueueSnackbar, rnaBiosample?.biosampleId, zeroDashSdk.rna]);

  useEffect(() => {
    const controller = new AbortController();
    const snvReportableVariants = filterReportableVariants(reportableVariants || [], 'SNV');

    if (tumourBiosample?.biosampleId && snvReportableVariants.length) {
      setLoadingItems((prev) => [...prev, 'snv']);
      const filteredSnvs:ISomaticSnv[] = [];
      zeroDashSdk.snv.somatic.getReportableSampleSomaticSnvs(
        tumourBiosample.biosampleId,
        controller.signal,
      )
        .then((data) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'snv'));
          filteredSnvs.push(...data.filter(
            (snv) => snvReportableVariants.some((s) => s.variantId === snv.variantId),
          ));
          setSnvs(filteredSnvs);
        })
        .catch((e) => {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setSnvs([]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'snv'])));
            enqueueSnackbar('Cannot fetch SNVs data, please try again', { variant: 'error' });
          }
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'snv')));
    } else {
      setSnvs([]);
    }

    return () => {
      controller.abort();
    };
  }, [
    tumourBiosample?.biosampleId,
    enqueueSnackbar,
    reportableVariants,
    zeroDashSdk.snv.somatic,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    const getCnvRecords = async (): Promise<void> => {
      const cnvReportableVariants = filterReportableVariants(reportableVariants || [], 'CNV');
      const cnvResults: ISomaticCNV[] = [];
      setLoadingItems((prev) => [...prev, 'cnv']);
      try {
        setErrorLoadingItems((prev) => prev.filter((item) => item !== 'cnv'));
        if (tumourBiosample?.biosampleId && cnvReportableVariants.length) {
          await zeroDashSdk.cnv.somatic.getReportableSampleSomaticCnvs(
            tumourBiosample.biosampleId,
            controller.signal,
          )
            .then((data) => {
              cnvResults.push(...data.filter(
                (cnv) => cnvReportableVariants.some((c) => c.variantId === cnv.geneId.toString()),
              ));
            });
        }

        if (
          (analysisSet.genePanel === 'Neuroblastoma' || analysisSet.genePanel === 'NBL no panel')
          && tumourBiosample?.biosampleId
          && reportType === 'MOLECULAR_REPORT'
        ) {
          await zeroDashSdk.cnv.somatic.getCnvRecords(
            {
              gene: ['MYCN'],
            },
            tumourBiosample?.biosampleId,
            undefined,
            undefined,
            controller.signal,
          )
            .then((data) => {
              cnvResults.push(...data);
            });
        }
      } catch (e) {
        if ((e as AxiosError).code !== 'ERR_CANCELED') {
          setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'cnv'])));
          enqueueSnackbar('Cannot fetch CNVs, please try again', { variant: 'error' });
        }
      } finally {
        setLoadingItems((prev) => prev.filter((item) => item !== 'cnv'));
        setCnvs(cnvResults.filter((elem, index, self) => (
          self.findIndex((e) => e.geneId === elem.geneId) === index
        )));
      }
    };

    getCnvRecords();

    return () => {
      controller.abort();
    };
  }, [
    analysisSet.genePanel,
    enqueueSnackbar,
    reportType,
    reportableVariants,
    tumourBiosample?.biosampleId,
    zeroDashSdk.cnv.somatic,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    const cytoReportableVariants = filterReportableVariants(reportableVariants || [], 'CYTOGENETICS').filter((cyto) => cyto.variantId.includes('chr'));
    if (tumourBiosample?.biosampleId && cytoReportableVariants.length) {
      setLoadingItems((prev) => [...prev, 'cytogenetics']);
      zeroDashSdk
        .cytogenetics
        .somatic
        .getCytogeneticsData(tumourBiosample.biosampleId, controller.signal)
        .then((cytos) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'cytogenetics'));
          const filteredCytos = cytos.filter(
            (cyto) => cytoReportableVariants.some((c) => c.variantId === `${cyto.chr}-${cyto.arm}`),
          );
          setCytogenetics(filteredCytos);
        })
        .catch((e) => {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setCytogenetics([]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'cytogenetics'])));
            enqueueSnackbar('Cannot fetch Cytogenetics data, please try again', { variant: 'error' });
          }
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'cytogenetics')));
    } else {
      setCytogenetics([]);
    }

    return () => {
      controller.abort();
    };
  }, [
    tumourBiosample?.biosampleId,
    enqueueSnackbar,
    reportableVariants,
    zeroDashSdk.cytogenetics,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    const cytoReportableVariants = filterReportableVariants(reportableVariants || [], 'GERMLINE_CYTO').filter((cyto) => cyto.variantId.includes('chr'));
    if (germlineBiosample?.biosampleId && cytoReportableVariants.length) {
      setLoadingItems((prev) => [...prev, 'germline_cytogenetics']);
      zeroDashSdk
        .cytogenetics
        .germline
        .getCytogeneticsData(germlineBiosample.biosampleId, controller.signal)
        .then((cytos) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'germlineCytogenetics'));
          const filteredCytos = cytos.filter(
            (cyto) => cytoReportableVariants.some((c) => c.variantId === `${cyto.chr}-${cyto.arm}`),
          );
          setGermlineCytogenetics(filteredCytos);
        })
        .catch((e) => {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setGermlineCytogenetics([]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'germlineCytogenetics'])));
            enqueueSnackbar('Cannot fetch Germline Cytogenetics data, please try again', { variant: 'error' });
          }
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'germline_cytogenetics')));
    } else {
      setGermlineCytogenetics([]);
    }

    return () => {
      controller.abort();
    };
  }, [
    enqueueSnackbar,
    germlineBiosample?.biosampleId,
    reportableVariants,
    zeroDashSdk.cytogenetics.germline,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    const bandReportableVariants = filterReportableVariants(reportableVariants || [], 'CYTOGENETICS').filter((c) => !c.variantId.includes('chr'));
    if (tumourBiosample?.biosampleId && bandReportableVariants.length) {
      setLoadingItems((prev) => [...prev, 'cytobands']);
      zeroDashSdk.cytogenetics.somatic.getCytobands(
        tumourBiosample.biosampleId,
        { reportable: true },
        controller.signal,
      )
        .then((bands) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'cytobands'));
          const filteredBands = bands.filter(
            (band) => bandReportableVariants.some((b) => b.variantId === band.cytoband),
          );
          setCytobands(filteredBands);
        })
        .catch((e) => {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setCytobands([]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'cytobands'])));
            enqueueSnackbar('Cannot fetch Cytobands data, please try again', { variant: 'error' });
          }
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'cytobands')));
    } else {
      setCytobands([]);
    }

    return () => {
      controller.abort();
    };
  }, [
    tumourBiosample?.biosampleId,
    enqueueSnackbar,
    reportableVariants,
    zeroDashSdk.cytogenetics,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    const bandReportableVariants = filterReportableVariants(reportableVariants || [], 'GERMLINE_CYTO').filter((c) => !c.variantId.includes('chr'));
    if (germlineBiosample?.biosampleId && bandReportableVariants.length) {
      setLoadingItems((prev) => [...prev, 'germline_cytobands']);
      zeroDashSdk.cytogenetics.germline.getCytobands(
        germlineBiosample.biosampleId,
        { reportable: true },
        controller.signal,
      )
        .then((bands) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'germlineCytobands'));
          const filteredBands = bands.filter(
            (band) => bandReportableVariants.some((b) => b.variantId === band.cytoband),
          );
          setGermlineCytobands(filteredBands);
        })
        .catch((e) => {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setGermlineCytobands([]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'germlineCytobands'])));
            enqueueSnackbar('Cannot fetch Germline Cytobands data, please try again', { variant: 'error' });
          }
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'germline_cytobands')));
    } else {
      setGermlineCytobands([]);
    }

    return () => {
      controller.abort();
    };
  }, [
    enqueueSnackbar,
    germlineBiosample?.biosampleId,
    reportableVariants,
    zeroDashSdk.cytogenetics.germline,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    const svReportableVariants = filterReportableVariants(reportableVariants || [], 'SV');
    if (tumourBiosample?.biosampleId && svReportableVariants.length) {
      setLoadingItems((prev) => [...prev, 'sv']);
      const filteredSvs:ISomaticSV[] = [];
      zeroDashSdk.sv.somatic.getReportableSVs(
        tumourBiosample.biosampleId,
        controller.signal,
      )
        .then((data) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'sv'));
          filteredSvs.push(...data.filter(
            (sv) => svReportableVariants.some((s) => s.variantId === sv.variantId.toString()),
          ));
          setSvs(filteredSvs);
        })
        .catch((e) => {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setSvs([]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'sv'])));
            enqueueSnackbar('Cannot fetch SVs data, please try again', { variant: 'error' });
          }
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'sv')));
    } else {
      setSvs([]);
    }

    return () => {
      controller.abort();
    };
  }, [
    tumourBiosample?.biosampleId,
    enqueueSnackbar,
    reportableVariants,
    zeroDashSdk.sv,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    const germlineSnvReportableVariants = filterReportableVariants(reportableVariants || [], 'GERMLINE_SNV');
    if (
      germlineBiosample?.biosampleId
      && germlineSnvReportableVariants.length
    ) {
      setLoadingItems((prev) => [...prev, 'germlineSNV']);
      const filteredGermlineSnvs:IReportableGermlineSNV[] = [];
      zeroDashSdk.snv.germline.getReportableSampleGermlineSnvs(
        germlineBiosample.biosampleId,
        controller.signal,
      )
        .then((data) => {
          filteredGermlineSnvs.push(...data.filter(
            (germ) => germlineSnvReportableVariants.some((v) => v.variantId === germ.variantId),
          ));
          return zeroDashSdk.snv.germline.getVariantZygosity(
            germlineBiosample.biosampleId,
            filteredGermlineSnvs.map((germline) => germline.variantId),
            tumourBiosample?.biosampleId,
            controller.signal,
          );
        })
        .then((zygResponse) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'germlineSNV'));
          const getZygosity = (
            g:IReportableGermlineSNV,
          ):string|undefined => zygResponse.find(
            (z) => z.variantId === g.variantId,
          )?.somaticSnvZygosity;
          const germlineWithZyg = filteredGermlineSnvs.map((germline) => (
            {
              ...germline,
              somaticSnvZygosity: getZygosity(germline),
            }
          ));
          setGermlineSnvs(germlineWithZyg);
        })
        .catch((e) => {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setGermlineSnvs([]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'germlineSNV'])));
            enqueueSnackbar('Cannot fetch Germline SNVs data, please try again', { variant: 'error' });
          }
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'germlineSNV')));
    } else {
      setGermlineSnvs([]);
    }

    return () => {
      controller.abort();
    };
  }, [
    germlineBiosample?.biosampleId,
    tumourBiosample?.biosampleId,
    enqueueSnackbar,
    reportableVariants,
    zeroDashSdk.snv.germline,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    const germlineCnvReportableVariants = filterReportableVariants(reportableVariants || [], 'GERMLINE_CNV');
    if (germlineBiosample?.biosampleId && germlineCnvReportableVariants.length) {
      setLoadingItems((prev) => [...prev, 'germlineCNV']);
      const filteredGermlineCnvs:IGermlineCNV[] = [];
      zeroDashSdk.cnv.germline.getAllReportableGermlineCnv(
        germlineBiosample.biosampleId,
        controller.signal,
      )
        .then((data) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'germlineCNV'));
          filteredGermlineCnvs.push(...data.filter(
            (germ) => germlineCnvReportableVariants.some(
              (g) => g.variantId === germ.geneId.toString(),
            ),
          ));
          setGermlineCnvs(filteredGermlineCnvs);
        })
        .catch((e) => {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setGermlineCnvs([]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'germlineCNV'])));
            enqueueSnackbar('Cannot fetch Germline CNVs data, please try again', { variant: 'error' });
          }
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'germlineCNV')));
    } else {
      setGermlineCnvs([]);
    }

    return () => {
      controller.abort();
    };
  }, [
    germlineBiosample?.biosampleId,
    enqueueSnackbar,
    reportableVariants,
    zeroDashSdk.cnv.germline,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    const germSvReportableVariants = filterReportableVariants(reportableVariants || [], 'GERMLINE_SV');
    if (germlineBiosample?.biosampleId && germSvReportableVariants.length) {
      setLoadingItems((prev) => [...prev, 'germlineSV']);
      const filteredSvs: IGermlineSV[] = [];

      zeroDashSdk.sv.germline.getReportableGermlineSVs(
        germlineBiosample.biosampleId,
        controller.signal,
      )
        .then((data) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'germlineSV'));
          filteredSvs.push(...data.filter(
            (sv) => germSvReportableVariants.some((s) => s.variantId === sv.variantId.toString()),
          ));
          setGermlineSvs(filteredSvs);
        })
        .catch((e) => {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setGermlineSvs([]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'germlineSV'])));
            enqueueSnackbar('Cannot fetch Germline SVs data, please try again', { variant: 'error' });
          }
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'germlineSV')));
    } else {
      setGermlineSvs([]);
    }

    return () => {
      controller.abort();
    };
  }, [
    germlineBiosample?.biosampleId,
    enqueueSnackbar,
    reportableVariants,
    zeroDashSdk.sv.germline,
  ]);

  useEffect(() => {
    const controller = new AbortController();

    if (clinicalReportTypes.includes(reportType)) {
      setCurationCommentThreads([]);
    } else if (analysisSet.analysisSetId) {
      setLoadingItems((prev) => [...prev, 'curationCommentThreads']);
      getCurationCommentThreads(controller.signal)
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'curationCommentThreads')));
    }

    return () => {
      controller.abort();
    };
  }, [analysisSet.analysisSetId, getCurationCommentThreads, reportType]);

  useEffect(() => {
    const controller = new AbortController();

    if (!clinicalReportTypes.includes(reportType)) {
      setClinicalCommentThreads([]);
    } else if (latestClinVersion?.id) {
      setLoadingItems((prev) => [...prev, 'clinicalCommentThreads']);
      getClinicalCommentThreads(controller.signal)
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'clinicalCommentThreads')));
    }

    return () => {
      controller.abort();
    };
  }, [getClinicalCommentThreads, latestClinVersion?.id, reportType]);

  // get evidence directly attached to the report
  useEffect(() => {
    const controller = new AbortController();

    try {
      setLoadingItems((prev) => [...prev, 'reportEvidenceLinks']);
      if (
        reportType === 'MOLECULAR_REPORT'
      && analysisSet.analysisSetId
      && selectedReport?.id
      ) {
        zeroDashSdk.curationEvidence.getEvidence(
          {
            analysisSetId: analysisSet.analysisSetId,
            entityTypes: ['MOLECULAR_REPORT'],
            entityIds: [selectedReport.id],
          },
          controller.signal,
        ).then((reportEvidence) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'reportEvidenceLinks'));
          setReportEvidenceLinks(reportEvidence);
        });
      } else {
        setReportEvidenceLinks([]);
      }
    } catch (e) {
      if ((e as AxiosError).code !== 'ERR_CANCELED') {
        setReportEvidenceLinks([]);
        setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'reportEvidenceLinks'])));
        enqueueSnackbar('Cannot fetch classifiers data, please try again', { variant: 'error' });
      }
    } finally {
      setLoadingItems((prev) => prev.filter((item) => item !== 'reportEvidenceLinks'));
    }

    return () => {
      controller.abort();
    };
  }, [
    analysisSet.analysisSetId,
    enqueueSnackbar,
    reportType,
    selectedReport?.id,
    zeroDashSdk.curationEvidence,
  ]);

  // Get latest clinical version for MTB report
  useEffect(() => {
    setLoadingItems((prev) => [...prev, 'clinicalVersion']);
    zeroDashSdk.mtb.clinical.getLatestClinicalVersion(analysisSet.analysisSetId)
      .then((resp) => {
        setErrorLoadingItems((prev) => prev.filter((item) => item !== 'clinicalVersion'));
        setLatestClinVersion(resp);
      })
      .catch(() => {
        setLatestClinVersion(undefined);
      })
      .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'clinicalVersion')));
  }, [analysisSet.analysisSetId, zeroDashSdk.mtb.clinical]);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingItems((prev) => [...prev, 'interpretations', 'recommendations']);
    getInterpretations(controller.signal)
      .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'interpretations')));
    getRecommendations(controller.signal)
      .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'recommendations')));

    return () => {
      controller.abort();
    };
  }, [getInterpretations, getRecommendations]);

  useEffect(() => {
    const controller = new AbortController();

    if (!clinicalReportTypes.includes(reportType)) {
      setRecommendationEvidenceLinks([]);
    } else {
      const getRecommendationEvidence = async (): Promise<IEvidenceLink[]> => {
        const recommendationIds = recommendations.map((r) => r.id);
        if (recommendationIds.length > 0 && latestClinVersion?.id) {
          return zeroDashSdk.mtb.evidence.getEvidence(
            {
              entityTypes: ['RECOMMENDATION'],
              entityIds: recommendationIds,
            },
            controller.signal,
          );
        }
        return [];
      };

      getRecommendationEvidence()
        .then((resp) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'recEvidenceLinks'));
          setRecommendationEvidenceLinks(resp);
        })
        .catch((e) => {
          if ((e as AxiosError).code !== 'ERR_CANCELED') {
            setRecommendationEvidenceLinks([]);
            setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'recEvidenceLinks'])));
            enqueueSnackbar('Cannot fetch recommendation evidence links data, please try again', { variant: 'error' });
          }
        });
    }

    return () => {
      controller.abort();
    };
  }, [
    enqueueSnackbar,
    latestClinVersion?.id,
    recommendations,
    reportType,
    zeroDashSdk.mtb.evidence,
  ]);

  // Preclinical report
  useEffect(() => {
    if (htsBiosamples?.length && htsCultures?.length) {
      const biosample = htsBiosamples.find(
        (b) => (
          b.biosampleId === reportMetadata?.['preclinical.htsBiosampleId']
        ),
      ) || htsBiosamples[0];
      setCulture(
        htsCultures.find((c) => (
          c.biosampleId === biosample.biosampleId
          && c.screenName === reportMetadata?.['preclinical.htsScreen']
        )),
      );
    } else {
      setCulture(undefined);
    }
  }, [htsBiosamples, htsCultures, reportMetadata]);

  useEffect(() => {
    const htsReportableVariants = filterReportableVariants(reportableVariants || [], 'HTS');
    if (htsBiosamples?.length && culture && htsReportableVariants.length) {
      setLoadingItems((prev) => [...prev, 'hts']);
      zeroDashSdk.services.drugs.getDrugScreens({
        screenName: culture.screenName,
      })
        .then(async (screens) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'hts'));
          // Single Agent
          const results = await zeroDashSdk.hts.getHTSResults(
            culture.biosampleId,
            {
              screenIds: screens.map((screen) => screen.id),
              reportable: true,
            },
          );

          setHtsResults(
            results
              .filter(
                (result) => htsReportableVariants.some((v) => v.variantId === result.screenId),
              )
              .map((result) => {
                const screen = screens.find((s) => s.id === result.screenId);
                return {
                  ...result,
                  compoundId: screen?.internalId,
                  drugId: result.screenId,
                  drugName: screen?.drugName,
                  category: screen?.category,
                  classes: screen?.classes,
                  targets: screen?.targets,
                };
              }),
          );
        })
        .catch(() => {
          setHtsResults([]);
          setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'hts'])));
          enqueueSnackbar('Cannot fetch HTS data, please try again', { variant: 'error' });
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'hts')));
    } else {
      setHtsResults([]);
    }
  }, [
    culture,
    enqueueSnackbar,
    htsBiosamples?.length,
    reportableVariants,
    zeroDashSdk.hts,
    zeroDashSdk.services.drugs,
  ]);

  useEffect(() => {
    const comboReportableVariants = filterReportableVariants(reportableVariants || [], 'HTS_COMBINATION');
    if (htsBiosamples?.length && culture) {
      setLoadingItems((prev) => [...prev, 'htsCombination']);
      zeroDashSdk.services.drugs.getDrugScreens({
        screenName: culture.screenName,
      })
        .then(async (screens) => {
          setErrorLoadingItems((prev) => prev.filter((item) => item !== 'htsCombination'));
          // Combination
          const combinations = await zeroDashSdk.hts.getDrugCombinations(
            culture.biosampleId,
            {
              screenIds: screens.map((screen) => screen.id),
              reportable: true,
            },
          );

          setHtsCombinations(
            combinations
              .filter(
                (result) => comboReportableVariants.some((v) => v.variantId === result.id),
              )
              .map((combination) => {
                const screen1Data = screens.find((s) => s.id === combination.screenId1);
                const screen2Data = screens.find((s) => s.id === combination.screenId2);
                return {
                  ...combination,
                  screen1Data,
                  screen2Data,
                };
              }),
          );
        })
        .catch(() => {
          setHtsCombinations([]);
          setErrorLoadingItems((prev) => Array.from(new Set([...prev, 'htsCombination'])));
          enqueueSnackbar('Cannot fetch HTS combination data, please try again', { variant: 'error' });
        })
        .finally(() => setLoadingItems((prev) => prev.filter((item) => item !== 'htsCombination')));
    } else {
      setHtsCombinations([]);
    }
  }, [
    culture,
    enqueueSnackbar,
    htsBiosamples?.length,
    reportableVariants,
    zeroDashSdk.hts,
    zeroDashSdk.services.drugs,
  ]);

  useEffect(() => {
    const copyComments = async (): Promise<void> => {
      if (pendingReport?.id) {
        const prevReports = (await zeroDashSdk.services.reports.getReports({
          analysisSetIds: [analysisSet.analysisSetId],
          types: [reportType],
          statuses: ['approved'],
        })).sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));

        if (prevReports[0] && clinicalReportTypes.includes(reportType) && latestClinVersion?.id) {
          const reportThreads = await zeroDashSdk.mtb.comment.getCommentThreads(
            {
              threadType: ['REPORTS'],
              entityType: [reportType],
              entityId: prevReports[0].id,
              includeComments: true,
              clinicalVersionId: latestClinVersion.id,
            },
          );
          if (reportThreads[0]?.comments) {
            await Promise.all(reportThreads[0]?.comments?.map((comment) => (
              zeroDashSdk.mtb.comment.linkCommentToThread(
                comment.id,
                {
                  threadType: 'REPORTS',
                  entityType: reportType,
                  entityId: pendingReport.id,
                  clinicalVersionId: latestClinVersion.id,
                },
              )
            )));
          }
        }

        if (prevReports[0] && !clinicalReportTypes.includes(reportType)) {
          const threadType = reportType === 'GERMLINE_REPORT' ? 'GERMLINE' : 'MOLECULAR';
          const reportThreads = await zeroDashSdk.curationComments.getCommentThreads({
            threadType: [threadType],
            entityType: [reportType],
            entityId: prevReports[0].id,
            includeComments: true,
            analysisSetIds: [analysisSet.analysisSetId],
          });
          if (reportThreads[0]?.comments) {
            await Promise.all(reportThreads[0]?.comments?.map((comment) => (
              zeroDashSdk.curationComments.linkCommentToThread(
                comment.id,
                {
                  threadType,
                  entityType: reportType,
                  entityId: pendingReport.id,
                  analysisSetId: analysisSet.analysisSetId,
                },
              )
            )));
          }
        }
      }
      setCopyPrevReportComments(false);
    };

    if (copyPrevReportComments) {
      copyComments();
    }
  }, [
    copyPrevReportComments,
    setCopyPrevReportComments,
    pendingReport?.id,
    latestClinVersion?.id,
    reportType,
    analysisSet.analysisSetId,
    zeroDashSdk.curationComments,
    zeroDashSdk.mtb.comment,
    zeroDashSdk.services.reports,
  ]);

  useEffect(() => {
    const checkIsAllCommentsSaved = (): boolean => {
      const unsavedIds: string[] = [];
      const interpretationIds = [
        ...interpretations.map((i) => i.id),
      ];
      if (pendingReport) {
        const savedComments = localStorage.getItem(localStorageKey);
        if (savedComments) {
          const parsedComments = JSON.parse(savedComments);
          for (const key of Object.keys(parsedComments)) {
            if (
              interpretationIds.includes(key)
              || key.includes(pendingReport.id)
            ) {
              unsavedIds.push(key);
            }
          }
        }
      }

      setUnsavedCommentIds(unsavedIds);
      if (unsavedIds.length > 0) {
        enqueueSnackbar('You have unsaved comments. Please save them before approving.', { variant: 'warning' });
        return false;
      }
      return true;
    };

    const approveReport = async (): Promise<void> => {
      if (isApproving) {
        const isFinalisingReport = isApproving === 'Finalise';
        try {
          if (checkIsAllCommentsSaved() && errorLoadingItems.length === 0) {
            if (isFinalisingReport) {
              setIsGeneratingReport('pdf');
            } else {
              await approve(
                isApproving.id,
                true,
              );
              const asGroupString = isApproving.groupName ? ` as ${mapGroupName(isApproving.groupName || undefined)}` : '';
              enqueueSnackbar(`Report approved${asGroupString}.`, { variant: 'success' });
            }
          } else {
            enqueueSnackbar(`Cannot ${isFinalisingReport ? 'finalise' : 'approve'} report because ${!checkIsAllCommentsSaved() ? 'there are unsaved comments' : 'some data did not load correctly. Please refresh and try again'}.`, { variant: 'error' });
          }
        } catch {
          enqueueSnackbar(`Something went wrong while ${isFinalisingReport ? 'generating report' : 'approving'}. Please try again later.`, { variant: 'error' });
        } finally {
          setIsApproving(null);
        }
      }
    };

    if (isApproving) {
      approveReport();
    }
  }, [
    approve,
    clinicalCommentThreads,
    curationCommentThreads,
    enqueueSnackbar,
    errorLoadingItems,
    interpretations,
    isApproving,
    pendingReport,
    setIsApproving,
    setIsGeneratingReport,
  ]);

  return (
    <ReportDataContext.Provider
      value={value}
    >
      {children}
    </ReportDataContext.Provider>
  );
}
