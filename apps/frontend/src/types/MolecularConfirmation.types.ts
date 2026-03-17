import {
  changeOrRefinementOptions,
  leukeamiaSubtypeOptions,
  pathologistAgreementOptions,
} from '@/constants/Curation/MolecularConfirmation';

export type ChangeOrRefinementOption = typeof changeOrRefinementOptions[number];

export type PathologistAgreementOption = typeof pathologistAgreementOptions[number];

export type LeukeamiaSubtypeOption = typeof leukeamiaSubtypeOptions[number];

export interface IMolecularConfirmation {
  changeOrRefinement: ChangeOrRefinementOption,
  changeOrRefinementNotes: string | null,
  pathologistAgreement: PathologistAgreementOption,
  pathologistCommunicationMethod: string | null,
  pathologistAgreementNotes: string | null,
  finalDiagnosisUpdated: boolean,
}

export interface ILeukemiaSubtypes {
  diagnosisSubtype: LeukeamiaSubtypeOption | null,
  zero2ConfirmedSubtype: LeukeamiaSubtypeOption | null,
}

export type FetchMolecularConfirmation = IMolecularConfirmation & ILeukemiaSubtypes;

export type UpdateMolecularConfirmationBody = Partial<FetchMolecularConfirmation>;
