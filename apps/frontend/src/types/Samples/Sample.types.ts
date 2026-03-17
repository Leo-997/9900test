import { curationStatuses, failedStatusReasons } from '@/constants/Curation/status';
import { Dispatch, ElementType, SetStateAction, type JSX } from 'react';
import {
  biosampleStatuses, biosampleTypes,
  cohorts,
  genePanels,
  sampleTypes,
} from '../../constants/sample';
import { Group } from '../Auth/Group.types';
import { CurationScopes } from '../Auth/Scope.types';
import { IAddendum } from '../MTB/Addendum.types';

export interface ISampleQueryOptions {
  includePatient?: boolean;
}

export type CurationStatus = typeof curationStatuses[number];

export type FailedStatusReason = typeof failedStatusReasons[number];

export type GenePanel = typeof genePanels[number];
export type Cohorts = typeof cohorts[number];

export type SecondaryCurationStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed';

export type HtsStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed';

export interface IChipProps {
  status: string;
  color: string;
  backgroundColor: string;
  tooltipText?: string;
}

export type NextCurationStatus = {
  status: CurationStatus;
  label: string;
  scope: CurationScopes;
  secondaryStatus?: SecondaryCurationStatus;
  altLabel?: string;
  modal?: ElementType<{
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    updateToNextState: () => void;
  }>;
}

export interface ICurrentCurationStatus {
  status: CurationStatus;
  chipProps: {
    status: string;
    color: string;
    backgroundColor: string;
  };
  readonly: boolean;
  nextStatuses: NextCurationStatus[];
}

export interface INextStatus<T = SecondaryCurationStatus | HtsStatus> {
  status: T;
  label: string;
  modal?: ElementType<{
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    updateToNextState: () => void;
  }>;
}

export interface ICurrentStatus<
  StatusType = SecondaryCurationStatus | HtsStatus,
  ProgressArg = undefined,
> {
  status: StatusType;
  canProgress: (arg?: ProgressArg) => boolean;
  nextStatus?: INextStatus<StatusType>;
  readonly: boolean;
}

export type BiosampleStatus = typeof biosampleStatuses[number];
export type SampleType = typeof sampleTypes[number];
export type BiosampleType = typeof biosampleTypes[number];

export interface IAssay {
  sampleType: SampleType;
  biosampleType: BiosampleType | null;
}
export interface IBiomaterial {
  biomaterialId: number;
  biosampleStatus: BiosampleStatus;
  tissue: string;
  preservation: string;
  collectionDate: string;
  processingDate: string;
  assays?: IAssay[];
}

export type TissueType = 'Germline' | 'Tumour';

export interface IClinicalSample {
  eventType: string;
  sampleId: string;
  patientId: string;
  biomaterial: string;
  tumourAssays: string | null;
  germlineAssays: string | null;
  preservationState: string;
  sampleType: string | null;
  mtbDate: string | null;
  mtbChairId: string | null;
  enrolmentDate: string;
  age: number;
  event: string;
  study: string;
  cohort: Cohorts;
  histologicalDiagnosis: string;
  zero2Category: string;
  zero2Subcat1: string;
  zero2Subcat2: string;
  zero2FinalDiagnosis: string;
  mutationBurden: number;
  purity: string;
  ploidy: string;
  contamination: string;
  msiStatus: string;
  snvMissense: number;
  lohProportion: string;
  ipassValue: number;
  ipassStatus: string;
  addendums: IAddendum[];
}

export interface ISampleDetail {
  groupId: string;
  molAlterationId: string;
  patientId: string;
  zero2Category?: string;
  zero2Subcat1?: string;
  zero2Subcat2?: string;
  zero2FinalDiagnosis?: string;
  additionalData?: Record<string, string | number>;
  mtbDate?: Date;
  count?: number;
}

export interface ILeftPanelTableMapper {
  label: string;
  key: keyof ISampleDetail;
  style?: React.CSSProperties;
  displayRender?: (data) => JSX.Element | string;
  truncate?:boolean;
}

export interface IAssignClinicianBody {
  clinicianId?: string | null;
}

export interface IAssignReviewerBody {
  reviewerId: string;
  group: Group;
}

export interface IGetPipelineQuery {
  name?: string;
}

export interface IWarningAcknowledgement {
  contaminationNote: string | null;
  statusNote: string | null;
}
