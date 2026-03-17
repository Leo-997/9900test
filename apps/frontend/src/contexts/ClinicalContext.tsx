/* eslint-disable max-len */
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
import { useLocation, useParams } from 'react-router-dom';
import { Group } from '@/types/Auth/Group.types';
import { IExternalDrug } from '@/types/Drugs/Drugs.types';
import { ISlideWithMetadata } from '@/types/MTB/Slide.types';
import { clinicalStatuses } from '../constants/MTB/navigation';
import useIsFullScreen from '../hooks/useIsFullScreen';
import { IUser } from '../types/Auth/User.types';
import { IAddendum } from '../types/MTB/Addendum.types';
import {
  ClinicalReviewStatus, ClinicalStatus, ICurrentClinicalStatus,
} from '../types/MTB/ClinicalStatus.types';
import {
  IClinicalVersion,
  IClinicalVersionRaw,
  IReviewWithUser,
  ISlideTableSettings,
  IUpdateDiscussionFields,
  Views,
} from '../types/MTB/MTB.types';
import { useAnalysisSet } from './AnalysisSetContext';
import { usePatient } from './PatientContext';
import { useUser } from './UserContext';
import { useZeroDashSdk } from './ZeroDashSdkContext';

interface IProps {
  versionId?: string
  children: ReactNode;
}

type SlideTableSettingsGroup = keyof ISlideTableSettings;
type SlideTableGroupSettings<G extends SlideTableSettingsGroup> =
  NonNullable<ISlideTableSettings[G]>;

interface IClinicalContext {
  slides: ISlideWithMetadata[];
  loading: boolean;
  activeAddendum: IAddendum | null;
  clinicalVersion: IClinicalVersion;
  clinicalStatus: ICurrentClinicalStatus;
  mtbBaseUrl: string;
  activeView: Views;
  isAssignedCurator: boolean;
  isAssignedClinician: boolean;
  isPresentationMode: boolean;
  isReadOnly: boolean;
  unvalidatedDrugs: IExternalDrug[];
  error?: string;
  updateMTBChair: (user: IUser | null) => Promise<void>;
  updateAssignee: (
    assignee: keyof Pick<IClinicalVersionRaw, 'clinicianId' | 'curatorId' | 'cancerGeneticistId'>,
    user: IUser | null,
  ) => Promise<void>;
  assignClinicalReviewer: (
    user: IUser | null,
    group: Group,
  ) => Promise<void>;
  updateClinicalVersionStatus: (
    status: ClinicalStatus,
  ) => Promise<void>;
  updateClinicalHistory: (
    newClinHistory: string,
  ) => void;
  updateReviewStatus: (
    group: Group,
    status: ClinicalReviewStatus,
  ) => Promise<void>;
  updateDiscussionFields: (
    newFields: IUpdateDiscussionFields,
  ) => void;
  updateFrequencyUnits: (
    frequencyUnits: string,
  ) => void;
  updatePresentationModeScale: (
    presentationModeScale: number,
  ) => void;
  updatePresentationMode: () => void,
  getSlides: () => void,
  setSlides: Dispatch<SetStateAction<ISlideWithMetadata[]>>,
  updateSlideTableVisibilitySettings: <G extends SlideTableSettingsGroup>(
    group: G,
    settings: Partial<SlideTableGroupSettings<G>>,
  ) => Promise<void>;
}

export const ClinicalContext = createContext<IClinicalContext | undefined>(undefined);
ClinicalContext.displayName = 'ClinicalContext';

export const useClinical = (): IClinicalContext => {
  const ctx = useContext(ClinicalContext);

  if (!ctx) throw new Error('Clinical context is not available at this scope');

  if (ctx.error) throw new Error(ctx.error);

  return ctx;
};

export function ClinicalProvider({
  children,
  versionId,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const routeLocation = useLocation();
  const { clinicalVersionId: paramId } = useParams();
  const initialId = versionId ?? paramId;
  const {
    users,
    currentUser,
  } = useUser();
  const { patient, isReadOnly: isPatientReadOnly } = usePatient();
  const { analysisSet, isReadOnly: isAnalysisSetReadOnly } = useAnalysisSet();

  const [slides, setSlides] = useState<ISlideWithMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeAddendum, setActiveAddendum] = useState<IAddendum | null>(null);
  const [clinicalVersion, setClinicalVersion] = useState<IClinicalVersion>({} as IClinicalVersion);
  const [clinicalStatus, setClinicalStatus] = useState<ICurrentClinicalStatus>({} as ICurrentClinicalStatus);
  const [mtbBaseUrl, setMtbBaseUrl] = useState<string>('');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [isAssignedCurator, setIsAssignedCurator] = useState<boolean>(false);
  const [isAssignedClinician, setIsAssignedClinician] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [activeView, setActiveView] = useState<Views>(() => {
    const tokens = routeLocation.pathname.split('/');
    const newView = tokens[tokens.length - 1];

    if (newView === 'mtb' || newView === '') {
      return 'OVERVIEW';
    }

    return newView as Views;
  });
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

  const unvalidatedDrugs = useMemo(() => {
    const drugs = slides
      .flatMap((slide) => slide.recommendations)
      .filter((rec) => !!rec)
      .map((rec) => rec.therapy)
      .filter((therapy) => !!therapy)
      .flatMap((therapy) => therapy.drugs)
      .map(((therapyDrug) => therapyDrug.externalDrug))
      .filter((drug) => !!drug)
      .filter((drug) => !drug.isValidated);
    const uniqueDrugs = [
      ...new Map(drugs.map((drug) => [drug.versionId, drug])).values(),
    ];
    return uniqueDrugs;
  }, [slides]);

  const isFullScreen = useIsFullScreen();

  const getSlides = useCallback(async () => {
    if (clinicalVersion.id) {
      setLoading(true);
      try {
        const resp = await zeroDashSdk.mtb.slides.getSlidesByVersionId(
          clinicalVersion.id,
        );
        const hydratedSlides = await Promise.all(resp.map(async (slide) => ({
          ...slide,
          recommendations: slide.molAlterationGroupId
            ? await zeroDashSdk.mtb.recommendation.getAllRecommendations(
              clinicalVersion.id,
              {
                molAlterationGroupId: slide.molAlterationGroupId,
                slideId: slide.id,
              },
            ) : [],
          germlineSections: slide.alterations && slide.alterations.some((a) => a.mutationType.includes('GERMLINE'))
            ? await zeroDashSdk.mtb.slides.getSectionsBySlideId(clinicalVersion.id, slide.id)
            : [],
          clinicalInfo: slide.alterations && slide.alterations.some((a) => a.mutationType.includes('GERMLINE'))
            ? await zeroDashSdk.mtb.clinicalInfo.getClinicalInformation(clinicalVersion.id, slide.id)
            : [],
        })));
        setSlides(hydratedSlides as ISlideWithMetadata[]);
      } catch {
        enqueueSnackbar('Could not fetch slides, please try again', { variant: 'error' });
        setSlides([]);
      } finally {
        setLoading(false);
      }
    }
  }, [
    enqueueSnackbar,
    clinicalVersion.id,
    zeroDashSdk.mtb.slides,
    zeroDashSdk.mtb.clinicalInfo,
    zeroDashSdk.mtb.recommendation,
  ]);

  const getClinicalVersion = useCallback(async (): Promise<void> => {
    if (!initialId) return;
    try {
      const clinicalVersionRaw = initialId === 'latest'
        ? await zeroDashSdk.mtb.clinical.getLatestClinicalVersion(analysisSet.analysisSetId)
        : await zeroDashSdk.mtb.clinical.getClinicalVersionById(
          initialId,
        );
      const clinicalVersionFull: IClinicalVersion = {
        ...clinicalVersionRaw,
        mtbChair: null,
        clinician: null,
        reviewers: [],
        curator: null,
        cancerGeneticist: null,
      };

      const mtbChairId = clinicalVersionRaw.meetings.find((r) => r.type === 'MTB')?.chairId;
      if (mtbChairId) {
        const user = users.find((u) => u.id === mtbChairId);
        clinicalVersionFull.mtbChair = user || null;
      }
      if (clinicalVersionRaw.curatorId) {
        const user = users.find((u) => u.id === clinicalVersionRaw.curatorId);
        clinicalVersionFull.curator = user || null;
      }
      if (clinicalVersionRaw.clinicianId) {
        const user = users.find((u) => u.id === clinicalVersionRaw.clinicianId);
        clinicalVersionFull.clinician = user || null;
      }
      if (clinicalVersionRaw.cancerGeneticistId) {
        const user = users.find((u) => u.id === clinicalVersionRaw.cancerGeneticistId);
        clinicalVersionFull.cancerGeneticist = user || null;
      }

      // Fetch reviewers
      if (
        clinicalVersionRaw.reviewerIds
        && clinicalVersionRaw.reviewerIds?.length > 0
      ) {
        for (const rev of clinicalVersionRaw.reviewerIds) {
          const user = users.find((u) => u.id === rev.reviewerId);
          clinicalVersionFull.reviewers.push({
            ...rev,
            user,
          });
        }
      }

      // Check for assigned user or reviewer
      const clinicianGroups: Group[] = ['Clinicians', 'CancerGeneticists', 'MolecularOncologists', 'ClinicalFellows'];
      const isReviewingClinician = clinicalVersionFull.reviewers.some((r) => (
        r.reviewerId === currentUser?.id && clinicianGroups.includes(r.group)
      ));
      const isReviewingCurator = clinicalVersionFull.reviewers.some((r) => (
        r.reviewerId === currentUser?.id && r.group === 'Curators'
      ));
      setIsAssignedClinician(
        clinicalVersionFull.clinician?.id === currentUser?.id
        || clinicalVersionFull.cancerGeneticist?.id === currentUser?.id
        || isReviewingClinician,
      );
      setIsAssignedCurator(clinicalVersionFull.curator?.id === currentUser?.id || isReviewingCurator);

      setClinicalStatus(clinicalStatuses[clinicalVersionFull.status]);
      setMtbBaseUrl(`${patient.patientId}/${analysisSet.analysisSetId}/clinical/${clinicalVersionFull.id}/mtb`);
      setClinicalVersion(clinicalVersionFull);
    } catch {
      setError('Clinical version not found');
    }
  }, [
    initialId,
    currentUser?.id,
    analysisSet.analysisSetId,
    patient.patientId,
    users,
    // zeroDashSdk.mtb.addendum,
    zeroDashSdk.mtb.clinical,
  ]);

  useEffect(() => {
    getSlides();
    getClinicalVersion();
  }, [getClinicalVersion, getSlides]);

  const updateClinicalHistory = useCallback((newClinHistory: string): void => {
    if (clinicalVersion) {
      setClinicalVersion({
        ...clinicalVersion,
        clinicalHistory: newClinHistory,
      });
    }
  }, [clinicalVersion]);

  const updateMTBChair = useCallback(async (user: IUser | null) => {
    await zeroDashSdk.meetings.updateClinicalMeetingChair(clinicalVersion.id, { type: 'MTB', chairId: user?.id ?? null });
    if (user !== null) {
      setClinicalVersion((prev) => {
        const newReview: IReviewWithUser = {
          reviewerId: user.id,
          group: 'MTBChairs',
          status: 'Assigned',
          user,
        };

        return {
          ...prev,
          mtbChair: user,
          reviewers: [
            ...prev.reviewers.filter((r) => r.group !== 'MTBChairs'),
            newReview,
          ],
        };
      });
    } else if (user === null) {
      setClinicalVersion((prev) => ({
        ...prev,
        mtbChair: user,
        reviewers: prev.reviewers.filter((r) => r.group !== 'MTBChairs'),
      }));
    }
  }, [clinicalVersion.id, zeroDashSdk.meetings]);

  const updateAssignee = useCallback(async (
    assignee: keyof Pick<IClinicalVersionRaw, 'clinicianId' | 'curatorId' | 'cancerGeneticistId'>,
    user: IUser | null,
  ): Promise<void> => {
    await zeroDashSdk.mtb.clinical.updateClinicalVersionData(
      clinicalVersion.id,
      {
        [assignee]: user?.id || null,
      },
    );
    setClinicalVersion((prev) => ({
      ...prev,
      clinician: assignee === 'clinicianId' ? user : prev.clinician,
      curator: assignee === 'curatorId' ? user : prev.curator,
      cancerGeneticist: assignee === 'cancerGeneticistId' ? user : prev.cancerGeneticist,
    }));
  }, [clinicalVersion.id, zeroDashSdk.mtb.clinical]);

  const assignClinicalReviewer = useCallback(async (
    user: IUser | null,
    group: Group,
  ): Promise<void> => {
    // always remove the old reviewer
    await zeroDashSdk.mtb.clinical.removeReviewer(clinicalVersion.id, group);
    if (user !== null) {
      await zeroDashSdk.mtb.clinical.addReviewer(clinicalVersion.id, {
        reviewerId: user.id,
        group,
      });
      setClinicalVersion((prev) => {
        const newReview: IReviewWithUser = {
          reviewerId: user.id,
          group,
          status: 'Assigned',
          user,
        };

        return {
          ...prev,
          reviewers: [
            ...prev.reviewers.filter((r) => r.group !== group),
            newReview,
          ],
        };
      });
    // If removing existing reviewer
    } else if (user === null) {
      setClinicalVersion((prev) => ({
        ...prev,
        reviewers: prev.reviewers.filter((r) => r.group !== group),
      }));
    }
  }, [clinicalVersion.id, zeroDashSdk.mtb.clinical]);

  const updateReviewStatus = useCallback(async (
    group: Group,
    status: ClinicalReviewStatus,
  ): Promise<void> => {
    if (!clinicalVersion.id) return;
    await zeroDashSdk.mtb.clinical.updateReviewStatus(clinicalVersion.id, group, status);
    setClinicalVersion((prev) => ({
      ...prev,
      reviewers: prev.reviewers.map((r) => ({
        ...r,
        status: r.group === group ? status : r.status,
      })),
    }));
  }, [clinicalVersion.id, zeroDashSdk.mtb.clinical]);

  const updateDiscussionFields = useCallback(({
    discussionTitle,
    discussionNote,
    discussionColumns,
  }: IUpdateDiscussionFields): void => {
    setClinicalVersion((prev) => ({
      ...prev,
      discussionTitle: discussionTitle || prev.discussionTitle,
      discussionNote: discussionNote || prev.discussionNote,
      discussionColumns: discussionColumns || prev.discussionColumns,
    }));
  }, []);

  const updateClinicalVersionStatus = useCallback(async (
    status: ClinicalStatus,
  ): Promise<void> => {
    try {
      if (!clinicalVersion.id) return;
      await zeroDashSdk.mtb.clinical.updateClinicalVersionData(clinicalVersion.id, { status });
      setClinicalStatus(clinicalStatuses[status]);
      setClinicalVersion((prev) => ({
        ...prev,
        status,
      }));
    } catch (err) {
      console.error(err);
    }
  }, [clinicalVersion.id, zeroDashSdk.mtb.clinical]);

  const updateFrequencyUnits = useCallback(async (
    frequencyUnits: string,
  ): Promise<void> => {
    if (!clinicalVersion.id) return;
    try {
      await zeroDashSdk.mtb.clinical.updateClinicalVersionData(clinicalVersion.id, { frequencyUnits });
      setClinicalVersion((prev) => ({
        ...prev,
        frequencyUnits,
      }));
    } catch (err) {
      console.error(err);
    }
  }, [clinicalVersion.id, zeroDashSdk.mtb.clinical]);

  const updatePresentationModeScale = useCallback(async (
    difference: number,
  ): Promise<void> => {
    if (!clinicalVersion.id) return;
    try {
      const presentationModeScale = clinicalVersion.presentationModeScale + difference;
      zeroDashSdk.mtb.clinical.updateClinicalVersionData(clinicalVersion.id, { presentationModeScale });
      setClinicalVersion((prev) => ({
        ...prev,
        presentationModeScale,
      }));
    } catch {
      enqueueSnackbar('Could not update presentation scale.', { variant: 'error' });
    }
  }, [clinicalVersion.presentationModeScale, enqueueSnackbar, clinicalVersion.id, zeroDashSdk.mtb.clinical]);

  const updateSlideTableVisibilitySettings = useCallback(
    async <G extends SlideTableSettingsGroup>(
      group: G,
      settings: Partial<SlideTableGroupSettings<G>>,
    ): Promise<void> => {
      if (!clinicalVersion.id) return;
      const slideTableSettings = {
        ...clinicalVersion.slideTableSettings,
        [group]: {
          ...clinicalVersion.slideTableSettings?.[group],
          ...settings,
        },
      };

      try {
        await zeroDashSdk.mtb.clinical.updateClinicalVersionData(
          clinicalVersion.id,
          { slideTableSettings },
        );
        setClinicalVersion((prev) => ({
          ...prev,
          slideTableSettings,
        }));
      } catch {
        enqueueSnackbar('Unable to update settings, please try again', { variant: 'error' });
      }
    },
    [
      clinicalVersion.slideTableSettings,
      enqueueSnackbar,
      clinicalVersion.id,
      zeroDashSdk.mtb.clinical,
    ],
  );

  useEffect(() => {
    setActiveView(() => {
      const tokens = routeLocation.pathname.split('/');
      const newView = tokens[tokens.length - 1];

      if (newView === 'mtb' || newView === '') {
        return 'OVERVIEW';
      }

      return newView as Views;
    });
  }, [routeLocation.pathname]);

  const updatePresentationMode = useCallback((): void => {
    setIsPresentationMode((prev) => !prev);
  }, []);

  useEffect(() => {
    // enter and exit full screen when in presentation mode
    if (isPresentationMode) {
      document.body.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [isPresentationMode]);

  useEffect(() => {
    // exit presentation mode if no longer full screen.
    if (!isFullScreen) {
      setIsPresentationMode(false);
    }
  }, [isFullScreen]);

  // exit full screen when clinical context is initialised
  // this is to fix an issue where full screen triggered randomly
  // when you opened a case
  useEffect(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    setIsReadOnly(
      clinicalStatus.readonly
      || isAnalysisSetReadOnly
      || isPatientReadOnly,
    );
  }, [clinicalStatus.readonly, isAnalysisSetReadOnly, isPatientReadOnly]);

  const val = useMemo(() => ({
    slides,
    loading,
    activeAddendum,
    clinicalVersion,
    clinicalStatus,
    mtbBaseUrl,
    activeView,
    isAssignedCurator,
    isAssignedClinician,
    isPresentationMode,
    isReadOnly,
    unvalidatedDrugs,
    error,
    updateMTBChair,
    updateAssignee,
    assignClinicalReviewer,
    updateClinicalHistory,
    updateReviewStatus,
    updateDiscussionFields,
    updateFrequencyUnits,
    updatePresentationModeScale,
    updateClinicalVersionStatus,
    updatePresentationMode,
    getSlides,
    setSlides,
    updateSlideTableVisibilitySettings,
  }), [
    slides,
    loading,
    activeAddendum,
    updateAssignee,
    assignClinicalReviewer,
    clinicalVersion,
    clinicalStatus,
    error,
    updateMTBChair,
    isAssignedCurator,
    isAssignedClinician,
    isPresentationMode,
    isReadOnly,
    unvalidatedDrugs,
    mtbBaseUrl,
    activeView,
    updateClinicalHistory,
    updateClinicalVersionStatus,
    updateDiscussionFields,
    updateFrequencyUnits,
    updatePresentationModeScale,
    updatePresentationMode,
    updateReviewStatus,
    getSlides,
    setSlides,
    updateSlideTableVisibilitySettings,
  ]);

  return (
    <ClinicalContext.Provider
      value={val}
    >
      {children}
    </ClinicalContext.Provider>
  );
}
