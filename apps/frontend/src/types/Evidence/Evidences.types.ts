import { evidenceEntityTypes } from '../../constants/Common/evidence';
import { ITherapyDrug } from '../Drugs/Drugs.types';
import { ISortOptions } from '../Search.types';
import { CitationSource, ICitationWithMeta, ICreateCitation } from './Citations.types';
import { ICreateResource, IResourceWithMeta, ResourceType } from './Resources.types';

export type EvidenceType = 'CITATION' | 'RESOURCE';
export type EvidenceEntityTypes = typeof evidenceEntityTypes[number];

export interface IEvidence {
  id: string;
  resourceId?: string;
  citationId?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface IEvidenceLink {
  evidenceId: string;
  externalId: string;
  analysisSetId?: string;
  clinicalVersionId?: string;
  entityType: EvidenceEntityTypes | null;
  entityId?: string | number | null;
  createdAt: string;
  createdBy: string;
}

export interface ICreateEvidence {
  citationData?: ICreateCitation;
  resourceData?: ICreateResource;
}

export interface ICreateEvidenceLink {
  externalId: string;
  entityType?: EvidenceEntityTypes;
  entityId?: string;
  analysisSetId?: string;
  biosampleId?: string;
  clinicalVersionId?: string;
}

export interface IUpdateEvidenceLinks {
  externalIds: string[];
  entityType: EvidenceEntityTypes;
  entityId: string;
  analysisSetId?: string;
  biosampleId?: string;
  clinicalVersionId?: string;
}

export interface IEvidenceQuery extends ISortOptions {
  ids?: string[];
  excludeIds?: string[];
  type?: EvidenceType;
  resourceType?: ResourceType[];
  citationType?: CitationSource[];
  resourceId?: string;
  citationId?: string;
  title?: string[];
  author?: string[];
  year?: number | null;
  publication?: string[];
  pubmedId?: string[];
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export interface IEvidenceLinkFilters {
  hideCitations?: boolean;
  hideResources?: boolean;
  title?: string[];
  author?: string[];
  year?: number | null;
  publication?: string[];
  zero2Category?: string[];
  zero2Subcat1?: string[];
  zero2Subcat2?: string[];
  zero2FinalDiagnosis?: string[];
}

export interface IEvidenceLinkQuery extends IEvidenceLinkFilters {
  analysisSetId?: string;
  clinicalVersionId?: string;
  patientId?: string;
  entityIds?: string[];
  entityTypes?: (EvidenceEntityTypes)[];
}

export interface IResourceWithEvidence extends IResourceWithMeta {
  internalEvidenceId?: string; // id in curation / clinical db
  evidenceId: string; // id in evidence MS
  evidenceType: EvidenceType;
}

export interface ICitationWithEvidence extends ICitationWithMeta {
  internalEvidenceId?: string; // id in curation / clinical db
  evidenceId: string; // id in evidence MS
  evidenceType: EvidenceType;
}

export type Evidence = IResourceWithEvidence | ICitationWithEvidence;

export function isCitation(item: Evidence): item is ICitationWithEvidence {
  return item.evidenceType === 'CITATION';
}

export function isResource(item: Evidence): item is IResourceWithEvidence {
  return item.evidenceType === 'RESOURCE';
}

export interface IGetEvidenceResp {
  allEvidence: Evidence[];
  citations: ICitationWithMeta[];
  resources: IResourceWithMeta[];
}

export interface IGetEvidenceLinkResp extends IGetEvidenceResp {
  evidenceLinks: IEvidenceLink[];
}

export interface IGeneralEvidenceData {
  clinicalSummary?: string;
  evidenceLevels?: string[];
  citation?: ICreateCitation;
  resource?: ICreateResource;
}

export interface ITherapyEvidence {
  id: string;
  therapyId: string;
  evidenceId: string;
}

export interface ITherapyEvidenceFilters {
  therapyId?: string;
  combination?: ITherapyDrug[];
}

export interface IEvidenceActions {
  edit?: boolean;
  download?: boolean;
  delete?: boolean;
}
