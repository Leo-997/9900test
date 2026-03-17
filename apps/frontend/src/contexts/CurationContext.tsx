import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
} from 'react';
import { Outlet } from 'react-router-dom';
import {
  curationStatuses, htsStatuses, secondaryCurationStatuses,
} from '@/constants/Curation/navigation';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { CuratorType, IUser } from '@/types/Auth/User.types';
import { ISampleCorrectionFlag } from '@/types/Corrections.types';
import { IHTSCulture } from '@/types/HTS.types';
import { IGeneList } from '@/types/Reports/GeneLists.types';
import {
  CurationStatus,
  FailedStatusReason,
  HtsStatus,
  ICurrentCurationStatus,
  ICurrentStatus,
  SecondaryCurationStatus,
} from '@/types/Samples/Sample.types';
import { defaultEmptyList } from '../constants/Curation/genes';
import { useAnalysisSet } from './AnalysisSetContext';
import { useUser } from './UserContext';
import { useZeroDashSdk } from './ZeroDashSdkContext';
import { usePatient } from './PatientContext';

interface ICurationContext {
  curationStatus?: ICurrentCurationStatus;
  secondaryCurationStatus?: ICurrentStatus<SecondaryCurationStatus, IAnalysisSet>;
  htsStatus?: ICurrentStatus<HtsStatus, IHTSCulture[]>;
  updateCurationStatus(
    curationStatus?: CurationStatus,
    failedStatusReason?: FailedStatusReason,
  ): Promise<void>;
  updateSecondaryCurationStatus(
    secondaryCurationStatus?: SecondaryCurationStatus,
  ): Promise<void>;
  updateHtsStatus(
    htsStatus?: HtsStatus,
  ): Promise<void>;
  isAssignedCurator: boolean;
  updateCurator(
    role: CuratorType,
    curator: IUser | null,
  ): Promise<void>;
  somaticGeneList: IGeneList;
  germlineGeneList: IGeneList; // for reports
  correctionFlags: ISampleCorrectionFlag[];
  setCorrectionFlags: Dispatch<SetStateAction<ISampleCorrectionFlag[]>>;
  allFlagsCorrected: boolean;
  isReadOnly: boolean;
}

export const CurationContext = createContext<ICurationContext | undefined>(undefined);
CurationContext.displayName = 'CurationContext';

export const useCuration = (): ICurationContext => {
  const context = useContext(CurationContext);

  if (!context) throw new Error('Curation context is not available at this scope');

  return context;
};

export function CurationContextProvider(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { currentUser } = useUser();
  const { isReadOnly: isPatientReadOnly } = usePatient();
  const { analysisSet, setAnalysisSet, isReadOnly: isAnalysisSetIsReadOnly } = useAnalysisSet();

  const [correctionFlags, setCorrectionFlags] = useState<ISampleCorrectionFlag[]>([]);
  const [somaticGeneList, setSomaticGeneList] = useState<IGeneList>(defaultEmptyList);
  const [germlineGeneList, setGermlineGeneList] = useState<IGeneList>(defaultEmptyList);

  const isReadOnly = useMemo((): boolean => {
    const curationStatus = curationStatuses[analysisSet.curationStatus];
    const caseReadonly = curationStatus?.readonly
      || !(correctionFlags.length === correctionFlags.filter((c) => c.isCorrected).length);
    return isPatientReadOnly || isAnalysisSetIsReadOnly || caseReadonly;
  }, [analysisSet.curationStatus, isAnalysisSetIsReadOnly, correctionFlags, isPatientReadOnly]);

  const updateCurationStatus = useCallback(async (
    curationStatus?: CurationStatus,
    failedStatusReason?: FailedStatusReason,
  ): Promise<void> => {
    await zeroDashSdk.curation.analysisSets.updateAnalysisSetById(
      analysisSet.analysisSetId,
      {
        curationStatus,
        failedStatusReason,
      },
    );
    setAnalysisSet((prev) => ({
      ...prev,
      curationStatus: curationStatus || prev.curationStatus,
      failedStatusReason: failedStatusReason || prev.failedStatusReason,
    }));
  }, [analysisSet, setAnalysisSet, zeroDashSdk.curation.analysisSets]);

  const updateSecondaryCurationStatus = useCallback(async (
    secondaryCurationStatus?: SecondaryCurationStatus,
  ): Promise<void> => {
    await zeroDashSdk.curation.analysisSets.updateAnalysisSetById(
      analysisSet.analysisSetId,
      {
        secondaryCurationStatus,
      },
    );
    setAnalysisSet((prev) => ({
      ...prev,
      secondaryCurationStatus: secondaryCurationStatus || prev.secondaryCurationStatus,
    }));
  }, [analysisSet, setAnalysisSet, zeroDashSdk.curation.analysisSets]);

  const updateHtsStatus = useCallback(async (
    htsStatus?: HtsStatus,
  ): Promise<void> => {
    await zeroDashSdk.curation.analysisSets.updateAnalysisSetById(
      analysisSet.analysisSetId,
      {
        htsStatus,
      },
    );
    setAnalysisSet((prev) => ({
      ...prev,
      htsStatus: htsStatus || prev.htsStatus,
    }));
  }, [analysisSet, setAnalysisSet, zeroDashSdk.curation.analysisSets]);

  const updateCurator = useCallback(async (
    role: CuratorType,
    curator: IUser | null,
  ): Promise<void> => {
    await zeroDashSdk.curation.analysisSets.updateAnalysisSetById(
      analysisSet.analysisSetId,
      {
        [role === 'Primary' ? 'primaryCuratorId' : 'secondaryCuratorId']: curator === null ? null : curator.id,
      },
    );
    setAnalysisSet({
      ...analysisSet,
      [role === 'Primary' ? 'primaryCuratorId' : 'secondaryCuratorId']: curator === null ? null : curator.id,
      secondaryCurationStatus: role === 'Secondary' ? 'Not Started' : analysisSet.secondaryCurationStatus,
    });
  }, [analysisSet, setAnalysisSet, zeroDashSdk.curation.analysisSets]);

  // Get all flags currently open for this sample
  useEffect(() => {
    async function getAllCorrectionFlags(): Promise<void> {
      try {
        if (analysisSet.analysisSetId) {
          const flags = await zeroDashSdk.curation.flags.getCorrectionFlags(
            analysisSet.analysisSetId,
          );
          setCorrectionFlags(flags);
        }
      } catch (error) {
        console.error('getAllCorrectionFlags: ', error);
      }
    }
    getAllCorrectionFlags();
  }, [analysisSet.analysisSetId, zeroDashSdk.curation.flags]);

  // Get the somatic gene list for the current sample
  useEffect(() => {
    async function getGeneList(): Promise<void> {
      const list = await zeroDashSdk.services.reports.getGeneLists({
        isActive: true,
        genePanel: analysisSet?.genePanel || 'No panel',
        type: 'somatic',
      });

      if (list.length > 0 && list[0].genes?.length) {
        setSomaticGeneList(list[0]);
      } else {
        const defaultList = await zeroDashSdk.services.reports.getGeneLists({
          isActive: true,
          genePanel: 'No panel',
          type: 'somatic',
        });
        if (defaultList.length > 0 && defaultList[0].genes?.length) {
          setSomaticGeneList(defaultList[0]);
        }
      }
    }

    getGeneList();
  }, [zeroDashSdk, analysisSet]);

  // get the germline gene list for the current sample
  useEffect(() => {
    async function getGeneList(): Promise<void> {
      const list = await zeroDashSdk.services.reports.getGeneLists({
        isActive: true,
        genePanel: analysisSet?.genePanel || 'No panel',
        type: 'germline',
      });

      if (list.length > 0 && list[0].genes?.length) {
        setGermlineGeneList(list[0]);
      } else {
        const defaultList = await zeroDashSdk.services.reports.getGeneLists({
          isActive: true,
          genePanel: 'No panel',
          type: 'germline',
        });
        if (defaultList.length > 0 && defaultList[0].genes?.length) {
          setGermlineGeneList(defaultList[0]);
        }
      }
    }

    getGeneList();
  }, [zeroDashSdk, analysisSet]);

  const value = useMemo<ICurationContext>(() => ({
    curationStatus: curationStatuses[analysisSet.curationStatus],
    secondaryCurationStatus: secondaryCurationStatuses[analysisSet.secondaryCurationStatus],
    htsStatus: htsStatuses[analysisSet.htsStatus],
    isAssignedCurator: Boolean(analysisSet.primaryCuratorId === currentUser?.id
      || analysisSet.secondaryCuratorId === currentUser?.id),
    updateCurationStatus,
    updateSecondaryCurationStatus,
    updateHtsStatus,
    updateCurator,
    somaticGeneList,
    germlineGeneList,
    correctionFlags,
    setCorrectionFlags,
    allFlagsCorrected: (
      correctionFlags.length === correctionFlags.filter((c) => c.isCorrected).length
    ),
    isReadOnly,
  }), [
    analysisSet.curationStatus,
    analysisSet.primaryCuratorId,
    analysisSet.secondaryCurationStatus,
    analysisSet.htsStatus,
    analysisSet.secondaryCuratorId,
    correctionFlags,
    currentUser?.id,
    germlineGeneList,
    somaticGeneList,
    updateCurationStatus,
    updateCurator,
    updateSecondaryCurationStatus,
    updateHtsStatus,
    isReadOnly,
  ]);

  return (
    <CurationContext.Provider
      value={value}
    >
      <Outlet />
    </CurationContext.Provider>
  );
}
