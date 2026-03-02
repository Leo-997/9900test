import { CytoCNType } from '@/types/Cytogenetics.types';
import { StageStatus } from '@/types/TaskDashboard/TaskDashboard.types';
import { ResearchCandidateReason } from '@/types/PatientProfile.types';
import { CNVCNType } from '../types/CNV.types';
import {
  Classification,
  ClassifierClassification,
  Impact,
  PathClass,
} from '../types/Common.types';
import { HTSDrugHitsPlotTypes } from '../types/HTS.types';
import { ISelectOption } from '../types/misc.types';
import { AddendumType } from '../types/MTB/Addendum.types';
import { RecommendationType } from '../types/MTB/Recommendation.types';
import { GermlineSectionType } from '../types/MTB/Slide.types';
import { FailedStatusReason } from '../types/Samples/Sample.types';
import { Zygosity } from '../types/SNV.types';
import { DisruptedTypes } from '../types/SV.types';

export const classificationOptions: ISelectOption<Classification | ''>[] = [
  {
    name: 'Diagnostic',
    value: 'Diagnostic',
  },
  {
    name: 'Prognostic',
    value: 'Prognostic',
  },
  {
    name: 'Diagnostic + Prognostic',
    value: 'Diagnostic + Prognostic',
  },
  {
    name: 'Response',
    value: 'Response',
  },
  {
    name: 'Drug Resistant',
    value: 'Drug Resistant',
  },
  {
    name: 'Treatment',
    value: 'Treatment',
  },
  {
    name: 'Driver',
    value: 'Driver',
  },
  {
    name: 'Other',
    value: 'Other',
  },
  {
    name: 'Not Reportable',
    value: 'Not Reportable',
  },
  {
    name: 'Leave as blank',
    value: '',
  },
];

export const classifierClassificationOptions: ISelectOption<ClassifierClassification | ''>[] = [
  {
    name: 'Supports Diagnosis',
    value: 'Supports Diagnosis',
  },
  {
    name: 'Supports Change in Diagnosis',
    value: 'Supports Change in Diagnosis',
  },
  {
    name: 'Reportable',
    value: 'Reportable',
  },
  {
    name: 'Not Reportable - Display',
    value: 'Not Reportable - Display',
  },
  {
    name: 'Not Applicable',
    value: 'Not Applicable',
  },
  {
    name: 'Not Reportable',
    value: 'Not Reportable',
  },
  {
    name: 'Leave as blank',
    value: '',
  },
];

export const yesNoOptions: ISelectOption<
'Yes' | 'No' | 'Select Status' | ''
>[] = [
  {
    name: 'Yes',
    value: 'Yes',
  },
  {
    name: 'No',
    value: 'No',
  },
  {
    name: 'Leave as blank',
    value: '',
  },
];

export const addendumOptions: ISelectOption<AddendumType>[] = [
  {
    name: 'General',
    value: 'general',
  },
  {
    name: 'HTS',
    value: 'hts',
  },
];

export const studiesAll = [
  'Cohort B Rare Cancers',
  'DCROUCHER',
  'HMPPMP',
  'Hudson',
  'MELBOURNE',
  'MRD',
  'PRISM',
  'RETROSPECTIVE',
  'TARGET',
  'TELETHONKIDS',
  'TSO500',
  'ZERO-Repeat',
  'AML-PDX',
  'Zero2',
  'SICKKIDS-RARE',
];

export const studiesRestricted = [
  'PRISM',
  'TARGET',
  'Cohort B Rare Cancers',
  'Zero-Repeat',
  'Zero2',
  'SICKKIDS-RARE',
];

export const eventTypes = [
  'D1',
  'D2',
  'P1',
  'P2',
  'P3',
  'R1',
  'R2',
  'R3',
  'R4',
  'S1',
];

export const fileTypes = [
  'tar',
  'bam',
  'bai',
  'tdf',
  'fastq',
  'vcf',
  'gvcf',
  'json',
  'metrics',
  'png',
  'pdf',
  'docx',
  'other',
];

export const sampleTypes = [
  'tumour',
  'normal',
  'donor',
  'unknown',
];

export const referenceGenomes = [
  'hs38',
  'hg19lite',
  'hs37d5',
  'hg19',
  'hg38',
  'GRCh37',
  'GRCh38fullphix',
  'GRCh38lite',
  'GRCh37illumina',
];

export const platforms = [
  'netapp',
  'dnanexus',
  'cavatica',
  'ncimdss',
];

export const fusionEvents = [
  'INF',
  'SGL',
  'BND',
  'DUP',
  'DEL',
  'INV',
  'INS',
  'DISRUPTION',
];

export const svDisruptionOptions: ISelectOption<DisruptedTypes | ''>[] = [
  {
    name: 'No',
    value: 'No',
  },
  {
    name: 'Yes',
    value: 'Yes',
  },
  {
    name: 'Start gene only',
    value: 'Start',
  },
  {
    name: 'End gene only',
    value: 'End',
  },
  {
    name: 'Both genes',
    value: 'Both',
  },
  {
    name: 'Leave as blank',
    value: '',
  },
];

export const inframes = [
  'W',
  'R',
  'P',
  'WR',
  'WP',
  'RP',
  'WPR',
  'No',
];

export const chromosomes = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  'X',
  'Y',
];

export const classes = [
  'C5: Pathogenic',
  'C4: Likely Pathogenic',
  'C3: VOUS',
  'C3.8: VOUS',
  'C2: Likely Benign',
  'C1: Benign',
  'False Positive',
  'Unclassified',
] as const;

export const impacts: Impact[] = [
  'high',
  'medium',
  'low',
];

export const methClassifiers = [
  'Match',
  'No Match',
  'Unknown',
];

export const mgmtStatuses: string[] = [
  'Methylated',
  'Unmethylated',
  'Ambiguous',
  'Unknown',
];

export const platformOptions: string[] = [
  'W',
  'R',
  'P',
  'WR',
  'WP',
  'RP',
  'WPR',
  'No',
];

export const inframeOptions: string[] = [
  'W',
  'W-',
  'WR',
  'W-R',
  'WR-',
  'WRP',
  'W-RP',
  'WR-P',
  'W-R-P',
  'R',
  'R-',
  'RP',
  'R-P',
  'P',
  'No',
  'Unknown',
  'N/A',
];

export const pathClassOptions: ISelectOption<PathClass | ''>[] = [
  {
    name: 'C5: Pathogenic',
    value: 'C5: Pathogenic',
  },
  {
    name: 'C4: Likely Pathogenic',
    value: 'C4: Likely Pathogenic',
  },
  {
    name: 'C3: VOUS',
    value: 'C3: VOUS',
  },
  {
    name: 'C3.8: VOUS',
    value: 'C3.8: VOUS',
  },
  {
    name: 'C2: Likely Benign',
    value: 'C2: Likely Benign',
  },
  {
    name: 'C1: Benign',
    value: 'C1: Benign',
  },
  {
    name: 'False Positive',
    value: 'False Positive',
  },
  {
    name: 'Unclassified',
    value: 'Unclassified',
  },
  {
    name: 'Leave as blank',
    value: '',
  },
];

export const cytoCNTypeOptions: ISelectOption<CytoCNType>[] = [
  {
    name: 'Loss',
    value: 'DEL',
  },
  {
    name: 'Amplification',
    value: 'AMP',
  },
  {
    name: 'Chromothripsis',
    value: 'CTH',
  },
  {
    name: 'Gain',
    value: 'GAIN',
  },
  {
    name: 'Homozygous deletion',
    value: 'HOM_DEL',
  },
  {
    name: '1 Copy loss',
    value: '1_COPY_LOSS',
  },
  {
    name: 'LOH',
    value: 'LOH',
  },
  {
    name: 'Copy neutral LOH',
    value: 'NEU_LOH',
  },
  {
    name: 'Copy neutral',
    value: 'NEU',
  },
];

// The following values come directly out of the pipeline and cannot be changed.
// If the curators request that they are relabeled, only update the name:
// 'DEL'
// 'HOM_DEL'
// 'SEGMENTAL_DEL'
// 'NEU'
export const cnvCNTypeOptions: ISelectOption<CNVCNType>[] = [
  {
    name: 'Amplification',
    value: 'AMP',
  },
  {
    name: 'Gain',
    value: 'GAIN',
  },
  {
    name: 'Loss',
    value: 'DEL',
  },
  {
    name: 'Homozygous Deletion',
    value: 'HOM_DEL',
  },
  {
    name: 'Copy Neutral',
    value: 'NEU',
  },
  {
    name: 'Segmental Deletion',
    value: 'SEGMENTAL_DEL',
  },
  {
    name: 'Germline Heterozygous Deletion',
    value: 'GERMLINE_HET_DELETION',
  },
  {
    name: 'Germline Homozygous Deletion',
    value: 'GERMLINE_HOM_DELETION',
  },
];

export const evidenceInputOptions: ISelectOption<string>[] = [
  { name: 'Citation', value: 'CITATION' },
  { name: 'PDF File', value: 'PDF' },
  { name: 'URL Link', value: 'URL' },
  { name: 'Image', value: 'IMG' },
];

export const evidenceLevels: string[] = [
  'Validated Association',
  'Clinical Evidence',
  'Case Study',
  'Precinical Evidence',
  'Inferential Association',
];

export const tierLevels: string[] = [
  '1', '2', '3', '4', '5',
];

export const tierClasses: string[] = [
  'Molecular',
  'In Vitro',
  'PDX',
];

export const germlineRecommendationOptions = {
  referralToFCSCounselling: 'Referral to a familial cancer service is recommended for genetic counselling',
  referralToCGSCounselling: 'Referral to a clinical genetics service is recommended for genetic counselling',
  clinicalConfirmRecommended: 'Clinical confirmation with diagnostic genetic testing is recommended',
  clinicalConfirmConsidered: 'Clinical confirmation with diagnostic genetic testing can be considered',
  cancerRiskImplication: 'Result may have implications for cancer risk in the patient and/or family members',
  eviQRiskManagement: 'eviQ risk management guidelines available',
  riskManagementTailored: 'Risk management tailored based on individualised assessment',
  familyPlanningImplication: 'Result may have implications for family planning',
};

export const germlineSectionOptions: GermlineSectionType[] = [
  'Molecular findings',
  'Interpretation',
  'Phenotype',
  'Penetrance',
  'Risk management',
  'Custom',
];

export const layoutOptions: ISelectOption<string>[] = [
  {
    name: 'One column',
    value: 'vertical',
  },
  {
    name: 'Two columns',
    value: 'horizontal',
  },
];

export const columnOptions: ISelectOption<string>[] = [
  {
    name: 'One column',
    value: '1',
  },
  {
    name: 'Two columns',
    value: '2',
  },
  {
    name: 'Three columns',
    value: '3',
  },
];

export const recommendationOptions: ISelectOption<RecommendationType>[] = [
  {
    name: 'Therapy',
    value: 'THERAPY',
  },
  {
    name: 'Change of diagnosis',
    value: 'CHANGE_DIAGNOSIS',
  },
  {
    name: 'Germline',
    value: 'GERMLINE',
  },
  {
    name: 'Text',
    value: 'TEXT',
  },
  {
    name: 'Group',
    value: 'GROUP',
  },
];

export const reportAsOptions: ISelectOption<string>[] = [
  {
    name: 'Diagnostic',
    value: 'Diagnostic',
  },
  {
    name: 'Prognostic',
    value: 'Prognostic',
  },
  {
    name: 'Diagnostic + Prognostic',
    value: 'Diagnostic + Prognostic',
  },
  {
    name: 'Response',
    value: 'Response',
  },
  {
    name: 'Treatment',
    value: 'Treatment',
  },
  {
    name: 'Other',
    value: 'Other',
  },
];

export const rnaExpressionOptions: ISelectOption<string>[] = [
  {
    name: 'High',
    value: 'High',
  },
  {
    name: 'Low',
    value: 'Low',
  },
  {
    name: 'Leave as blank',
    value: '',
  },
];

export const htsHitsPlotTabs = (ln50?: boolean): ISelectOption<HTSDrugHitsPlotTypes>[] => [
  { name: 'Curve', value: 'IC50CURVE' },
  { name: 'AUC', value: 'AUC' },
  { name: 'IC50', value: 'IC50' },
  (
    ln50
      ? (
        { name: 'LN50', value: 'LN50' }
      ) : (
        { name: 'LC50', value: 'LC50' }
      )
  ),
];

export const zygosityOptions: ISelectOption<Zygosity | ''>[] = [
  {
    name: 'Heterozygous',
    value: 'Heterozygous',
  },
  {
    name: 'Homozygous',
    value: 'Homozygous',
  },
  {
    name: 'Hemizygous',
    value: 'Hemizygous',
  },
  {
    name: 'Compound heterozygous',
    value: 'Compound heterozygous',
  },
  {
    name: 'Subclonal',
    value: 'Subclonal',
  },
  {
    name: 'Not determined',
    value: 'Not determined',
  },
  {
    name: 'Not present',
    value: 'Not present',
  },
  {
    name: 'Leave as blank',
    value: '',
  },
];

export const failedStatusReasons: ISelectOption<FailedStatusReason>[] = [
  {
    name: 'No tumour present',
    value: 'No Tumour',
  },
  {
    name: 'Contaminated Germline',
    value: 'Contaminated Germline',
  },
  {
    name: 'No donor',
    value: 'No Donor',
  },
];

export const updateCaseDetailsStatusOptions: ISelectOption<StageStatus>[] = [
  {
    name: 'On hold',
    value: 'On Hold',
  },
  {
    name: 'Revert to previous status ({status})',
    value: 'Remove Hold',
  },
  {
    name: 'Mark as N/A',
    value: 'N/A',
  },
  {
    name: 'Done',
    value: 'Done',
  },
];

export const researchCandidateOptions: ISelectOption<ResearchCandidateReason | ''>[] = [
  {
    name: 'Case report',
    value: 'Case report',
  },
  {
    name: 'Functional studies',
    value: 'Functional studies',
  },
  {
    name: 'Further research',
    value: 'Further research',
  },
  {
    name: 'Leave as blank',
    value: '',
  },
];
