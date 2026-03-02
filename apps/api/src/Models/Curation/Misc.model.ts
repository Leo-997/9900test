import { zygosity } from 'Constants/SNV/Common.constant';

export type Classification =
  | 'Diagnostic'
  | 'Prognostic'
  | 'Diagnostic + Prognostic'
  | 'Response'
  | 'Drug Resistant'
  | 'Treatment'
  | 'Driver'
  | 'Other'
  | 'Not Reportable'
  | null;

export type ClassifierClassification =
  | 'Supports Diagnosis'
  | 'Supports Change in Diagnosis'
  | 'Reportable'
  | 'Not Reportable - Display'
  | 'Not Applicable'
  | 'Not Reportable'
  | null;

export type Pathclass =
  | 'C5: Pathogenic'
  | 'C4: Likely pathogenic'
  | 'C3: VOUS'
  | 'C2: Likely Benign'
  | 'C1: Benign'
  | 'C3.8: VOUS'
  | 'GUS'
  | 'Unclassified'
  | 'False Positive'
  | 'Failed PathOS filters';

export type MarkDisrupted =
  | 'No'
  | 'Yes'
  | 'Both'
  | 'Start'
  | 'End'
  | '';

export type Platform = 'W' | 'R' | 'P' | 'WR' | 'WP' | 'RP' | 'WPR' | 'No';
export type Inframe =
  | 'W'
  | 'W-'
  | 'WR'
  | 'W-R'
  | 'WR-'
  | 'WRP'
  | 'W-RP'
  | 'WR-P'
  | 'W-R-P'
  | 'R'
  | 'R-'
  | 'RP'
  | 'R-P'
  | 'P'
  | 'No'
  | 'Unknown'
  | 'N/A';
export type Confidence = 'High' | 'Med' | 'Low';
export type Importance = 'low' | 'mediumlow' | 'mediumhigh' | 'high';
export type SortString = 'asc' | 'desc';
export type SNVType = 'germline' | 'somatic';
export type IFilterImpact = 'high' | 'medium' | 'low';

export interface HeliumSummary {
  biosampleId: string;
  minScore: number;
  maxScore: number;
  avgScore: number;
}

export interface Summary {
  min: number;
  mid: number;
  max: number;
}

export interface CNVSummary {
  copyNumber: Summary;
  zScore: Summary;
}

export type Chromosome =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14'
  | '15'
  | '16'
  | '17'
  | '18'
  | '19'
  | '20'
  | '21'
  | '22'
  | 'M'
  | 'X'
  | 'Y'
  | 'chr1'
  | 'chr2'
  | 'chr3'
  | 'chr4'
  | 'chr5'
  | 'chr6'
  | 'chr7'
  | 'chr8'
  | 'chr9'
  | 'chr10'
  | 'chr11'
  | 'chr12'
  | 'chr13'
  | 'chr14'
  | 'chr15'
  | 'chr16'
  | 'chr17'
  | 'chr18'
  | 'chr19'
  | 'chr20'
  | 'chr21'
  | 'chr22'
  | 'chrM'
  | 'chrX'
  | 'chrY';

export type PhenoType = 'GUS' | 'GUS 3.8' | 'Confirmed' | 'None';

export type Zygosity = typeof zygosity[number];
