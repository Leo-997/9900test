import { IsOptional, IsString } from 'class-validator';
import { ICounts, IReportableVariant } from 'Models/Common/Common.model';
import { IPaginationRequest, PaginationRequestDTO } from 'Models/Misc/Requests/PaginationDto.model';
import { ClassifierClassification } from '../Misc.model';

export interface IMethylationData extends IReportableVariant<ClassifierClassification>, ICounts {
  biosampleId: string;
  groupId: string;
  classId: string | null;
  score: number;
  interpretation: string;
  match: boolean | null;
  version: string;
  classifierName: string;
  groupName: string | null;
  description: string | null;
  chipVersion?: string | null;
  providerId?: string | null;
  researchCandidate: boolean | null;
}

export interface IMethylationPredictionData extends IReportableVariant {
  status: string;
  estimated: number;
  ciLower: number;
  ciUpper: number;
  cutoff: number;
  researchCandidate: boolean | null;
}

export interface IProfiles {
  cnProfile: string;
  methProfile: string;
}

export interface IClassifierGroup {
  methGroupId: string;
  methClassifierId: string;
  groupName: string;
  externalGroupId: number | null;
  methSummary: string | null;
  methEvidence: string | null;
  methClass: string | null;
  methFamily: string | null;
  methSuperfamily: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface IMethylationGeneData extends IReportableVariant, ICounts {
  biosampleId: string;
  gene: string;
  geneId: string;
  median: number;
  lowest: number;
  highest: number;
  status: string;
  researchCandidate: boolean | null;
}

export interface IMethGeneTable {
  biosampleId: string;
  betaValue: number;
  mValue: number;
  chr: string | null;
  start: number | null;
  end: number | null;
  island: string | null;
  regulatoryFeatureGroup: string | null;
  replicateProbeSetByName: string | null;
  replicateProbeSetBySeq: string | null;
  replicateProbeSetByLoc: string | null;
  refGeneGroup: string | null;
  probeId: string;
}

export interface IGetMethGroupQuery extends IPaginationRequest {
  classifierId?: string;
  search?: string;
}

export interface ICohortPointData {
  x: string;
  y: number;
  low?: number;
  high?: number;
  pos?: number;
}

export interface IMethCounts {
  unmethylatedCount: number;
  methylatedCount: number;
}
export interface ICohortStats {
  id: string;
  data: ICohortPointData[]
}

export class GetMethGroupQueryDTO extends PaginationRequestDTO implements IGetMethGroupQuery {
  @IsOptional()
  @IsString()
    classifierId?: string;

  @IsOptional()
  @IsString()
    search?: string;
}
