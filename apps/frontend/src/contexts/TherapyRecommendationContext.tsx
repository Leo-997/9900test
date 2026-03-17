import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
  type JSX,
} from 'react';
import { v4 } from 'uuid';
import useEvidences from '@/api/useEvidences';
import { clinicalReportTypes } from '@/constants/Reports/reports';
import { ITherapyTrial } from '@/types/Drugs/Trials.types';
import { ReportType } from '@/types/Reports/Reports.types';
import { appendNewlineRTE } from '@/utils/editor/appendNewlineRTE';
import { trimRTEValue } from '@/utils/editor/trimRTEValue';
import { getGeneOrNonGene } from '@/utils/functions/getGeneOrNonGeneBasedAlteration';
import { defaultTier } from '../constants/MTB/tier';
import {
  ICreateReportDrug, IEditTherapyDrug,
  IUpdateEditTherapyDrug,
} from '../types/Drugs/Drugs.types';
import { IMolecularAlterationDetail } from '../types/MTB/MolecularAlteration.types';
import {
  ICreateRecommendationLink,
  ICreateTherapyRecommendation,
  IFetchRecommendation,
  RecommendationLinkEntity,
  TierType,
} from '../types/MTB/Recommendation.types';
import { ITherapyBase, ITherapyOption } from '../types/Therapies/CommonTherapies.types';
import getTierFromString from '../utils/functions/getTierFromString';
import getTierString from '../utils/functions/getTierString';
import { useClinical } from './ClinicalContext';
import { useZeroDashSdk } from './ZeroDashSdkContext';

interface IProps {
  entity?: RecommendationLinkEntity;
  existingRec?: IFetchRecommendation;
  children: ReactNode;
}

interface ITherapyRecommendationContext {
  entity?: RecommendationLinkEntity;
  existingRec?: IFetchRecommendation;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  tier: TierType;
  setTier: Dispatch<SetStateAction<TierType>>;
  targets: IMolecularAlterationDetail[];
  setTargets: Dispatch<SetStateAction<IMolecularAlterationDetail[]>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  selectedTherapyDrugs: IEditTherapyDrug[];
  selectedTherapyTrials: ITherapyTrial[];
  setSelectedTherapyTrials: Dispatch<SetStateAction<ITherapyTrial[]>>;
  selectedEvidence: string[];
  setSelectedEvidence: Dispatch<SetStateAction<string[]>>;
  activeTherapyDrugIndex: number;
  setActiveTherapyDrugIndex: Dispatch<SetStateAction<number>>;
  chemotherapy: ITherapyOption;
  radiotherapy: ITherapyOption;
  resetTherapy: () => void;
  addTherapyDrug: () => void;
  updateActiveTherapyDrug: (updatedFields: IUpdateEditTherapyDrug) => void;
  deleteTherapyDrug: (index: number) => void;
  addRecommendation: (links?: Omit<ICreateRecommendationLink, 'recommendationId'>[]) => Promise<string | null>;
  updateRecommendation: () => Promise<string | null>;
  updateTitlePrefilling: (
    drugs: IEditTherapyDrug[],
    chemotherapyIncluded: boolean,
    radiotherapyIncluded: boolean,
    recTargets: IMolecularAlterationDetail[],
    recTier: TierType
  ) => void;
  updateTherapy: (
    type: keyof Pick<ITherapyBase, 'chemotherapy' | 'radiotherapy'>,
    newOption: ITherapyOption,
  ) => void;
}

export const TherapyRecommendationContext = createContext<
  ITherapyRecommendationContext | undefined
>(undefined);
TherapyRecommendationContext.displayName = 'TherapyRecommendationContext';

export const useTherapyRecommendation = (): ITherapyRecommendationContext => {
  const ctx = useContext(TherapyRecommendationContext);

  if (!ctx) throw new Error('Therapy recommendation context is not available at this scope');

  return ctx;
};

export function TherapyRecommendationProvider({
  entity,
  existingRec,
  children,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { clinicalVersion } = useClinical();
  const { updateRecommendationEvidence } = useEvidences();

  const [title, setTitle] = useState<string>(existingRec?.title || '');
  const [targets, setTargets] = useState<IMolecularAlterationDetail[]>(
    existingRec?.targets || [],
  );
  const [description, setDescription] = useState<string>(
    existingRec ? appendNewlineRTE(existingRec.description) : '',
  );
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>(
    existingRec?.evidence ?? [],
  );
  const [tier, setTier] = useState<TierType>(() => getTierFromString(existingRec?.tier));
  const [chemotherapy, setChemotherapy] = useState<ITherapyOption>({
    includeOption: existingRec?.therapy?.chemotherapy || false,
    note: existingRec?.therapy?.chemotherapyNote,
  });
  const [radiotherapy, setRadiotherapy] = useState<ITherapyOption>({
    includeOption: existingRec?.therapy?.radiotherapy || false,
    note: existingRec?.therapy?.radiotherapyNote,
  });

  const [selectedTherapyDrugs, setSelectedTherapyDrugs] = useState<IEditTherapyDrug[]>(
    existingRec?.therapy?.drugs.map((therapyDrug) => ({
      id: therapyDrug.id,
      class: therapyDrug.class,
      drug: therapyDrug.externalDrug,
    })) ?? [],
  );

  const [
    activeTherapyDrugIndex,
    setActiveTherapyDrugIndex,
  ] = useState<number>(existingRec ? 0 : -1);

  const [
    selectedTherapyTrials,
    setSelectedTherapyTrials,
  ] = useState<ITherapyTrial[]>(existingRec?.therapy?.trials ?? []);

  const getTherapyDrugName = useCallback((therapyDrug: IEditTherapyDrug) => {
    const drugName = therapyDrug.drug?.name;
    const className = therapyDrug.class?.name;
    let drug = '';
    if (drugName && className) drug = `${drugName} (${className})`;
    if (drugName && !className) drug = drugName;
    if (!drugName && className) drug = className;
    return drug;
  }, []);

  const updateTitlePrefilling = useCallback((
    drugs: IEditTherapyDrug[],
    chemotherapyIncluded: boolean,
    radiotherapyIncluded: boolean,
    recTargets: IMolecularAlterationDetail[],
    recTier: TierType,
  ): void => {
    setTitle(() => {
      const drugsAndTherapyDetails = drugs.map(getTherapyDrugName);
      if (chemotherapyIncluded) drugsAndTherapyDetails.push('Chemotherapy');
      if (radiotherapyIncluded) drugsAndTherapyDetails.push('Radiotherapy');
      let prefillTitle = drugsAndTherapyDetails.join(' + ');
      const alterations = recTargets.map((target) => getGeneOrNonGene(target));
      if (alterations.length > 0) {
        prefillTitle += `${drugsAndTherapyDetails.length > 0 ? ' for ' : ''}${alterations.join(', ')} alteration${alterations.length > 1 ? 's' : ''}`;
      }
      const tierString = getTierString(recTier);
      if (tierString) {
        prefillTitle += tierString === 'No tier' ? ` (${tierString})` : ` (Tier ${tierString})`;
      }
      return prefillTitle;
    });
  }, [getTherapyDrugName]);

  const addRecommendation = useCallback(
    async (links?: Omit<ICreateRecommendationLink, 'recommendationId'>[]): Promise<string | null> => {
      try {
        const newId = await zeroDashSdk
          .mtb
          .recommendation
          .addRecommendation<ICreateTherapyRecommendation>(clinicalVersion.id, {
            type: 'THERAPY',
            title,
            tier: getTierString(tier),
            description: trimRTEValue(description),
            targets: targets.map((t) => t.id) || [],
            therapy: {
              chemotherapy: chemotherapy.includeOption,
              radiotherapy: radiotherapy.includeOption,
              chemotherapyNote: chemotherapy.note,
              radiotherapyNote: radiotherapy.note,
              drugs: selectedTherapyDrugs.map((selectedTherapyDrug) => ({
              // all classes will always be selected if add or update recommendation can be clicked
                externalDrugClassId: selectedTherapyDrug.class?.id as string,
                externalDrugVersionId: selectedTherapyDrug.drug?.versionId,
              })),
              trials: selectedTherapyTrials.map(({ note, externalTrial }) => ({
                note,
                externalTrialId: externalTrial.id,
              })),
            },
            evidence: selectedEvidence,
            links,
          });
        // link RTE inline citations to recommendation
        updateRecommendationEvidence(description, newId, clinicalVersion.id);

        // link drugs to report
        if (
          entity
          && entity.entityType === 'REPORT'
          && clinicalReportTypes.includes(entity.entityId as ReportType)
        ) {
          const recDrugExternalVersionIds = selectedTherapyDrugs
            .map((therapyDrug) => therapyDrug.drug?.versionId)
            .filter((drug) => drug !== undefined);

          await Promise.all(recDrugExternalVersionIds.map((externalDrugVersionId) => {
            const newClinicalDrug: ICreateReportDrug = {
              externalDrugVersionId,
              reportType: entity.entityId as ReportType,
            };
            return zeroDashSdk.mtb.drugs
              .createReportDrug(
                clinicalVersion.id,
                { ...newClinicalDrug, pbsApproved: false, appropriateTrial: false },
              );
          }));
        }

        return newId;
      } catch {
        return null;
      }
    },
    [
      selectedTherapyTrials,
      entity,
      zeroDashSdk.mtb.drugs,
      updateRecommendationEvidence,
      clinicalVersion.id,
      title,
      description,
      selectedTherapyDrugs,
      selectedEvidence,
      targets,
      tier,
      chemotherapy,
      radiotherapy,
      zeroDashSdk.mtb.recommendation,
    ],
  );

  /**
   *  1. Create a new recommendation with the updated information
   *  2. Delete the old recommendation
   *  3. Update the list of slide recommendations
   */
  const updateRecommendation = useCallback(
    async (): Promise<string | null> => {
      const newId = await addRecommendation(
        existingRec?.links?.map((l) => ({
          ...l,
          recommendationId: undefined,
          order: l.order ?? undefined,
          clinicalVersionId: undefined,
        })),
      );
      if (existingRec) {
        await zeroDashSdk.mtb.recommendation.deleteRecommendation(
          clinicalVersion.id,
          existingRec.id,
        );

        return newId;
      }

      return null;
    },
    [addRecommendation, clinicalVersion.id, existingRec, zeroDashSdk.mtb.recommendation],
  );

  const deleteTherapyDrug = useCallback((index): void => {
    const maxIndex = selectedTherapyDrugs.length - 1;
    setActiveTherapyDrugIndex((prev) => {
      if (index > prev) {
        return prev;
      }
      if (index === prev) {
        return index === maxIndex ? index - 1 : index;
      }
      return prev - 1;
    });
    setSelectedTherapyDrugs((prev) => {
      const newDrugs = prev.filter((d, i) => i !== index);
      updateTitlePrefilling(
        newDrugs,
        chemotherapy.includeOption,
        radiotherapy.includeOption,
        targets,
        tier,
      );
      return newDrugs;
    });
  }, [
    chemotherapy.includeOption,
    radiotherapy.includeOption,
    targets,
    tier,
    updateTitlePrefilling,
    selectedTherapyDrugs.length,
  ]);

  const updateActiveTherapyDrug = useCallback((updatedFields: IUpdateEditTherapyDrug): void => {
    const newActiveTherapyDrug: IEditTherapyDrug = activeTherapyDrugIndex === -1
      ? {
        id: v4(),
        class: null,
        drug: null,
      } : selectedTherapyDrugs[activeTherapyDrugIndex];
    Object.keys(updatedFields).forEach((key) => {
      if (updatedFields[key] !== undefined) {
        newActiveTherapyDrug[key] = updatedFields[key];
      }
    });
    if (newActiveTherapyDrug.class === null && newActiveTherapyDrug.drug === null) {
      deleteTherapyDrug(activeTherapyDrugIndex);
      setActiveTherapyDrugIndex(-1);
      return;
    }
    setSelectedTherapyDrugs((prev) => {
      const newDrugs = [...prev];
      if (activeTherapyDrugIndex === -1) {
        newDrugs.push(newActiveTherapyDrug);
      } else {
        newDrugs[activeTherapyDrugIndex] = newActiveTherapyDrug;
      }
      updateTitlePrefilling(
        newDrugs,
        chemotherapy.includeOption,
        radiotherapy.includeOption,
        targets,
        tier,
      );
      return newDrugs;
    });
    setActiveTherapyDrugIndex((prev) => (prev === -1 ? selectedTherapyDrugs.length : prev));
  }, [
    activeTherapyDrugIndex,
    chemotherapy.includeOption,
    deleteTherapyDrug,
    radiotherapy.includeOption,
    selectedTherapyDrugs,
    targets,
    tier,
    updateTitlePrefilling,
  ]);

  const updateTherapy = useCallback((
    type: keyof Pick<ITherapyBase, 'chemotherapy' | 'radiotherapy'>,
    newOption: ITherapyOption,
  ): void => {
    if (type === 'chemotherapy') setChemotherapy(newOption);
    if (type === 'radiotherapy') setRadiotherapy(newOption);

    updateTitlePrefilling(
      selectedTherapyDrugs,
      type === 'chemotherapy' ? newOption.includeOption : chemotherapy.includeOption,
      type === 'radiotherapy' ? newOption.includeOption : radiotherapy.includeOption,
      targets,
      tier,
    );
  }, [
    chemotherapy.includeOption,
    radiotherapy.includeOption,
    selectedTherapyDrugs,
    targets,
    tier,
    updateTitlePrefilling,
  ]);

  const addTherapyDrug = useCallback(() => {
    setActiveTherapyDrugIndex(-1);
  }, []);

  const resetTherapy = useCallback(() => {
    setTier(defaultTier);
    setTargets([]);
    setDescription('');
    setSelectedTherapyDrugs([]);
    setSelectedTherapyTrials([]);
    setActiveTherapyDrugIndex(-1);
    setSelectedEvidence([]);
    setChemotherapy({ includeOption: false });
    setRadiotherapy({ includeOption: false });
  }, []);

  const val = useMemo(() => ({
    entity,
    existingRec,
    title,
    setTitle,
    tier,
    setTier,
    targets,
    setTargets,
    description,
    setDescription,
    selectedTherapyDrugs,
    setSelectedTherapyDrugs,
    selectedTherapyTrials,
    setSelectedTherapyTrials,
    selectedEvidence,
    setSelectedEvidence,
    activeTherapyDrugIndex,
    setActiveTherapyDrugIndex,
    chemotherapy,
    setChemotherapy,
    radiotherapy,
    setRadiotherapy,
    resetTherapy,
    addTherapyDrug,
    updateActiveTherapyDrug,
    deleteTherapyDrug,
    addRecommendation,
    updateRecommendation,
    updateTitlePrefilling,
    updateTherapy,
  }), [
    entity,
    existingRec,
    title,
    setTitle,
    tier,
    setTier,
    targets,
    setTargets,
    description,
    setDescription,
    selectedTherapyDrugs,
    setSelectedTherapyDrugs,
    selectedTherapyTrials,
    setSelectedTherapyTrials,
    selectedEvidence,
    setSelectedEvidence,
    activeTherapyDrugIndex,
    setActiveTherapyDrugIndex,
    chemotherapy,
    setChemotherapy,
    radiotherapy,
    setRadiotherapy,
    resetTherapy,
    addTherapyDrug,
    updateActiveTherapyDrug,
    deleteTherapyDrug,
    addRecommendation,
    updateRecommendation,
    updateTitlePrefilling,
    updateTherapy,
  ]);

  return (
    <TherapyRecommendationContext.Provider
      value={val}
    >
      {children}
    </TherapyRecommendationContext.Provider>
  );
}
