import { commonCommentTypes } from '../../constants/Common/comments';
import { IActions, IUpdateOrder } from '../Common.types';
import { ReportType } from '../Reports/Reports.types';

export type CommonCommentTypes = typeof commonCommentTypes[number];

export interface ICommentTagOption<T extends string = CommonCommentTypes> {
  name: string;
  value: T;
  // american spelling for CSS purposes
  /**
   * ###### IMPORTANT ######
   * The color values must be in hex to support adding alpha value in
   * src/components/ExpandedModal/Comments/Input/AddCommentInput.tsx
   */
  color: string;
  backgroundColor: string;
}

export interface IUpdateReportOrder {
  threadId: string;
  order: IUpdateOrder[];
}

export interface ICommentActions extends IActions {
  addToReport?: boolean;
  evidence?: boolean;
  review?: boolean;
}

// IRelatedThread is used in RelatedThreadsModal for related threads,
// instead of the related threads model on ClinicalComments.types & CurationComments
// (IClinicalRelatedThread & ICurationRelatedThread respectively)
// because those interfaces have entityType defined more specifically than string
export interface IRelatedThread<T extends string = string> {
  id: string;
  analysisSetId: string;
  patientId: string;
  entityType: T;
  zero2FinalDiagnosis: string;
  sequencedEvent?: string;
  interpretationReportType?: ReportType;
}

// IGroupedThreads represents related threads that are grouped together by same sampleId
// so all of them share sampleId, patientId & zero2FinalDiagnosis but are used on different variants
// , which is the reason why entityTypes is an array of string.
// Interface is only relevante on groupThreadsBySampleId function
export interface IGroupedThreads<T extends string = string> {
  analysisSetId: string;
  patientId: string;
  zero2FinalDiagnosis: string;
  sequencedEvent?: string;
  entityTypes: T[];
  interpretationReportType?: ReportType;
}

// Therapies linked to comment
export interface ILinkedTherapy {
  id: string
}
