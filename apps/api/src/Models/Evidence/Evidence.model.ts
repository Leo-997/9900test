import { evidenceEntityTypes } from 'Constants/Evidence/Evidence.constant';

export type EvidenceEntityTypes = typeof evidenceEntityTypes[number];

export interface IEvidence {
  evidenceId: string;
  externalId: string;
  analysisSetId: string;
  entityType: EvidenceEntityTypes | null;
  entityId: string | number | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ICreateEvidence {
  externalId: string;
  entityType?: EvidenceEntityTypes;
  entityId?: string | number;
  analysisSetId?: string;
  biosampleId?: string;
}

export interface IUpdateEvidence {
  externalIds: string[];
  entityType: EvidenceEntityTypes;
  entityId: string;
  analysisSetId?: string;
  biosampleId?: string;
}
