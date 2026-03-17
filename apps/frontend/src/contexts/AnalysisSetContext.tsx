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
import { Outlet, useParams } from 'react-router-dom';
import { defaultLeukemiaSubtypes, defaultMolecularConfirmation } from '@/constants/Curation/MolecularConfirmation';
import { LoadingPage } from '@/pages/Loading/Loading';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IBiosample } from '@/types/Analysis/Biosamples.types';
import { IHTSCulture } from '@/types/HTS.types';
import { VariantType } from '@/types/misc.types';
import { ILeukemiaSubtypes, IMolecularConfirmation } from '@/types/MolecularConfirmation.types';
import { IPatientDemographics } from '@/types/Patient/Patient.types';
import { IPurity } from '@/types/Precuration/Purity.types';
import { IImmunoprofile, IRNASeqMetrics, ISeqMetrics } from '@/types/Precuration/QCMetrics.types';
import { getGermlineBiosample } from '@/utils/functions/biosamples/getGermlineBiosample';
import { getHtsBiosamples } from '@/utils/functions/biosamples/getHtsBiosamples';
import { getMethBiosample } from '@/utils/functions/biosamples/getMethBiosample';
import getPrimaryBiosample from '@/utils/functions/biosamples/getPrimaryBiosample';
import { getRnaBiosample } from '@/utils/functions/biosamples/getRnaBiosample';
import { getTumourBiosample } from '@/utils/functions/biosamples/getTumourBiosample';
import { useZeroDashSdk } from './ZeroDashSdkContext';
import { useIsPatientReadOnly } from '@/hooks/useIsPatientReadOnly';

export interface IAnalysisSetContext {
  analysisSet: IAnalysisSet;
  setAnalysisSet: Dispatch<SetStateAction<IAnalysisSet>>;
  demographics?: IPatientDemographics | null;
  updateDemographics: (demographics?: IPatientDemographics | null) => void;
  primaryBiosample?: IBiosample;
  tumourBiosample?: IBiosample;
  germlineBiosample?: IBiosample;
  rnaBiosample?: IBiosample;
  methBiosample?: IBiosample;
  htsBiosamples?: IBiosample[];
  htsCultures?: IHTSCulture[];
  getBiosampleForVariantType: (variantType: VariantType) => IBiosample | undefined;
  onCultureChange?: (
    biosampleId: string,
    screenName: string,
    newCulture: IHTSCulture,
  ) => void
  purity?: IPurity;
  metrics?: ISeqMetrics[];
  rnaseqMetrics?: IRNASeqMetrics;
  immunoprofile?: IImmunoprofile;
  molecularConfirmation: IMolecularConfirmation | undefined;
  setMolecularConfirmation: Dispatch<SetStateAction<IMolecularConfirmation| undefined>>;
  leukemiaSubtypes: ILeukemiaSubtypes | undefined;
  setLeukemiaSubtypes: Dispatch<SetStateAction<ILeukemiaSubtypes| undefined>>;
  isReadOnly: boolean;
}

export const AnalysisSetContext = createContext<IAnalysisSetContext | undefined>(undefined);
AnalysisSetContext.displayName = 'AnalysisSetContext';

export const useAnalysisSet = (): IAnalysisSetContext => {
  const ctx = useContext(AnalysisSetContext);

  if (!ctx) {
    throw new Error('Analysis set context is not available at this scope');
  }

  return ctx;
};

interface IProps {
  children?: ReactNode;
  analysisSetId?: string;
}

export function AnalysisSetProvider({
  children,
  analysisSetId: inputAnalysisSetId,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { analysisSetId: paramAnlysisSetId } = useParams();
  const analysisSetId = inputAnalysisSetId ?? paramAnlysisSetId;
  const [analysisSet, setAnalysisSet] = useState<IAnalysisSet>({} as IAnalysisSet);
  const [demographics, setDemographics] = useState<IPatientDemographics | null>();
  const [purity, setPurity] = useState<IPurity>();
  const [metrics, setMetrics] = useState<ISeqMetrics[]>();
  const [rnaseqMetrics, setRnaseqMetrics] = useState<IRNASeqMetrics>();
  const [immunoprofile, setImmunoprofile] = useState<IImmunoprofile>();
  const [htsCultures, setHTSCultures] = useState<IHTSCulture[]>([]);
  const [
    molecularConfirmation,
    setMolecularConfirmation,
  ] = useState<IMolecularConfirmation | undefined>();
  const [
    leukemiaSubtypes,
    setLeukemiaSubtypes,
  ] = useState<ILeukemiaSubtypes | undefined>();
  const isReadOnly = useIsPatientReadOnly({ analysisSetId });

  const getBiosampleForVariantType = useCallback((
    variantType: VariantType,
  ): IBiosample | undefined => {
    const variantTypeBiosampleMap: Record<VariantType, IBiosample | undefined> = {
      SNV: getTumourBiosample(analysisSet.biosamples || []),
      CNV: getTumourBiosample(analysisSet.biosamples || []),
      SV: getTumourBiosample(analysisSet.biosamples || []),
      GERMLINE_CNV: getGermlineBiosample(analysisSet.biosamples || []),
      GERMLINE_SNV: getGermlineBiosample(analysisSet.biosamples || []),
      GERMLINE_SV: getGermlineBiosample(analysisSet.biosamples || []),
      RNA_SEQ: getRnaBiosample(analysisSet.biosamples || []),
      RNA_CLASSIFIER: getRnaBiosample(analysisSet.biosamples || []),
      CYTOGENETICS: getTumourBiosample(analysisSet.biosamples || []),
      CYTOGENETICS_CYTOBAND: getTumourBiosample(analysisSet.biosamples || []),
      CYTOGENETICS_ARM: getTumourBiosample(analysisSet.biosamples || []),
      GERMLINE_CYTO_ARM: getTumourBiosample(analysisSet.biosamples || []),
      GERMLINE_CYTO: getGermlineBiosample(analysisSet.biosamples || []),
      GERMLINE_CYTO_CYTOBAND: getGermlineBiosample(analysisSet.biosamples || []),
      METHYLATION: getMethBiosample(analysisSet.biosamples || []),
      METHYLATION_MGMT: getMethBiosample(analysisSet.biosamples || []),
      METHYLATION_CLASSIFIER: getMethBiosample(analysisSet.biosamples || []),
      METHYLATION_GENE: getMethBiosample(analysisSet.biosamples || []),
      MUTATIONAL_SIG: getTumourBiosample(analysisSet.biosamples || []),
      HTS: getHtsBiosamples(analysisSet.biosamples || [])[0],
      HTS_COMBINATION: getHtsBiosamples(analysisSet.biosamples || [])?.[0],
      TMB: undefined,
      IPASS: undefined,
    };
    return variantTypeBiosampleMap[variantType];
  }, [analysisSet.biosamples]);

  const updateDemographics = useCallback((demo?: IPatientDemographics | null): void => {
    setDemographics(demo);
  }, []);

  const value = useMemo(() => ({
    analysisSet,
    setAnalysisSet,
    demographics,
    updateDemographics,
    primaryBiosample: getPrimaryBiosample(analysisSet.biosamples || []),
    tumourBiosample: getTumourBiosample(analysisSet.biosamples || []),
    germlineBiosample: getGermlineBiosample(analysisSet.biosamples || []),
    rnaBiosample: getRnaBiosample(analysisSet.biosamples || []),
    methBiosample: getMethBiosample(analysisSet.biosamples || []),
    htsBiosamples: getHtsBiosamples(analysisSet.biosamples || []),
    htsCultures,
    getBiosampleForVariantType,
    onCultureChange: (
      biosampleId: string,
      screenName: string,
      newCulture: IHTSCulture,
    ) => (
      setHTSCultures((prev) => prev.map((c) => ({
        ...c,
        ...(
          c.biosampleId === biosampleId && c.screenName === screenName
            ? newCulture
            : {}
        ),
      })))
    ),
    purity,
    metrics,
    rnaseqMetrics,
    immunoprofile,
    molecularConfirmation,
    setMolecularConfirmation,
    leukemiaSubtypes,
    setLeukemiaSubtypes,
    isReadOnly,
  }), [
    analysisSet,
    setAnalysisSet,
    demographics,
    updateDemographics,
    htsCultures,
    purity,
    metrics,
    rnaseqMetrics,
    immunoprofile,
    getBiosampleForVariantType,
    molecularConfirmation,
    setMolecularConfirmation,
    leukemiaSubtypes,
    setLeukemiaSubtypes,
    isReadOnly,
  ]);

  useEffect(() => {
    if (analysisSetId) {
      zeroDashSdk
        .curation
        .analysisSets
        .getAnalysisSetById(analysisSetId)
        .then(setAnalysisSet);
    }
  }, [analysisSetId, zeroDashSdk.curation.analysisSets]);

  useEffect(() => {
    zeroDashSdk
      .curation
      .purity
      .getPurity({ analysisSetId })
      .then((resp) => setPurity(resp[0]));
  }, [analysisSetId, zeroDashSdk.curation.purity]);

  useEffect(() => {
    if (analysisSetId) {
      zeroDashSdk
        .curation
        .molecularConfirmation
        .getMolecularConfirmation(analysisSetId)
        .then((resp) => {
          if (resp) {
            const {
              diagnosisSubtype,
              zero2ConfirmedSubtype,
              ...rest
            } = resp;
            setLeukemiaSubtypes({ diagnosisSubtype, zero2ConfirmedSubtype });
            setMolecularConfirmation(rest);
          } else {
            setLeukemiaSubtypes({ ...defaultLeukemiaSubtypes });
            setMolecularConfirmation({ ...defaultMolecularConfirmation });
          }
        });
    }
  }, [analysisSetId, zeroDashSdk.curation.molecularConfirmation]);

  useEffect(() => {
    if (analysisSet.biosamples) {
      Promise.all(
        analysisSet.biosamples?.map(
          (biosample) => zeroDashSdk
            .curation
            .metrics
            .getMetrics(biosample.biosampleId),
        ),
      ).then((resp) => {
        setMetrics(resp.filter((metric) => metric));
      });
    }
  }, [analysisSet.biosamples, zeroDashSdk.curation.metrics]);

  useEffect(() => {
    const rnaBiosample = analysisSet.biosamples?.find(
      (biosample) => biosample.biosampleType === 'rna',
    );
    if (rnaBiosample) {
      zeroDashSdk
        .curation
        .metrics
        .getImmunoprofile(rnaBiosample.biosampleId)
        .then((resp) => setImmunoprofile(resp));
      zeroDashSdk
        .curation
        .metrics
        .getRNASeqMetrics(rnaBiosample.biosampleId)
        .then((resp) => setRnaseqMetrics(resp));
    }
  }, [analysisSet.biosamples, zeroDashSdk.curation.metrics]);

  useEffect(() => {
    if (analysisSet?.c1EventNum && analysisSet?.patientId) {
      zeroDashSdk.patient.getPatientDemographics(
        analysisSet.patientId,
        analysisSet.c1EventNum || undefined,
      )
        .then((res) => {
          setDemographics(res);
        })
        .catch(() => setDemographics(null));
    }
  }, [analysisSet.c1EventNum, analysisSet.patientId, zeroDashSdk.patient]);

  useEffect(() => {
    const htsBiosamples = getHtsBiosamples(analysisSet.biosamples || []);
    if (htsBiosamples?.length) {
      try {
        Promise.all(
          htsBiosamples.map((biosample) => (
            zeroDashSdk.hts.getHTSCulture(
              biosample.biosampleId,
            )
          )),
        ).then((htsResp) => setHTSCultures(htsResp.flatMap((c) => c)));
      } catch {}
    }
  }, [analysisSet.biosamples, zeroDashSdk.hts]);

  return (
    <AnalysisSetContext.Provider value={value}>
      {!analysisSet.analysisSetId && (
        <LoadingPage message="Fetching sample data..." />
      )}
      { children || <Outlet /> }
    </AnalysisSetContext.Provider>
  );
}
