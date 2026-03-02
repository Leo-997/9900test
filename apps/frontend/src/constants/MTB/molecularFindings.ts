import { toFixed } from '@/utils/math/toFixed';
import { IImmunoprofile } from '@/types/Precuration/QCMetrics.types';
import {
  IMolAltSummaryColumn,
  ITumourProfileColumn,
} from '@/types/MTB/MolecularAlteration.types';
import {
  IGeneAltSettings,
  INonGeneAltSettings,
  ITumourImmuneProfileSettings,
  ITumourMolecularProfileSettings,
} from '@/types/MTB/Settings.types';
import { boolToStr } from '@/utils/functions/bools';
import { getCytobandFormat } from '@/utils/functions/getCytobandFormat';

export const defaultGeneAltColumnSettings: IMolAltSummaryColumn<IGeneAltSettings>[] = [
  {
    label: 'Gene/Cytogenetics',
    key: 'gene',
    settingsKey: 'showGene',
    disabled: true,
    visible: true,
    minWidth: 'max(15vw, 192px)',
    displayTransform: (v, d): string => {
      if (['CYTOGENETICS_CYTOBAND', 'GERMLINE_CYTO_CYTOBAND'].includes(d.mutationType)) {
        return getCytobandFormat(v as string);
      }
      return v as string;
    },
  },
  {
    label: 'Alteration',
    key: 'clinicalAlteration',
    settingsKey: 'showAlteration',
    disabled: false,
    visible: true,
    minWidth: 'max(20vw, 256px)',
  },
  {
    label: 'RNA expression',
    key: 'clinicalRnaExpression',
    settingsKey: 'showRnaExp',
    disabled: false,
    visible: true,
    minWidth: 'max(10vw, 120px)',
  },
  {
    label: 'Pathway',
    key: 'pathway',
    settingsKey: 'showPathway',
    disabled: false,
    visible: false,
    minWidth: 'max(8vw, 102px)',
  },
  {
    label: 'Mutation Type',
    key: 'mutationType',
    settingsKey: 'showMutationType',
    disabled: false,
    visible: false,
    minWidth: 'max(8vw, 102px)',
  },
  {
    label: 'Frequency',
    key: 'frequency',
    settingsKey: 'showFrequency',
    disabled: false,
    visible: false,
    minWidth: 'max(9vw, 120px)',
  },
  {
    label: 'Prognostic Factor',
    key: 'prognosticFactor',
    settingsKey: 'showPrognosticFactor',
    disabled: false,
    visible: false,
    minWidth: 'max(11vw, 145px)',
    displayTransform: (v) => boolToStr(v as boolean),
  },
  {
    label: 'Reported As',
    key: 'clinicalReportable',
    settingsKey: 'showReportedAs',
    disabled: false,
    visible: false,
    minWidth: 'max(8vw, 102px)',
  },
  {
    label: 'Targetable',
    key: 'clinicalTargetable',
    settingsKey: 'showTargeted',
    disabled: false,
    visible: true,
    minWidth: 'max(8vw, 102px)',
  },
  {
    label: 'Comments',
    key: 'clinicalNotes',
    settingsKey: 'showClinicalNotes',
    disabled: false,
    visible: true,
    minWidth: 'max(20vw, 256px)',
  },
];

export const defaultNonGeneAltColumnSettings: IMolAltSummaryColumn<INonGeneAltSettings>[] = [
  {
    label: 'Classifier',
    key: 'alteration',
    settingsKey: 'showAlteration',
    disabled: true,
    visible: true,
    minWidth: 'max(15vw, 192px)',
    displayTransform: (v, data): string => {
      if (data.mutationType === 'METHYLATION_MGMT') {
        return 'MGMT Promoter';
      }
      return v as string;
    },
  },
  {
    label: 'Assay',
    key: 'assay',
    settingsKey: 'showAssay',
    disabled: false,
    visible: false,
    minWidth: 'max(8vw, 102px)',
    displayTransform: (v, data): string => {
      if (data.mutationType === 'RNA_CLASSIFIER') {
        return 'Transcriptomics';
      }
      return 'DNA Methylation';
    },
  },
  {
    label: 'Description',
    key: 'description',
    settingsKey: 'showDescription',
    disabled: false,
    visible: true,
    minWidth: 'max(20vw, 256px)',
  },
  {
    label: 'Targetable',
    key: 'clinicalTargetable',
    settingsKey: 'showTargeted',
    disabled: false,
    visible: false,
    minWidth: 'max(8vw, 102px)',
  },
  {
    label: 'Comments',
    key: 'clinicalNotes',
    settingsKey: 'showClinicalNotes',
    disabled: false,
    visible: false,
    minWidth: 'max(20vw, 256px)',
  },
];

export const defaultTumourMolecularProfileColumnSettings:
ITumourProfileColumn<ITumourMolecularProfileSettings>[] = [
  {
    label: 'Tumour mutational burden',
    key: 'tumourMutationBurden',
    settingsKey: 'showMutBurden',
    displayTransform: (v, { tumourMutationBurden }): string => {
      const { somMissenseSnvs, mutBurdenMb } = tumourMutationBurden;
      const strings: string[] = [];
      if (somMissenseSnvs !== null && somMissenseSnvs !== undefined) strings.push(`${somMissenseSnvs} SNVs/exome`);
      if (mutBurdenMb !== null && mutBurdenMb !== undefined) strings.push(`${toFixed(mutBurdenMb, 2)} mut/mb`);
      return strings.join(' - ') || '-';
    },
    minWidth: '25%',
    disabled: false,
    visible: true,
  },
  {
    label: 'Purity',
    key: 'purity',
    settingsKey: 'showPurity',
    displayTransform: (value) => `${toFixed((value as number) * 100, 0)}%`,
    minWidth: 'auto',
    disabled: false,
    visible: true,
  },
  {
    label: 'MSI Status',
    key: 'msStatus',
    settingsKey: 'showMSI',
    minWidth: 'auto',
    disabled: false,
    visible: false,
  },
  {
    label: 'LOH Proportion',
    key: 'lohProportion',
    settingsKey: 'showLOH',
    displayTransform: (value) => (
      `${toFixed((value as number) * 100, 2)} %`
    ),
    minWidth: 'auto',
    disabled: false,
    visible: false,
  },
  {
    label: 'Ploidy',
    key: 'ploidy',
    settingsKey: 'showPloidy',
    minWidth: 'auto',
    disabled: false,
    visible: true,
  },
];

const getContent = (
  value: number | null | undefined,
  percentile: number | null | undefined,
  status?: string,
): string => {
  const formattedValue = value !== undefined && value !== null
    ? value.toFixed(2)
    : '';

  const formattedPercentile = percentile !== undefined && percentile !== null
    ? ` (${percentile.toFixed(1)}%)`
    : '';

  if (formattedValue) {
    return `${status ? `${status}; ` : ''}${formattedValue}${formattedPercentile}`;
  }
  return 'N/A';
};

const getContentScientific = (
  value: number | null | undefined,
  percentile: number | null | undefined,
  status?: string,
): string => {
  const formattedValue = typeof value === 'number'
    ? value.toExponential(2)
    : '';

  const formattedPercentile = percentile !== undefined && percentile !== null
    ? ` (${percentile.toFixed(1)}%)`
    : '';

  if (formattedValue) {
    return `${status ? `${status}; ` : ''}${formattedValue}${formattedPercentile}`;
  }

  return 'N/A';
};

export const defaultTumourImmuneProfileColumnSettings:
ITumourProfileColumn<ITumourImmuneProfileSettings>[] = [
  {
    label: 'IPASS Status; score (percentile)',
    key: 'ipass',
    settingsKey: 'showIPASS',
    disabled: true,
    visible: true,
    minWidth: 'max(20vw, 256px)',
    displayTransform: (value): string => {
      const { ipassValue, ipassptile, ipassStatus } = value as IImmunoprofile;
      return getContent(ipassValue, ipassptile, ipassStatus);
    },
  },
  {
    label: 'M1M2 score (percentile)',
    key: 'm1m2',
    settingsKey: 'showM1M2',
    disabled: false,
    visible: true,
    minWidth: 'max(15vw, 192px)',
    displayTransform: (value): string => {
      const { m1m2Value, m1m2ptile } = value as IImmunoprofile;
      return getContent(m1m2Value, m1m2ptile);
    },
  },
  {
    label: 'CD8+ score (percentile)',
    key: 'cd8',
    settingsKey: 'showCD8',
    disabled: false,
    visible: true,
    minWidth: 'max(15vw, 192px)',
    displayTransform: (value): string => {
      const { cd8Value, cd8ptile } = value as IImmunoprofile;
      return getContentScientific(cd8Value, cd8ptile);
    },
  },
];
