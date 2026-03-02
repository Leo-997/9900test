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
import useEvidences from '@/api/useEvidences';
import { ICreateReportDrug } from '@/types/Drugs/Drugs.types';
import { ReportType } from '@/types/Reports/Reports.types';
import { appendNewlineRTE } from '@/utils/editor/appendNewlineRTE';
import { trimRTEValue } from '@/utils/editor/trimRTEValue';
import { defaultTier } from '../constants/MTB/tier';
import { IMolecularAlterationDetail } from '../types/MTB/MolecularAlteration.types';
import {
  CreateRecommendation,
  ICreateGroupRecommendation,
  ICreateRecommendationLink,
  ICreateTherapyRecommendation,
  IFetchRecommendation,
  RecommendationLinkEntity,
  TierType,
} from '../types/MTB/Recommendation.types';
import getTierFromString from '../utils/functions/getTierFromString';
import getTierString from '../utils/functions/getTierString';
import { useClinical } from './ClinicalContext';
import { useZeroDashSdk } from './ZeroDashSdkContext';

interface IProps {
  entity: RecommendationLinkEntity;
  existingRec?: IFetchRecommendation;
  children: ReactNode;
}

interface IGroupRecommendationContext {
  entity: RecommendationLinkEntity;
  existingRec?: IFetchRecommendation;
  tier: TierType;
  setTier: Dispatch<SetStateAction<TierType>>;
  showIndividualTiers: boolean;
  setShowIndividualTiers: Dispatch<SetStateAction<boolean>>;
  allTargets: IMolecularAlterationDetail[];
  setAllTargets: Dispatch<SetStateAction<IMolecularAlterationDetail[]>>;
  selectedTargets: IMolecularAlterationDetail[];
  setSelectedTargets: Dispatch<SetStateAction<IMolecularAlterationDetail[]>>;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  newReportRecs: IFetchRecommendation[];
  setNewReportRecs: Dispatch<SetStateAction<IFetchRecommendation[]>>;
  reportRecs: IFetchRecommendation[];
  setReportRecs: Dispatch<SetStateAction<IFetchRecommendation[]>>;
  selectedSlideRecs: IFetchRecommendation[];
  setSelectedSlideRecs: Dispatch<SetStateAction<IFetchRecommendation[]>>;
  reportMolAlterations: IMolecularAlterationDetail[];
  setMolReportAlterations: Dispatch<SetStateAction<IMolecularAlterationDetail[]>>;
  resetDetails: () => void;
  addRecommendation: (links?: Omit<ICreateRecommendationLink, 'recommendationId'>[]) => Promise<string | null>;
  updateRecommendation?: () => Promise<string | null>;
}

export const GroupRecommendationContext = createContext<
  IGroupRecommendationContext | undefined
>(undefined);
GroupRecommendationContext.displayName = 'GroupRecommendationContext';

export const useGroupRecommendation = (): IGroupRecommendationContext => {
  const ctx = useContext(GroupRecommendationContext);

  if (!ctx) throw new Error('Group recommendation context is not available at this scope');

  return ctx;
};

export function GroupRecommendationProvider({
  entity,
  existingRec,
  children,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { clinicalVersion } = useClinical();
  const { updateRecommendationEvidence } = useEvidences();

  const [tier, setTier] = useState<TierType>(() => getTierFromString(existingRec?.tier));
  const [allTargets, setAllTargets] = useState<IMolecularAlterationDetail[]>(
    existingRec?.targets || [],
  );
  const [selectedTargets, setSelectedTargets] = useState<IMolecularAlterationDetail[]>(
    existingRec?.targets || [],
  );
  const [title, setTitle] = useState<string>(existingRec?.title ?? '');
  const [description, setDescription] = useState<string>(
    existingRec ? appendNewlineRTE(existingRec.description) : '',
  );

  // new temporary recs in report group rec
  const [newReportRecs, setNewReportRecs] = useState<IFetchRecommendation[]>([]);
  // existing report recs in report group rec
  const [reportRecs, setReportRecs] = useState<IFetchRecommendation[]>(
    existingRec?.recommendations?.filter((rec) => rec.links?.length === 0) ?? [],
  );
  // exsting slide recs in report group rec
  const [selectedSlideRecs, setSelectedSlideRecs] = useState<IFetchRecommendation[]>(
    existingRec?.recommendations?.filter((rec) => rec.links?.length !== 0) ?? [],
  );

  const [showIndividualTiers, setShowIndividualTiers] = useState<boolean>(
    existingRec?.showIndividualTiers ?? true,
  );

  const [
    reportMolAlterations,
    setMolReportAlterations,
  ] = useState<IMolecularAlterationDetail[]>([]);

  const resetDetails = useCallback(() => {
    setTier(defaultTier);
    setShowIndividualTiers(existingRec?.showIndividualTiers ?? true);
    setTitle('');
    setDescription('');
    setSelectedSlideRecs([]);
    setSelectedTargets([]);
  }, [existingRec]);

  // convert temporary recs of type IFetchRecommendation
  // to ICreateRecommendation when submiting group recommendation
  const tempFetchRecToCreateRec = useCallback((
    rec: IFetchRecommendation,
  ): CreateRecommendation | null => {
    switch (rec.type) {
      case 'THERAPY':
        return {
          type: 'THERAPY',
          title: rec.title,
          description: rec.description,
          tier: rec.tier,
          targets: rec.targets?.map((t) => t.id) ?? [],
          evidence: rec.evidence,
          therapy: {
            chemotherapy: rec.therapy?.chemotherapy ?? false,
            radiotherapy: rec.therapy?.radiotherapy ?? false,
            chemotherapyNote: rec.therapy?.chemotherapyNote,
            radiotherapyNote: rec.therapy?.radiotherapyNote,
            drugs: rec.therapy?.drugs.map((drug) => ({
              externalDrugClassId: drug.class.id as string,
              externalDrugVersionId: drug.externalDrugVersionId ?? undefined,
            })) ?? [],
            trials: rec.therapy?.trials.map(({ note, externalTrial }) => ({
              note,
              externalTrialId: externalTrial.id,
            })) ?? [],
          },
        };
      case 'CHANGE_DIAGNOSIS':
        return {
          type: 'CHANGE_DIAGNOSIS',
          title: rec.title,
          description: rec.description,
          zero2Category: rec.zero2Category,
          zero2Subcat1: rec.zero2Subcat1,
          zero2Subcat2: rec.zero2Subcat2,
          zero2FinalDiagnosis: rec.zero2FinalDiagnosis,
          targets: rec.targets?.map((t) => t.id) ?? [],
        };
      case 'GERMLINE':
        return {
          type: 'GERMLINE',
          title: rec.title,
          description: rec.description,
          germlineRecOptions: rec.germlineRecOptions,
        };
      case 'TEXT':
        return {
          type: 'TEXT',
          title: rec.title,
          description: rec.description,
        };
      default:
        return null;
    }
  }, []);

  // update edited existing recs in backend before submitting group rec
  const updateReportRecommendation = useCallback(async (
    rec: IFetchRecommendation,
  ): Promise<string> => {
    const previousId = rec.id.split('/')[1];
    switch (rec.type) {
      case 'TEXT':
        await zeroDashSdk.mtb.recommendation.updateRecommendation(
          clinicalVersion.id,
          previousId,
          {
            title: rec.title,
            description: rec.description,
          },
        );
        return previousId;
      case 'CHANGE_DIAGNOSIS':
        await zeroDashSdk.mtb.recommendation.updateRecommendation(
          clinicalVersion.id,
          previousId,
          {
            title: rec.title,
            description: rec.description,
            zero2Category: rec.zero2Category,
            zero2Subcat1: rec.zero2Subcat1,
            zero2Subcat2: rec.zero2Subcat2,
            zero2FinalDiagnosis: rec.zero2FinalDiagnosis,
            targets: rec.targets?.map((t) => t.id),
          },
        );
        return previousId;
      case 'GERMLINE':
        await zeroDashSdk.mtb.recommendation.updateRecommendation(
          clinicalVersion.id,
          previousId,
          {
            title: rec.title,
            description: rec.description,
            germlineRecOptions: rec.germlineRecOptions,
          },
        );
        return previousId;
      case 'THERAPY':
        // eslint-disable-next-line no-case-declarations
        const newId = await zeroDashSdk
          .mtb
          .recommendation
          .addRecommendation<ICreateTherapyRecommendation>(
            clinicalVersion.id,
            tempFetchRecToCreateRec(rec) as ICreateTherapyRecommendation,
          );
        await zeroDashSdk.mtb.recommendation.deleteRecommendation(
          clinicalVersion.id,
          previousId,
        );
        return newId;
      default:
        return '';
    }
  }, [clinicalVersion.id, tempFetchRecToCreateRec, zeroDashSdk.mtb.recommendation]);

  /**
   *  1. get ids of selected recs from slides
   *  2. If in report, add new report recs, which are either
   *     created from 'Add Recommendation' or 'copy with updates', to backend
   *  3. If in report, update edited existing report recs and existing report rec lists
   *  4. Update the rec list of group rec
   */
  const addRecommendation = useCallback(async (
    links?: Omit<ICreateRecommendationLink, 'recommendationId'>[],
  ): Promise<string | null> => {
    try {
      let recIds = selectedSlideRecs.map((r) => r.id);
      if (entity.entityType === 'REPORT') {
        // add new report recommendations
        const newReportRecIds = await Promise.all(
          newReportRecs.map(
            (rec) => zeroDashSdk.mtb.recommendation.addRecommendation<CreateRecommendation>(
              clinicalVersion.id,
              tempFetchRecToCreateRec(rec) as CreateRecommendation,
            ),
          ),
        );
        // update existing report recommendations in group recommendation
        // only existing group recommendations have existing report recommendations
        const reportRecIds = await Promise.all(
          reportRecs.map(
            (rec) => {
              if (rec.id.startsWith('temp')) {
                return updateReportRecommendation(rec);
              }
              return rec.id;
            },
          ),
        );
        recIds = [...newReportRecIds, ...reportRecIds, ...recIds];

        // link drugs in all child therapy recs to this report
        const recDrugExternalVersionIds = [...newReportRecs, ...reportRecs, ...selectedSlideRecs]
          .filter((rec) => rec.type === 'THERAPY')
          .flatMap((therapyRec) => therapyRec.therapy?.drugs ?? [])
          .map((therapyDrug) => therapyDrug.externalDrug?.versionId)
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
      const newId = await zeroDashSdk
        .mtb
        .recommendation
        .addRecommendation<ICreateGroupRecommendation>(clinicalVersion.id, {
          type: 'GROUP',
          tier: getTierString(tier),
          title,
          description: trimRTEValue(description),
          recommendations: recIds,
          targets: selectedTargets?.map((t) => t.id) || [],
          showIndividualTiers,
          links,
        });
      updateRecommendationEvidence(description, newId, clinicalVersion.id);
      return newId;
    } catch {
      return null;
    }
  }, [
    entity,
    zeroDashSdk.mtb.drugs,
    updateRecommendationEvidence,
    selectedSlideRecs,
    zeroDashSdk.mtb.recommendation,
    clinicalVersion,
    tier,
    title,
    description,
    selectedTargets,
    showIndividualTiers,
    newReportRecs,
    reportRecs,
    tempFetchRecToCreateRec,
    updateReportRecommendation,
  ]);

  /**
   *  1. Create a new recommendation with the updated information
   *  2. Delete the old recommendation
   *  3. Update the list of slide recommendations
   */
  const updateRecommendation = useCallback(async (): Promise<string | null> => {
    if (existingRec) {
      const newId = await addRecommendation(
        existingRec.links?.map((l) => ({
          ...l,
          order: l.order ?? undefined,
          clinicalVersionId: undefined,
          recommendationId: undefined,
        })),
      );
      await zeroDashSdk.mtb.recommendation.deleteRecommendation(
        clinicalVersion.id,
        existingRec?.id,
      );

      return newId || '';
    }

    return null;
  }, [addRecommendation, clinicalVersion.id, existingRec, zeroDashSdk.mtb.recommendation]);

  // Update the list of available targets when the selected recs change
  // Uses a Map to remove duplicate targets
  useEffect(() => {
    setAllTargets(() => {
      const newTargets = [...newReportRecs, ...reportRecs, ...selectedSlideRecs]
        .flatMap((rec) => rec.targets || []);
      return [...new Map(newTargets.map((v) => [v.id, v])).values()];
    });
  }, [newReportRecs, reportRecs, selectedSlideRecs]);

  // Select all available targets by default
  useEffect(() => {
    setSelectedTargets([...allTargets]);
  }, [allTargets]);

  useEffect(() => {
    if (entity.entityType === 'REPORT') {
      zeroDashSdk.mtb.molAlteration.getMolAlterations(
        clinicalVersion.id,
        {},
      )
        .then((resp) => {
          setMolReportAlterations(resp);
        });
    }
  }, [clinicalVersion, entity.entityType, zeroDashSdk.mtb.molAlteration]);

  const val = useMemo(() => ({
    entity,
    existingRec,
    tier,
    setTier,
    showIndividualTiers,
    setShowIndividualTiers,
    allTargets,
    setAllTargets,
    selectedTargets,
    setSelectedTargets,
    title,
    setTitle,
    description,
    setDescription,
    newReportRecs,
    setNewReportRecs,
    reportRecs,
    setReportRecs,
    selectedSlideRecs,
    setSelectedSlideRecs,
    resetDetails,
    addRecommendation,
    updateRecommendation,
    reportMolAlterations,
    setMolReportAlterations,
  }), [
    entity,
    existingRec,
    tier,
    setTier,
    showIndividualTiers,
    setShowIndividualTiers,
    allTargets,
    setAllTargets,
    selectedTargets,
    setSelectedTargets,
    title,
    setTitle,
    description,
    setDescription,
    newReportRecs,
    setNewReportRecs,
    reportRecs,
    setReportRecs,
    selectedSlideRecs,
    setSelectedSlideRecs,
    resetDetails,
    addRecommendation,
    updateRecommendation,
    reportMolAlterations,
    setMolReportAlterations,
  ]);

  return (
    <GroupRecommendationContext.Provider
      value={val}
    >
      {children}
    </GroupRecommendationContext.Provider>
  );
}
