import { ReactNode } from 'react';
import { IAnalysisSet } from '../Analysis/AnalysisSets.types';
import { VariantType } from '../misc.types';
import { IPurity } from '../Precuration/Purity.types';
import { IImmunoprofile } from '../Precuration/QCMetrics.types';
import { IMolecularAlterationSearchOptions } from '../Search.types';

export type ClinicalRnaExpression = 'High' | 'Low';

export interface IMolecularAlterationSummary {
  id: string;
  mutationId: string;
  mutationType: VariantType;
}

export interface IMolecularAlterationDetail {
  id: string;
  mutationId: string;
  mutationType: VariantType;
  gene: string;
  geneId: string;
  secondaryGene: string;
  secondaryGeneId: string;
  pathway: string;
  pathwayId: string;
  alteration: string;
  description: string;
  curationClassification: string;
  curationTargetable: boolean;
  clinicalReportable: string;
  clinicalTargetable: boolean;
  hidden: boolean;
  frequency: string;
  frequencyUnits: string;
  prognosticFactor: boolean;
  sampleId: string;
  patientId: string;
  clinicalVersionId: string;
  clinicalNotes: string;
  clinicalAlteration: string;
  clinicalRnaExpression: ClinicalRnaExpression;
  summaryOrder?: number;
  additionalData?: Record<string, string | number>;
  assay?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMolecularAlterationUpdateDto {
  description?: string;
  clinicalAlteration?: string;
  clinicalReportable?: string;
  clinicalTargetable?: boolean;
  hidden?: boolean;
  clinicalNotes?: string;
  clinicalRnaExpression?: string;
  frequency?: string;
  prognosticFactor?: boolean;
}

export interface IMolAlterationSampleDetails {
  patientId: string;
  analysisSetId: string;
  zero2Category: string;
  zero2Subcat1: string;
  zero2Subcat2: string;
  zero2FinalDiagnosis: string;
  geneId: string;
  gene: string;
  mtbMeeting: string;
  mtbReport: string;
  pathway: string;
  mutationType: VariantType;
  additionalData: Record<string, string | number>;
  curationTargetable: boolean;
  clinicalTargetable: boolean;
  curationComment: string;
  reportComment: string;
}

export interface ICreateMolecularAlterationsGroup {
  alterations: string[];
}

export interface IMolAlterationSampleDetailsRequest extends IMolecularAlterationSearchOptions {
  currentAlteration: IMolecularAlterationSummary;
  alterations: IMolecularAlterationSummary[];
  page?: number;
  limit?: number;
}

export type ISomaticSNVSampleKeys =
  | 'consequence'
  | 'vaf'
  | 'variantCN'
  | 'cnLoh'
  | 'pathogenicity'
  | 'subclonalLikelihood';

export type ICNVSampleKeys =
  | 'copyNoType'
  | 'copyNoMin'
  | 'copyNoMax'
  | 'segmental';

export type ISomaticSVSampleKeys = 'startGene' | 'endGene';
export type IGermlineSNVSampleKeys = 'phenotypeMatch' | 'consequence';
export type IRNASampleKeys = 'foldChange' | 'zScore' | 'fileId';
export type ICytoGeneticsArmSampleKeys =
  | 'chromosome'
  | 'arm'
  | 'type'
  | 'copyNumber';

export type IMethylationMGMTSampleKeys = 'gene' | 'status';
export type IMethylationClassifierSampleKeys =
  | 'classifier'
  | 'methClass'
  | 'score'
  | 'interpretation';

export type IMutationalSigSampleKeys = 'signature' | 'contribution' | 'fileId';

export type MolecularAlterationKeys =
  | ISomaticSNVSampleKeys
  | ICNVSampleKeys
  | ISomaticSVSampleKeys
  | IGermlineSNVSampleKeys
  | IRNASampleKeys
  | ICytoGeneticsArmSampleKeys
  | IMethylationClassifierSampleKeys
  | IMethylationMGMTSampleKeys
  | IMutationalSigSampleKeys;

export interface ISampleTableMapper {
  label: string;
  key: keyof IMolAlterationSampleDetails;
  style?: React.CSSProperties;
  displayRender?: (value: any) => ReactNode;
  subKey?: MolecularAlterationKeys
}

export interface IMolSelectedRow {
  groupId: string;
  molId: string;
  isCurrentSample: boolean;
}

export interface IMolecularAlterationFilter {
  molAlterationGroupId?: string;
  geneIds?: number[];
  excludeMutations?: string[];
}

export interface ITPMFile {
  fileId: string;
  url: string;
  fileType: string;
}

export interface ITableHeader {
  label: string;
  style: React.CSSProperties;
}

export interface IMgmtAndClassifiers {
  mgmt: IMolecularAlterationDetail | null;
  classifiers: IMolecularAlterationDetail[];
}

interface IMolAltColumnBase {
  label: string;
  key: keyof Omit<IMolecularAlterationDetail, 'additionalData' | 'createdAt' | 'updatedAt'>;
}

export interface IMolAltSelectModalColumn extends IMolAltColumnBase {
  width: string;
}

export interface IMolAltSummaryColumn<T> extends IMolAltColumnBase {
  settingsKey: keyof T;
  disabled: boolean;
  visible: boolean;
  minWidth: string;
  displayTransform?: (value: unknown, data: IMolecularAlterationDetail) => string;
}

export interface ITumourProfileSummary {
  tumourMutationBurden: Pick<IAnalysisSet, 'somMissenseSnvs' | 'mutBurdenMb'>;
  purity: IPurity['purity'];
  ploidy: IPurity['ploidy'];
  msStatus?: IPurity['msStatus'];
  lohProportion: IAnalysisSet['lohProportion'];
  ipass?: IImmunoprofile;
  m1m2?: IImmunoprofile;
  cd8?: IImmunoprofile;
}

interface ITumourProfileColumnBase {
  label: string;
  key: keyof ITumourProfileSummary;
}

export interface ITumourProfileColumn<T> extends ITumourProfileColumnBase {
  settingsKey: keyof T;
  disabled: boolean;
  visible: boolean;
  minWidth: string;
  displayTransform?: (value: ITumourProfileSummary[this['key']], data: ITumourProfileSummary) => string;
}
