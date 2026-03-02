import { classes } from '../constants/options';
import { VariantType } from './misc.types';
import { IGeneList } from './Reports/GeneLists.types';

export interface ICommonResp<T> {
  id: string;
  name: T;
}

export interface IScopeResp<T> extends ICommonResp<T> {
  applicationId: string;
  applicationName: string;
}

export enum Phenotype {
  GUS = 'GUS',
  GUS38 = 'GUS 3.8',
  CONFIRMED = 'Confirmed',
  NONE = 'None',
}

export type Platforms = 'W' | 'R' | 'P' | 'WR' | 'WP' | 'RP' | 'WPR';

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
| 'N/A'
| null;

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

export interface IGene {
  geneId: number;
  gene: string;
  chromosome?: Chromosome;
  geneStart?: number;
  geneEnd?: number;
  chromosomeBand?: string;
  prismclass?: string;
  importance?: number;
}

export interface IQuickFilter<T> {
  label: string;
  onClick: () => void;
  checkIsActive: (filters: T) => boolean;
  disabled?: boolean;
  tooltip?: string;
}

export interface IGeneQuickFilter<T> extends IQuickFilter<T> {
  // This prop is only used for "Panel", "High risk" and "No gene list" quick filters.
  // It establishes which button should be initially active on the variant tab's first renders,
  // and it depends on Curation Stage && Variant's type (germline or somatic).
  isDefault: boolean;
  geneList?: IGeneList;
}

export type AllQuickFilters<T> = IGeneQuickFilter<T> | IQuickFilter<T>;
export interface IFilteredGenes {
  validGenes: IGene[];
  invalidGenes: IGene[];
}

export interface IExtendedGene extends IGene {
  entrezUID?: number;
  fullname?: string;
  alias?: string;
  summary?: string;
  expression?: string;

  // HG 38 Data
  chromosomeHg38?: string;
   // From KnexJS: Note that bigint data is returned as a string in queries because JavaScript
   // may be unable to parse them without loss of precision.
  startHg38?: string;
  endHg38?: string;
  chromosomeBandHg38?: string;
  strandHg38?: string;
}

export interface IGeneMutation {
  variantType: VariantType;
  gene: string;
}

export type Classification =
  | 'Diagnostic'
  | 'Prognostic'
  | 'Diagnostic + Prognostic'
  | 'Response'
  | 'Drug Resistant'
  | 'Treatment'
  | 'Driver'
  | 'Other'
  | 'Not Reportable';

export type ClassifierClassification =
  | 'Supports Diagnosis'
  | 'Supports Change in Diagnosis'
  | 'Reportable'
  | 'Not Reportable - Display'
  | 'Not Applicable'
  | 'Not Reportable';

export interface IReportableVariant<
  C extends Classification | ClassifierClassification = Classification
> {
  classification: C | null;
  targetable: boolean | null;
  reportable: boolean | null;
}

export interface ICounts {
  reportedCount: number;
  targetableCount: number;
}

export type Confidence = 'High' | 'Med' | 'Low';

export type PathClass = typeof classes[number];

export const ENDPOINT = {
  COSMIC_URL: 'https://cancer.sanger.ac.uk/cosmic',
  CLINVAR_URL: 'https://www.ncbi.nlm.nih.gov/clinvar/?term=',
  PECAN: 'https://pecan.stjude.cloud',
  GNOMAD: 'https://gnomad.broadinstitute.org',
};

export const IFRAME = {
  COSMIC: 'COSMIC',
  CLINVAR: 'CLINVAR',
  PECAN: 'PECAN',
  GNOMAD: 'GNOMAD',
};

export interface ISummary {
  min: number;
  mid: number;
  max: number;
}

export interface IResponseBody {
  error: boolean;
  msg: string;
}

export type Impact = 'high' | 'medium' | 'low';

export type ImpactGroups = Record<Impact, string[]>;

export interface IUpdateOrder {
  id: string;
  order: number;
}

export interface IActions {
  order?: boolean;
  edit?: boolean;
  delete?: boolean;
  hide?: boolean;
}
