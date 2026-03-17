export interface HeliumScoreContributor {
  source: string;
  version?: string;
  reason: string;
  contribution: number;
}

export type Helium = Array<HeliumScoreContributor>;

export interface HeliumSummary {
  sampleId: string;
  minScore: number;
  maxScore: number;
  avgScore: number;
}

export interface HeliumData {
  helium_version: string;
  helium_type: string;
  helium_score: number;
  helium_breakdown: string;
  helium: Array<{
    source: string;
    contribution: number;
    reason: string;
  }>;
}
