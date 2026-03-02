import dayjs from 'dayjs';
import { ISampleTableMapper } from '../types/MTB/MolecularAlteration.types';
import { ILeftPanelTableMapper } from '../types/Samples/Sample.types';
import { toFixed } from '../utils/math/toFixed';

export const SampleTableMapperArray: ISampleTableMapper[] = [
  {
    label: 'Patient',
    key: 'patientId',
    style: {
      minWidth: '72px',
      width: '72px',
    },
  },
  {
    label: 'Cancer category',
    key: 'zero2Category',
    style: {
      minWidth: '144px',
      width: '144px',
    },
  },
  {
    label: 'Cancer type',
    key: 'zero2Subcat1',
    style: {
      minWidth: '100px',
      width: '100px',
    },
  },
  {
    label: 'diagnosis',
    key: 'zero2Subcat2',
    style: {
      minWidth: '90px',
      width: '90px',
    },
  },
  {
    label: 'final diagnosis',
    key: 'zero2FinalDiagnosis',
    style: {
      minWidth: '114px',
      width: '114px',
    },
  },
  {
    label: 'MTB meeting',
    key: 'mtbMeeting',
    displayRender: (value) => (value ? dayjs(value).format('D MMM YYYY') : '-'),
    style: {
      minWidth: '100px',
      width: '100px',
    },
  },
  {
    label: 'MTB report',
    key: 'mtbReport',
    style: {
      minWidth: '100px',
      width: '100px',
    },
  },
];

export const SomaticSNVTableMapperArray: ISampleTableMapper[] = [
  {
    label: 'Consequence',
    key: 'additionalData',
    subKey: 'consequence',
    displayRender: (data) => data && data.consequence,
    style: {
      minWidth: '120px',
      width: '120px',
    },
  },
  {
    label: 'VAF',
    key: 'additionalData',
    subKey: 'vaf',
    displayRender: (data) => data && data.vaf,
    style: {
      minWidth: '88px',
      width: '88px',
    },
  },
  {
    label: 'Variant CN',
    key: 'additionalData',
    subKey: 'variantCN',
    displayRender: (data) => data && data.variantCN,
    style: {
      minWidth: '120px',
      width: '120px',
    },
  },
  {
    label: 'LOH',
    key: 'additionalData',
    subKey: 'cnLoh',
    displayRender: (data) => data && data.cnLoh,
    style: {
      minWidth: '88px',
      width: '88px',
    },
  },
  {
    label: 'Pathogenicity',
    key: 'additionalData',
    subKey: 'pathogenicity',
    displayRender: (data) => data && data.pathogenicity,
    style: {
      minWidth: '120px',
      width: '120px',
    },
  },
  {
    label: 'Subclonal Likelihood',
    key: 'additionalData',
    subKey: 'subclonalLikelihood',
    displayRender: (data) => data && data.subclonalLikelihood,
    style: {
      minWidth: '100px',
      width: '100px',
    },
  },
  {
    label: 'Pathway',
    key: 'pathway',
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
  {
    label: 'Targetable (Curation)',
    displayRender: (value) => (value ? 'Yes' : 'No'),
    key: 'curationTargetable',
    style: {
      minWidth: '125px',
      width: '125px',
    },
  },
  {
    label: 'Targetable (Clinical)',
    key: 'clinicalTargetable',
    displayRender: (value) => (value ? 'Yes' : 'No'),
    style: {
      minWidth: '125px',
      width: '125px',
    },
  },
];

export const CNVTableMapperArray: ISampleTableMapper[] = [
  {
    label: 'Copy number type',
    key: 'additionalData',
    subKey: 'copyNoType',
    displayRender: (data) => data && data.copyNoType,
    style: {
      minWidth: '100px',
      width: '100px',
    },
  },
  {
    label: 'Copy number min',
    key: 'additionalData',
    subKey: 'copyNoMin',
    displayRender: (data) => data && data.copyNoMin && toFixed(data.copyNoMin, 2),
    style: {
      minWidth: '100px',
      width: '100px',
    },
  },
  {
    label: 'Copy number max',
    key: 'additionalData',
    subKey: 'copyNoMax',
    displayRender: (data) => data && data.copyNoMax && toFixed(data.copyNoMax, 2),
    style: {
      minWidth: '101px',
      width: '101px',
    },
  },
  {
    label: 'Segmental',
    key: 'additionalData',
    subKey: 'segmental',
    displayRender: (data) => (data && data.segmental ? 'Yes' : 'No'),
    style: {
      minWidth: '87px',
      width: '87px',
    },
  },
  {
    label: 'Pathway',
    key: 'pathway',
    style: {
      minWidth: '99px',
      width: '99px',
    },
  },
  {
    label: 'Targetable (Curation)',
    displayRender: (value) => (value ? 'Yes' : 'No'),
    key: 'curationTargetable',
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
  {
    label: 'Targetable (Clinical)',
    key: 'clinicalTargetable',
    displayRender: (value) => (value ? 'Yes' : 'No'),
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
];

export const SVTableMapperArray: ISampleTableMapper[] = [
  {
    label: 'start Gene ',
    key: 'additionalData',
    subKey: 'startGene',
    displayRender: (data) => data && data.startGene,
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
  {
    label: 'End Gene ',
    key: 'additionalData',
    subKey: 'endGene',
    displayRender: (data) => data && data.endGene,
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
  {
    label: 'Pathway',
    key: 'pathway',
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
  {
    label: 'Targetable (Curation)',
    displayRender: (value) => (value ? 'Yes' : 'No'),
    key: 'curationTargetable',
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
  {
    label: 'Targetable (Clinical)',
    key: 'clinicalTargetable',
    displayRender: (value) => (value ? 'Yes' : 'No'),
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
];

export const GermlineSNVTableMapperArray: ISampleTableMapper[] = [
  {
    label: 'Phenotype match',
    key: 'additionalData',
    subKey: 'phenotypeMatch',
    displayRender: (data) => data && data.phenotypeMatch,
    style: {
      minWidth: '160px',
      width: '160px',
    },
  },
  {
    label: 'Consequence',
    key: 'additionalData',
    subKey: 'consequence',
    displayRender: (data) => data && data.consequence,
    style: {
      minWidth: '120px',
      width: '120px',
    },
  },
  {
    label: 'Pathway',
    key: 'pathway',
    style: {
      minWidth: '132px',
      width: '132px',
    },
  },
  {
    label: 'Targetable (Curation)',
    displayRender: (value) => (value ? 'Yes' : 'No'),
    key: 'curationTargetable',
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
  {
    label: 'Targetable (Clinical)',
    key: 'clinicalTargetable',
    displayRender: (value) => (value ? 'Yes' : 'No'),
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
];

export const RNATableMapperArray: ISampleTableMapper[] = [
  {
    label: 'Fold Change',
    key: 'additionalData',
    subKey: 'foldChange',
    displayRender: (data) => data && data.foldChange && toFixed(data.foldChange, 2),
    style: {
      minWidth: '120px',
      width: '120px',
    },
  },
  {
    label: 'Z Score',
    key: 'additionalData',
    subKey: 'zScore',
    displayRender: (data) => data && data.zScore && toFixed(data.zScore, 2),
    style: {
      minWidth: '120px',
      width: '120px',
    },
  },
  {
    label: 'Pathway',
    key: 'pathway',
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
  {
    label: 'Targetable (Curation)',
    displayRender: (value) => (value ? 'Yes' : 'No'),
    key: 'curationTargetable',
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
  {
    label: 'Targetable (Clinical)',
    key: 'clinicalTargetable',
    displayRender: (value) => (value ? 'Yes' : 'No'),
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
];

export const CytogeneticsArmTableMapperArray: ISampleTableMapper[] = [
  {
    label: 'Chromosome',
    key: 'additionalData',
    subKey: 'chromosome',
    displayRender: (data) => data && data.chromosome,
    style: {
      minWidth: '120px',
      width: '120px',
    },
  },
  {
    label: 'Arm',
    key: 'additionalData',
    subKey: 'arm',
    displayRender: (data) => data && data.arm,
    style: {
      minWidth: '40px',
      width: '40px',
    },
  },
  {
    label: 'Type',
    key: 'additionalData',
    subKey: 'type',
    displayRender: (data) => data && data.type,
    style: {
      minWidth: '80px',
      width: '80px',
    },
  },
  {
    label: 'Copy Number',
    key: 'additionalData',
    subKey: 'copyNumber',
    displayRender: (data) => data && data.copyNumber && toFixed(data.copyNumber, 2),
    style: {
      minWidth: '88px',
      width: '88px',
    },
  },
  {
    label: 'Targetable (Curation)',
    displayRender: (value) => (value ? 'Yes' : 'No'),
    key: 'curationTargetable',
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
  {
    label: 'Targetable (Clinical)',
    key: 'clinicalTargetable',
    displayRender: (value) => (value ? 'Yes' : 'No'),
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
];

export const MethylationMGMTTableMapperArray: ISampleTableMapper[] = [
  {
    label: 'gene',
    key: 'additionalData',
    subKey: 'gene',
    displayRender: (data) => data && data.gene,
    style: {
      minWidth: '72px',
      width: '72px',
    },
  },
  {
    label: 'MGMT Status',
    key: 'additionalData',
    subKey: 'status',
    displayRender: (data) => data && data.status,
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
  {
    label: 'Targetable (Curation)',
    displayRender: (value) => (value ? 'Yes' : 'No'),
    key: 'curationTargetable',
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
  {
    label: 'Targetable (Clinical)',
    key: 'clinicalTargetable',
    displayRender: (value) => (value ? 'Yes' : 'No'),
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
];

export const MethylationClassifierTableMapperArray: ISampleTableMapper[] = [
  {
    label: 'Interpretation',
    key: 'additionalData',
    subKey: 'interpretation',
    displayRender: (data) => data && data.interpretation,
    style: {
      minWidth: '120px',
      width: '120px',
    },
  },
  {
    label: 'methylation Class',
    key: 'additionalData',
    subKey: 'methClass',
    displayRender: (data) => data && data.methClass,
    style: {
      minWidth: '160px',
      width: '160px',
    },
  },
  {
    label: 'calibrated score',
    key: 'additionalData',
    subKey: 'score',
    displayRender: (data) => data && data.score && toFixed(data.score, 2),
    style: {
      minWidth: '160px',
      width: '160px',
    },
  },
  {
    label: 'Targetable (Curation)',
    displayRender: (value) => (value ? 'Yes' : 'No'),
    key: 'curationTargetable',
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
  {
    label: 'Targetable (Clinical)',
    key: 'clinicalTargetable',
    displayRender: (value) => (value ? 'Yes' : 'No'),
    style: {
      minWidth: '96px',
      width: '96px',
    },
  },
];
// Left Panel Table mappers
export const alterationLeftPanelTableMapper: ILeftPanelTableMapper[] = [
  {
    label: 'MTB Meeting',
    key: 'mtbDate',
    style: { minWidth: '72px', width: '72px' },
    displayRender: (value) => (
      value ? dayjs(value).format('YYYY-MM-DD').toString() : '-'
    ),
  },
  {
    label: 'Patient ID',
    style: {
      minWidth: '120px',
      width: '120px',
    },
    key: 'patientId',
  },
  {
    label: 'Cancer Type',
    style: {
      minWidth: '72px',
      width: '72px',
    },
    key: 'zero2Subcat1',
  },
  {
    label: 'Cancer Category',
    style: { minWidth: '100px', width: '100px' },
    key: 'zero2Category',
  },
  {
    label: 'Final Diagnosis',
    style: {
      minWidth: '100px',
      width: '100px',
    },
    key: 'zero2FinalDiagnosis',
  },
];

export const cytogeneticsLeftPanelTableMapper: ILeftPanelTableMapper[] = [
  {
    label: 'MTB Meeting',
    key: 'mtbDate',
    style: { minWidth: '64px', width: '64px' },
    displayRender: (value) => (
      value ? dayjs(value).format('YYYY-MM-DD').toString() : '-'
    ),
  },
  {
    label: 'Patient ID',
    style: {
      minWidth: '84px',
      width: '84px',
    },
    key: 'patientId',
  },
  {
    label: 'Cancer Type',
    style: {
      minWidth: '56px',
      width: '56px',
    },
    key: 'zero2Subcat1',
  },
  {
    label: 'Cancer Category',
    style: { minWidth: '72px', width: '72px' },
    key: 'zero2Category',
  },
  {
    label: 'Copy Number',
    key: 'additionalData',
    style: { minWidth: '80px', width: '80px' },
    displayRender: (additionalData) => additionalData
      && additionalData.copyNumber
      && toFixed(additionalData.copyNumber, 2),
  },
  {
    label: 'Final Diagnosis',
    style: {
      minWidth: '100px',
      width: '100px',
    },
    key: 'zero2FinalDiagnosis',
  },
];

export const methylationsMGMTLeftPanelTableMapper: ILeftPanelTableMapper[] = [
  {
    label: 'MTB Meeting',
    key: 'mtbDate',
    style: { minWidth: '64px', width: '64px' },
    displayRender: (value) => (
      value ? dayjs(value).format('YYYY-MM-DD').toString() : '-'
    ),
  },
  {
    label: 'Patient ID',
    style: {
      minWidth: '72px',
      width: '72px',
    },
    key: 'patientId',
  },
  {
    label: 'Cancer Type',
    style: {
      minWidth: '56px',
      width: '56px',
    },
    key: 'zero2Subcat1',
  },
  {
    label: 'Cancer Category',
    style: { minWidth: '68px', width: '68px' },
    key: 'zero2Category',
  },
  {
    label: 'MGMT Status',
    key: 'additionalData',
    style: { minWidth: '90px', width: '90px' },
    displayRender: (additionalData) => additionalData
      && additionalData.status,
  },
  {
    label: 'Final Diagnosis',
    style: {
      minWidth: '106px',
      width: '106px',
    },
    key: 'zero2FinalDiagnosis',
  },
];

export const methylationsClassifiersLeftPanelTableMapper: ILeftPanelTableMapper[] = [
  {
    label: 'MTB Meeting',
    key: 'mtbDate',
    style: { minWidth: '64px', width: '64px' },
    displayRender: (value) => (
      value ? dayjs(value).format('YYYY-MM-DD').toString() : '-'
    ),
  },
  {
    label: 'Patient ID',
    style: {
      minWidth: '84px',
      width: '84px',
    },
    key: 'patientId',
  },
  {
    label: 'Cancer Type',
    style: {
      minWidth: '56px',
      width: '56px',
    },
    key: 'zero2Subcat1',
  },
  {
    label: 'Cancer Category',
    style: { minWidth: '72px', width: '72px' },
    key: 'zero2Category',
  },
  {
    label: 'Calibrated Score',
    key: 'additionalData',
    style: { minWidth: '80px', width: '80px' },
    displayRender: (additionalData) => additionalData
      && additionalData.score
      && toFixed(additionalData.score, 2),
  },
  {
    label: 'Final Diagnosis',
    style: {
      minWidth: '100px',
      width: '100px',
    },
    key: 'zero2FinalDiagnosis',
  },
];

export const mutationalSigTableMapperArray: ISampleTableMapper[] = [
  {
    label: 'Signature',
    key: 'additionalData',
    style: {
      minWidth: '100px',
      width: '100px',
    },
    displayRender: (additionalData) => additionalData && additionalData.signature.replace('sig', 'Signature '),
  },
  {
    label: 'Contribution %',
    key: 'additionalData',
    style: {
      minWidth: '115px',
      width: '115px',
    },
    displayRender: (additionalData) => additionalData && additionalData.contribution,
  },
];
