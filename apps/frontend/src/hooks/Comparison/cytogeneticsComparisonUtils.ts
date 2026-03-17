import { cytoCNTypeOptions } from '@/constants/options';
import { ICytogeneticsData, ISampleCytoband } from '@/types/Cytogenetics.types';
import { getCytobandFormat } from '@/utils/functions/getCytobandFormat';
import { isClassified } from '@/utils/functions/reportable/isClassified';
import { toFixed } from '@/utils/math/toFixed';

type ComparisonStatus = 'Shared' | 'Unique' | 'Changed';
type ComparisonCytoCategory = 'Chromosome arm' | 'Cytoband';

interface IComparisonCytoCell {
  present: boolean;
  eventType: string;
  copyNumber: string;
  interpretation: string;
}

interface IComparableCytoFinding {
  key: string;
  label: string;
  category: ComparisonCytoCategory;
  cell: IComparisonCytoCell;
  sortValue: string;
}

export interface IComparisonCytoDifference {
  label: string;
  primary: string;
  comparison: string;
}

export interface IComparisonCytoRow {
  id: string;
  label: string;
  category: ComparisonCytoCategory;
  status: ComparisonStatus;
  differences: IComparisonCytoDifference[];
  uniqueTo: 'primary' | 'comparison' | null;
  primary: IComparisonCytoCell | null;
  comparison: IComparisonCytoCell | null;
}

export interface IComparisonCytoCounts {
  shared: number;
  unique: number;
  changed: number;
}

const defaultCounts: IComparisonCytoCounts = {
  shared: 0,
  unique: 0,
  changed: 0,
};

function getEventTypeValue(cnType?: string | null): string {
  return cytoCNTypeOptions.find((option) => option.value === cnType)?.name || '-';
}

function getInterpretationValue(classification?: string | null): string {
  if (!classification) return '-';
  return classification;
}

function getCopyNumberValue(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '-';
  return toFixed(value, 2);
}

function getArmLabel(data: ICytogeneticsData): string {
  return `${data.chr.toString().replace(/^chr/i, '')}${data.arm}`;
}

function getArmFinding(data: ICytogeneticsData): IComparableCytoFinding {
  return {
    key: `arm::${data.chr}::${data.arm}`,
    label: getArmLabel(data),
    category: 'Chromosome arm',
    cell: {
      present: true,
      eventType: getEventTypeValue(data.cnType),
      copyNumber: getCopyNumberValue(data.avgCN),
      interpretation: getInterpretationValue(data.classification),
    },
    sortValue: `${data.chr}::${data.arm}`,
  };
}

function getCytobandLabel(data: ISampleCytoband): string {
  return `${data.chr.toString().replace(/^chr/i, '')}${getCytobandFormat(data.cytoband)}`;
}

function getCytobandFinding(data: ISampleCytoband): IComparableCytoFinding {
  return {
    key: `cytoband::${data.chr}::${data.cytoband}`,
    label: getCytobandLabel(data),
    category: 'Cytoband',
    cell: {
      present: true,
      eventType: getEventTypeValue(data.cnType),
      copyNumber: getCopyNumberValue(data.customCn ?? data.avgCN),
      interpretation: getInterpretationValue(data.classification),
    },
    sortValue: `${data.chr}::${data.cytoband}`,
  };
}

function isMeaningfulArm(data: ICytogeneticsData): boolean {
  return Boolean(data.reportable) || isClassified(data);
}

function getComparableFindings(
  arms: ICytogeneticsData[],
  cytobands: ISampleCytoband[],
): IComparableCytoFinding[] {
  return [
    ...arms
      .filter((arm) => isMeaningfulArm(arm))
      .map(getArmFinding),
    ...cytobands
      .filter((cytoband) => Boolean(cytoband.reportable) || isClassified(cytoband))
      .map(getCytobandFinding),
  ];
}

function getDifferences(
  primary: IComparisonCytoCell,
  comparison: IComparisonCytoCell,
): IComparisonCytoDifference[] {
  const fields: Array<[string, string, string]> = [
    ['Event type', primary.eventType, comparison.eventType],
    ['Copy number', primary.copyNumber, comparison.copyNumber],
    ['Interpretation', primary.interpretation, comparison.interpretation],
  ];

  return fields
    .filter(([, left, right]) => left !== right)
    .map(([label, left, right]) => ({
      label,
      primary: left,
      comparison: right,
    }));
}

function sortFindings(findings: IComparableCytoFinding[]): IComparableCytoFinding[] {
  return [...findings].sort((left, right) => left.sortValue.localeCompare(right.sortValue));
}

function groupFindings(findings: IComparableCytoFinding[]): Map<string, IComparableCytoFinding[]> {
  return findings.reduce((acc, finding) => {
    const bucket = acc.get(finding.key) || [];
    bucket.push(finding);
    acc.set(finding.key, bucket);
    return acc;
  }, new Map<string, IComparableCytoFinding[]>());
}

export function buildCytogeneticsComparisonRows(
  primaryArms: ICytogeneticsData[],
  primaryCytobands: ISampleCytoband[],
  comparisonArms: ICytogeneticsData[],
  comparisonCytobands: ISampleCytoband[],
): IComparisonCytoRow[] {
  const primaryFindings = groupFindings(
    getComparableFindings(primaryArms, primaryCytobands),
  );
  const comparisonFindings = groupFindings(
    getComparableFindings(comparisonArms, comparisonCytobands),
  );
  const keys = Array.from(new Set([
    ...primaryFindings.keys(),
    ...comparisonFindings.keys(),
  ]));

  const rows = keys.flatMap((key) => {
    const primaryBucket = sortFindings(primaryFindings.get(key) || []);
    const comparisonBucket = sortFindings(comparisonFindings.get(key) || []);
    const bucketSize = Math.max(primaryBucket.length, comparisonBucket.length);
    const bucketRows: IComparisonCytoRow[] = [];

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
        label: sourceFinding?.label || '-',
        category: sourceFinding?.category || 'Chromosome arm',
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

    if (left.category !== right.category) {
      return left.category.localeCompare(right.category);
    }

    return left.label.localeCompare(right.label);
  });
}

export function getCytogeneticsComparisonCounts(
  rows: IComparisonCytoRow[],
): IComparisonCytoCounts {
  return rows.reduce((acc, row) => {
    if (row.status === 'Shared') acc.shared += 1;
    if (row.status === 'Unique') acc.unique += 1;
    if (row.status === 'Changed') acc.changed += 1;
    return acc;
  }, { ...defaultCounts });
}
