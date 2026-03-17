import { cnvCNTypeOptions, cytoCNTypeOptions } from '@/constants/options';
import { IGermlineCNV } from '@/types/CNV.types';
import { ICytogeneticsData, ISampleCytoband } from '@/types/Cytogenetics.types';
import { IReportableGermlineSNV } from '@/types/SNV.types';
import { IGermlineSV } from '@/types/SV.types';
import { getCytobandFormat } from '@/utils/functions/getCytobandFormat';
import { getGermlineZygosity } from '@/utils/functions/getGermlineZygosity';
import { getProteinChangeFromHgvs } from '@/utils/functions/getProteinChangeFromHgvs';
import { getVariantFromHgvs } from '@/utils/functions/getVariantFromHgvs';
import { getCurationSVGenes } from '@/utils/functions/getSVGenes';
import { mapToReadingFrame } from '@/utils/functions/inframeUtils';
import { isClassified } from '@/utils/functions/reportable/isClassified';
import { toFixed } from '@/utils/math/toFixed';

type ComparisonStatus = 'Shared' | 'Unique' | 'Changed';
export type GermlineSubgroup =
  | 'Germline SNVs'
  | 'Germline CNVs'
  | 'Germline SV Fusions'
  | 'Germline SV Disruptions'
  | 'Germline Cytogenetics Arms'
  | 'Germline Cytobands';

interface IComparisonGermlineCell {
  present: boolean;
  lines: string[];
  diffFields: Array<{
    label: string;
    value: string;
  }>;
}

interface IComparableGermlineFinding {
  key: string;
  subgroup: GermlineSubgroup;
  finding: string;
  secondary: string;
  sortValue: string;
  cell: IComparisonGermlineCell;
}

export interface IComparisonGermlineDifference {
  label: string;
  primary: string;
  comparison: string;
}

export interface IComparisonGermlineRow {
  id: string;
  subgroup: GermlineSubgroup;
  finding: string;
  secondary: string;
  status: ComparisonStatus;
  differences: IComparisonGermlineDifference[];
  uniqueTo: 'primary' | 'comparison' | null;
  primary: IComparisonGermlineCell | null;
  comparison: IComparisonGermlineCell | null;
}

export interface IComparisonGermlineCounts {
  shared: number;
  unique: number;
  changed: number;
}

const defaultCounts: IComparisonGermlineCounts = {
  shared: 0,
  unique: 0,
  changed: 0,
};

function getPathclassValue(pathclass?: string | null): string {
  if (!pathclass) return '-';
  return pathclass.split(':')[1]?.trim() || pathclass;
}

function getVafValue(altad?: number | null, depth?: number | null): string {
  if (
    altad === undefined
    || altad === null
    || depth === undefined
    || depth === null
    || depth === 0
  ) {
    return '-';
  }

  return `${toFixed((altad / depth) * 100, 2)}%`;
}

function getPlatformValue(platforms: string | null | undefined): string {
  switch (platforms) {
    case 'W':
      return 'WGS';
    case 'R':
      return 'RNA';
    case 'P':
      return 'Panel';
    case 'WR':
      return 'WGS + RNA';
    case 'WP':
      return 'WGS + Panel';
    case 'RP':
      return 'RNA + Panel';
    case 'WPR':
      return 'WGS + RNA + Panel';
    default:
      return '-';
  }
}

function getSvVafValue(sv: IGermlineSV): string {
  const values = [sv.startAf, sv.endAf].filter((value) => (
    value !== undefined
    && value !== null
    && !Number.isNaN(value)
  ));

  if (!values.length) return '-';

  return toFixed(values.reduce((acc, value) => acc + value, 0) / values.length, 2);
}

function getSnvKey(snv: IReportableGermlineSNV): string {
  if (snv.chr && snv.variantId) {
    return `variant::${snv.variantId}`;
  }

  if (snv.chr && snv.hgvs) {
    return `${snv.chr.toLowerCase()}::${snv.hgvs.toLowerCase()}`;
  }

  return `${snv.gene.toLowerCase()}::${snv.variantId}`;
}

function getSnvFinding(snv: IReportableGermlineSNV): IComparableGermlineFinding {
  const variant = getVariantFromHgvs(snv.hgvs);
  const protein = getProteinChangeFromHgvs(snv.hgvs);

  return {
    key: getSnvKey(snv),
    subgroup: 'Germline SNVs',
    finding: snv.gene,
    secondary: `${variant} | Protein ${protein}`,
    sortValue: `${snv.gene}::${variant}`,
    cell: {
      present: true,
      lines: [
        `VAF ${getVafValue(snv.altad, snv.depth)} | Germline ${getGermlineZygosity(snv)}`,
        `Pathclass ${getPathclassValue(snv.pathclass)} | Somatic ${snv.somaticSnvZygosity || 'Not present'}`,
      ],
      diffFields: [
        { label: 'VAF', value: getVafValue(snv.altad, snv.depth) },
        { label: 'Germline zygosity', value: getGermlineZygosity(snv) },
        { label: 'Pathclass', value: getPathclassValue(snv.pathclass) },
        { label: 'Somatic zygosity', value: snv.somaticSnvZygosity || 'Not present' },
      ],
    },
  };
}

function getCnvKey(cnv: IGermlineCNV): string {
  const chromosome = cnv.chromosome?.toLowerCase().replace(/^chr/, '') || '';
  const cytoband = cnv.cytoband?.toLowerCase() || '';
  const gene = cnv.gene?.toLowerCase() || '';

  if (gene && chromosome && cytoband) {
    return `${gene}::${chromosome}::${cytoband}`;
  }

  if (gene && chromosome) return `${gene}::${chromosome}`;

  return `variant::${cnv.variantId}`;
}

function getCnvFinding(cnv: IGermlineCNV): IComparableGermlineFinding {
  const cnType = cnvCNTypeOptions.find((option) => option.value === cnv.cnType)?.name || '-';
  const region = `${cnv.chromosome.replace(/^chr/i, '')}${cnv.cytoband}`;

  return {
    key: getCnvKey(cnv),
    subgroup: 'Germline CNVs',
    finding: cnv.gene,
    secondary: region,
    sortValue: `${cnv.gene}::${region}`,
    cell: {
      present: true,
      lines: [
        `CN ${toFixed(cnv.averageCN, 2)} | Type ${cnType}`,
        `Pathclass ${getPathclassValue(cnv.pathclass)}`,
      ],
      diffFields: [
        { label: 'Copy number', value: toFixed(cnv.averageCN, 2) },
        { label: 'CN type', value: cnType },
        { label: 'Pathclass', value: getPathclassValue(cnv.pathclass) },
      ],
    },
  };
}

function getFusionKey(sv: IGermlineSV): string {
  const genes = [sv.startGene.gene, sv.endGene.gene]
    .map((gene) => gene.toLowerCase())
    .sort()
    .join('::');

  if (genes) return `fusion::${genes}`;

  return `fusion::${sv.chrBkpt1}:${sv.posBkpt1}::${sv.chrBkpt2}:${sv.posBkpt2}`;
}

function getSvCell(sv: IGermlineSV, eventLabel: string): IComparisonGermlineCell {
  return {
    present: true,
    lines: [
      `Event ${eventLabel} | Frame ${mapToReadingFrame(sv.inframe)}`,
      `Platform ${getPlatformValue(sv.platforms)} | VAF ${getSvVafValue(sv)}`,
      `Pathclass ${getPathclassValue(sv.pathclass)}`,
    ],
    diffFields: [
      { label: 'Event', value: eventLabel },
      { label: 'Breakpoint 1', value: `${sv.chrBkpt1.replace(/^chr/i, '')}:${sv.posBkpt1}` },
      { label: 'Breakpoint 2', value: `${sv.chrBkpt2.replace(/^chr/i, '')}:${sv.posBkpt2}` },
      { label: 'Frame', value: mapToReadingFrame(sv.inframe) },
      { label: 'Platform', value: getPlatformValue(sv.platforms) },
      { label: 'VAF', value: getSvVafValue(sv) },
      { label: 'Pathclass', value: getPathclassValue(sv.pathclass) },
    ],
  };
}

function getSvFusionFinding(sv: IGermlineSV): IComparableGermlineFinding | null {
  const isDisruption = sv.svType.toLowerCase() === 'disruption'
    || (sv.markDisrupted && sv.markDisrupted !== 'No');

  if (isDisruption) return null;

  return {
    key: getFusionKey(sv),
    subgroup: 'Germline SV Fusions',
    finding: getCurationSVGenes(sv),
    secondary: `${sv.chrBkpt1.replace(/^chr/i, '')}:${sv.posBkpt1} | ${sv.chrBkpt2.replace(/^chr/i, '')}:${sv.posBkpt2}`,
    sortValue: `${getCurationSVGenes(sv)}::${sv.posBkpt1}::${sv.posBkpt2}`,
    cell: getSvCell(sv, sv.svType || '-'),
  };
}

function getSvDisruptionFindings(sv: IGermlineSV): IComparableGermlineFinding[] {
  const findings: IComparableGermlineFinding[] = [];
  const isTrueDisruption = sv.svType.toLowerCase() === 'disruption';

  if (isTrueDisruption || sv.markDisrupted === 'Start' || sv.markDisrupted === 'Yes') {
    findings.push({
      key: `sv-disruption::${sv.startGene.gene.toLowerCase()}`,
      subgroup: 'Germline SV Disruptions',
      finding: sv.startGene.gene,
      secondary: `${sv.chrBkpt1.replace(/^chr/i, '')}:${sv.posBkpt1} | ${sv.chrBkpt2.replace(/^chr/i, '')}:${sv.posBkpt2}`,
      sortValue: `${sv.startGene.gene}::${sv.posBkpt1}`,
      cell: getSvCell(sv, isTrueDisruption ? 'Disruption' : 'Start gene'),
    });
  }

  if (sv.markDisrupted === 'End' && !isTrueDisruption) {
    findings.push({
      key: `sv-disruption::${sv.endGene.gene.toLowerCase()}`,
      subgroup: 'Germline SV Disruptions',
      finding: sv.endGene.gene,
      secondary: `${sv.chrBkpt1.replace(/^chr/i, '')}:${sv.posBkpt1} | ${sv.chrBkpt2.replace(/^chr/i, '')}:${sv.posBkpt2}`,
      sortValue: `${sv.endGene.gene}::${sv.posBkpt2}`,
      cell: getSvCell(sv, 'End gene'),
    });
  }

  if (sv.markDisrupted === 'Both' && !isTrueDisruption) {
    findings.push(
      {
        key: `sv-disruption::${sv.startGene.gene.toLowerCase()}`,
        subgroup: 'Germline SV Disruptions',
        finding: sv.startGene.gene,
        secondary: `${sv.chrBkpt1.replace(/^chr/i, '')}:${sv.posBkpt1} | ${sv.chrBkpt2.replace(/^chr/i, '')}:${sv.posBkpt2}`,
        sortValue: `${sv.startGene.gene}::${sv.posBkpt1}`,
        cell: getSvCell(sv, 'Start gene'),
      },
      {
        key: `sv-disruption::${sv.endGene.gene.toLowerCase()}`,
        subgroup: 'Germline SV Disruptions',
        finding: sv.endGene.gene,
        secondary: `${sv.chrBkpt1.replace(/^chr/i, '')}:${sv.posBkpt1} | ${sv.chrBkpt2.replace(/^chr/i, '')}:${sv.posBkpt2}`,
        sortValue: `${sv.endGene.gene}::${sv.posBkpt2}`,
        cell: getSvCell(sv, 'End gene'),
      },
    );
  }

  return findings;
}

function getCytoArmFinding(data: ICytogeneticsData): IComparableGermlineFinding {
  const eventType = cytoCNTypeOptions.find((option) => option.value === data.cnType)?.name || '-';

  return {
    key: `cyto-arm::${data.chr}::${data.arm}`,
    subgroup: 'Germline Cytobands',
    finding: `${data.chr.toString().replace(/^chr/i, '')}${data.arm}`,
    secondary: 'Chromosome arm',
    sortValue: `${data.chr}::${data.arm}`,
    cell: {
      present: true,
      lines: [
        `Event ${eventType} | CN ${toFixed(data.avgCN, 2)}`,
        `Interpretation ${data.classification || '-'}`,
      ],
      diffFields: [
        { label: 'Event type', value: eventType },
        { label: 'Copy number', value: toFixed(data.avgCN, 2) },
        { label: 'Interpretation', value: data.classification || '-' },
      ],
    },
  };
}

function getCytoBandFinding(data: ISampleCytoband): IComparableGermlineFinding {
  const eventType = cytoCNTypeOptions.find((option) => option.value === data.cnType)?.name || '-';
  const label = `${data.chr.toString().replace(/^chr/i, '')}${getCytobandFormat(data.cytoband)}`;

  return {
    key: `cyto-band::${data.chr}::${data.cytoband}`,
    subgroup: 'Germline Cytogenetics Arms',
    finding: label,
    secondary: 'Reportable cytoband',
    sortValue: `${data.chr}::${data.cytoband}`,
    cell: {
      present: true,
      lines: [
        `Event ${eventType} | CN ${toFixed(data.customCn ?? data.avgCN ?? 0, 2)}`,
        `Interpretation ${data.classification || '-'}`,
      ],
      diffFields: [
        { label: 'Event type', value: eventType },
        { label: 'Copy number', value: toFixed(data.customCn ?? data.avgCN ?? 0, 2) },
        { label: 'Interpretation', value: data.classification || '-' },
      ],
    },
  };
}

function getGermlineFindings(input: {
  snvs: IReportableGermlineSNV[];
  cnvs: IGermlineCNV[];
  svs: IGermlineSV[];
  cytoArms: ICytogeneticsData[];
  cytoBands: ISampleCytoband[];
}): IComparableGermlineFinding[] {
  return [
    ...input.snvs.map(getSnvFinding),
    ...input.cnvs.map(getCnvFinding),
    ...input.svs
      .map(getSvFusionFinding)
      .filter(Boolean) as IComparableGermlineFinding[],
    ...input.svs.flatMap(getSvDisruptionFindings),
    ...input.cytoArms
      .filter((arm) => Boolean(arm.reportable) || isClassified(arm))
      .map(getCytoArmFinding),
    ...input.cytoBands
      .filter((band) => Boolean(band.reportable) || isClassified(band))
      .map(getCytoBandFinding),
  ];
}

function getDifferences(
  primary: IComparisonGermlineCell,
  comparison: IComparisonGermlineCell,
): IComparisonGermlineDifference[] {
  return primary.diffFields
    .filter((field) => (
      field.value !== comparison.diffFields.find(
        (comparisonField) => comparisonField.label === field.label,
      )?.value
    ))
    .map((field) => ({
      label: field.label,
      primary: field.value,
      comparison: comparison.diffFields.find(
        (comparisonField) => comparisonField.label === field.label,
      )?.value || '-',
    }));
}

function sortFindings(findings: IComparableGermlineFinding[]): IComparableGermlineFinding[] {
  return [...findings].sort((left, right) => left.sortValue.localeCompare(right.sortValue));
}

function groupFindings(
  findings: IComparableGermlineFinding[],
): Map<string, IComparableGermlineFinding[]> {
  return findings.reduce((acc, finding) => {
    const bucket = acc.get(finding.key) || [];
    bucket.push(finding);
    acc.set(finding.key, bucket);
    return acc;
  }, new Map<string, IComparableGermlineFinding[]>());
}

const subgroupOrder: GermlineSubgroup[] = [
  'Germline SNVs',
  'Germline CNVs',
  'Germline SV Fusions',
  'Germline SV Disruptions',
  'Germline Cytogenetics Arms',
  'Germline Cytobands',
];

export function buildGermlineComparisonRows(input: {
  primarySnvs: IReportableGermlineSNV[];
  primaryCnvs: IGermlineCNV[];
  primarySvs: IGermlineSV[];
  primaryCytoArms: ICytogeneticsData[];
  primaryCytoBands: ISampleCytoband[];
  comparisonSnvs: IReportableGermlineSNV[];
  comparisonCnvs: IGermlineCNV[];
  comparisonSvs: IGermlineSV[];
  comparisonCytoArms: ICytogeneticsData[];
  comparisonCytoBands: ISampleCytoband[];
}): IComparisonGermlineRow[] {
  const primaryGroups = groupFindings(getGermlineFindings({
    snvs: input.primarySnvs,
    cnvs: input.primaryCnvs,
    svs: input.primarySvs,
    cytoArms: input.primaryCytoArms,
    cytoBands: input.primaryCytoBands,
  }));
  const comparisonGroups = groupFindings(getGermlineFindings({
    snvs: input.comparisonSnvs,
    cnvs: input.comparisonCnvs,
    svs: input.comparisonSvs,
    cytoArms: input.comparisonCytoArms,
    cytoBands: input.comparisonCytoBands,
  }));

  const keys = Array.from(new Set([
    ...primaryGroups.keys(),
    ...comparisonGroups.keys(),
  ]));

  const rows = keys.flatMap((key) => {
    const primaryBucket = sortFindings(primaryGroups.get(key) || []);
    const comparisonBucket = sortFindings(comparisonGroups.get(key) || []);
    const bucketSize = Math.max(primaryBucket.length, comparisonBucket.length);
    const bucketRows: IComparisonGermlineRow[] = [];

    for (let index = 0; index < bucketSize; index += 1) {
      const primaryFinding = primaryBucket[index];
      const comparisonFinding = comparisonBucket[index];
      const sourceFinding = primaryFinding || comparisonFinding;
      const primaryCell = primaryFinding?.cell || null;
      const comparisonCell = comparisonFinding?.cell || null;
      const differences = primaryCell && comparisonCell
        ? getDifferences(primaryCell, comparisonCell)
        : [];

      let status: ComparisonStatus = 'Shared';
      if (!primaryCell || !comparisonCell) {
        status = 'Unique';
      } else if (differences.length) {
        status = 'Changed';
      }

      let uniqueTo: 'primary' | 'comparison' | null = null;
      if (primaryCell && !comparisonCell) uniqueTo = 'primary';
      if (!primaryCell && comparisonCell) uniqueTo = 'comparison';

      bucketRows.push({
        id: `${key}::${index}`,
        subgroup: sourceFinding?.subgroup || 'Germline SNVs',
        finding: sourceFinding?.finding || '-',
        secondary: sourceFinding?.secondary || '-',
        status,
        differences,
        uniqueTo,
        primary: primaryCell,
        comparison: comparisonCell,
      });
    }

    return bucketRows;
  });

  return rows.sort((left, right) => {
    const getStatusOrder = (status: ComparisonStatus): number => {
      switch (status) {
        case 'Changed':
          return 0;
        case 'Unique':
          return 1;
        case 'Shared':
        default:
          return 2;
      }
    };

    const statusDiff = getStatusOrder(left.status) - getStatusOrder(right.status);
    if (statusDiff !== 0) return statusDiff;

    const subgroupDiff = subgroupOrder.indexOf(left.subgroup)
      - subgroupOrder.indexOf(right.subgroup);
    if (subgroupDiff !== 0) return subgroupDiff;

    return left.finding.localeCompare(right.finding);
  });
}

export function getGermlineComparisonCounts(
  rows: IComparisonGermlineRow[],
): IComparisonGermlineCounts {
  return rows.reduce((acc, row) => {
    if (row.status === 'Shared') acc.shared += 1;
    if (row.status === 'Unique') acc.unique += 1;
    if (row.status === 'Changed') acc.changed += 1;
    return acc;
  }, { ...defaultCounts });
}
