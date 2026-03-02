import { ClassifierClassification, ICounts, IReportableVariant } from './Common.types';

export interface IMethylationData extends IReportableVariant<ClassifierClassification>, ICounts {
  biosampleId: string;
  methId: string;
  groupId: string;
  classId: string | null;
  score: number;
  interpretation: string;
  match: boolean | null;
  version: string;
  classifierName: string;
  groupName: string;
  description: string | null;
  researchCandidate: boolean | null;
  chipVersion?: string | null;
  providerId?: string | null;
}

export interface IMethResultFilters {
  reportable?: boolean;
  isClassified?: boolean;
}

export interface IMethylationPredictionData extends IReportableVariant, ICounts {
  biosampleId: string;
  methId: string;
  status: string;
  estimated: number;
  ciLower: number;
  ciUpper: number;
  cutoff: number;
  plotUrl: string;
  researchCandidate: boolean | null;
}

export interface IMethGeneTable {
  betaValue: number;
  probeId: string;
  relationToIsland: string | null;
  refGeneGroup: string | null;
  regulatoryFeatureGroup: string | null;
  replicateProbeSetByName: string | null;
  replicateProbeSetBySeq: string | null;
  replicateProbeSetByLoc: string | null;
  mValue: number;
  chr: string | null;
  start: number| null;
  end: number| null;
}

export const methStatuses = [
  'methylated',
  'unmethylated',
  'ambiguous',
  'unknown',
] as const;

export type MethylationStatus = typeof methStatuses[number];

export interface IMethylationGeneData extends IReportableVariant, ICounts {
  biosampleId: string;
  methId: string;
  gene: string;
  geneId: string;
  genePlot?: string;
  median: number;
  lowest: number;
  highest: number;
  researchCandidate: boolean | null;
  status?: MethylationStatus;
}

export interface IProfiles {
  cnProfile: string;
  methProfile: string;
}

export interface IClassifierResult {
  version: string | null;
  group: string | null;
  subgroup?: string | null;
  score: number | null;
  interpretation: string | null;
}

export interface IClassifierGroup {
  methGroupId: string;
  methClassifierId: string;
  methClassId: string | null;
  groupName: string;
  externalGroupId: number | null;
  methSummary: string | null;
  methEvidence: string | null;
  methSubclass: string | null;
  methClass: string | null;
  methFamily: string | null;
  methSuperfamily: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface IGetClassifierGroupsQuery {
  classifierId?: string;
  search?: string;
}

export interface IGraphX {
  gene: string[];
  probeId: string[];
  probeLabel: string[];
  relationToIsland: (string | null)[];
  regulatoryFeatureGroup: (string | null)[];
  replicateProbeSetByName: (string | null)[];
  replicateProbeSetBySeq: (string | null)[];
  replicateProbeSetByLoc: (string | null)[];
  mValue: number[];
  chr: (string | null)[];
  start: (number | null)[];
  end: (number | null)[];
}
export interface IGraphY {
  data: number[][];
  smps: string[];
  vars: string[];
}

export interface IGraph {
  x: IGraphX;
  y: IGraphY;
}
export interface ICohortPointData {
  x: string | number | Date;
  y: number;
  low?: number;
  high?: number;
  pos?: number;
}
export interface ICohortStats {
  id: string;
  data: ICohortPointData[];
}
export interface IMethCounts {
  unmethylatedCount: number;
  methylatedCount: number;
}

export type DataPoint = {
  x: string;
  [key: string]: string;
};
