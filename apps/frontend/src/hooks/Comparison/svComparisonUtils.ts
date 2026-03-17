import { ISomaticSV } from '@/types/SV.types';
import { getCurationSVGenes } from '@/utils/functions/getSVGenes';
import { mapToReadingFrame } from '@/utils/functions/inframeUtils';
import { toFixed } from '@/utils/math/toFixed';

type ComparisonStatus = 'Shared' | 'Unique' | 'Changed';
type ComparisonSvCategory = 'Fusion' | 'Disruption';

interface IComparableSvFinding {
  key: string;
  genes: string;
  category: ComparisonSvCategory;
  cell: IComparisonSvCell;
  sortValue: string;
  variantId: number;
}

interface IComparisonSvCell {
  present: boolean;
  eventLabel: string;
  breakpoint: string;
  frame: string;
  platform: string;
  vaf: string;
}

export interface IComparisonSvDifference {
  label: string;
  primary: string;
  comparison: string;
}

export interface IComparisonSvRow {
  id: string;
  genes: string;
  category: ComparisonSvCategory;
  status: ComparisonStatus;
  differences: IComparisonSvDifference[];
  uniqueTo: 'primary' | 'comparison' | null;
  primary: IComparisonSvCell | null;
  comparison: IComparisonSvCell | null;
}

export interface IComparisonSvCounts {
  shared: number;
  unique: number;
  changed: number;
}

const defaultCounts: IComparisonSvCounts = {
  shared: 0,
  unique: 0,
  changed: 0,
};

function getNormalizedValue(value?: string | number | null): string {
  if (value === undefined || value === null || value === '') return '';
  return String(value).trim().toLowerCase();
}

function getBreakpointValue(sv: ISomaticSV): string {
  return `${sv.chrBkpt1.toString().replace(/^chr/i, '')}:${sv.posBkpt1} | ${sv.chrBkpt2.toString().replace(/^chr/i, '')}:${sv.posBkpt2}`;
}

function getPlatformValue(platforms: ISomaticSV['platforms']): string {
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

function getVafValue(sv: ISomaticSV): string {
  const values = [sv.startAf, sv.endAf].filter((value) => (
    value !== undefined
    && value !== null
    && !Number.isNaN(value)
  ));

  if (!values.length) return '-';

  const average = values.reduce((acc, value) => acc + value, 0) / values.length;
  return toFixed(average, 2);
}

function getFusionKey(sv: ISomaticSV): string {
  const genes = [sv.startGene.gene, sv.endGene.gene]
    .map((gene) => getNormalizedValue(gene))
    .filter(Boolean)
    .sort()
    .join('::');

  if (genes) return `fusion::${genes}`;

  return `fusion::${getNormalizedValue(sv.chrBkpt1)}:${sv.posBkpt1}::${getNormalizedValue(sv.chrBkpt2)}:${sv.posBkpt2}`;
}

function getDisruptionEntries(sv: ISomaticSV): IComparableSvFinding[] {
  const entries: Array<{ gene: string; role: string }> = [];
  const isTrueDisruption = sv.svType.toLowerCase() === 'disruption';

  if (isTrueDisruption || sv.markDisrupted === 'Start' || sv.markDisrupted === 'Yes') {
    entries.push({ gene: sv.startGene.gene, role: 'Start gene' });
  }

  if (sv.markDisrupted === 'End' && !isTrueDisruption) {
    entries.push({ gene: sv.endGene.gene, role: 'End gene' });
  }

  if (sv.markDisrupted === 'Both' && !isTrueDisruption) {
    entries.push(
      { gene: sv.startGene.gene, role: 'Start gene' },
      { gene: sv.endGene.gene, role: 'End gene' },
    );
  }

  return entries.map(({ gene, role }) => {
    const normalizedGene = getNormalizedValue(gene) || getNormalizedValue(sv.variantId);
    const breakpoint = getBreakpointValue(sv);
    return {
      key: `disruption::${normalizedGene}`,
      genes: gene || '-',
      category: 'Disruption',
      cell: {
        present: true,
        eventLabel: role,
        breakpoint,
        frame: mapToReadingFrame(sv.inframe),
        platform: getPlatformValue(sv.platforms),
        vaf: getVafValue(sv),
      },
      sortValue: `${gene}::${breakpoint}`,
      variantId: sv.variantId,
    };
  });
}

function getFusionEntries(sv: ISomaticSV): IComparableSvFinding[] {
  const isDisruption = sv.svType.toLowerCase() === 'disruption'
    || (sv.markDisrupted && sv.markDisrupted !== 'No');

  if (isDisruption) return [];

  const breakpoint = getBreakpointValue(sv);
  return [
    {
      key: getFusionKey(sv),
      genes: getCurationSVGenes(sv),
      category: 'Fusion',
      cell: {
        present: true,
        eventLabel: sv.svType || '-',
        breakpoint,
        frame: mapToReadingFrame(sv.inframe),
        platform: getPlatformValue(sv.platforms),
        vaf: getVafValue(sv),
      },
      sortValue: `${getCurationSVGenes(sv)}::${breakpoint}`,
      variantId: sv.variantId,
    },
  ];
}

function getComparableFindings(svs: ISomaticSV[]): IComparableSvFinding[] {
  const findings: IComparableSvFinding[] = [];

  for (const sv of svs) {
    findings.push(...getFusionEntries(sv));
    findings.push(...getDisruptionEntries(sv));
  }

  return findings;
}

function getDifferences(
  primary: IComparisonSvCell,
  comparison: IComparisonSvCell,
): IComparisonSvDifference[] {
  const fields: Array<[string, string, string]> = [
    ['Event', primary.eventLabel, comparison.eventLabel],
    ['Breakpoint', primary.breakpoint, comparison.breakpoint],
    ['Frame', primary.frame, comparison.frame],
    ['Platform', primary.platform, comparison.platform],
    ['VAF', primary.vaf, comparison.vaf],
  ];

  return fields
    .filter(([, left, right]) => left !== right)
    .map(([label, left, right]) => ({
      label,
      primary: left,
      comparison: right,
    }));
}

function sortFindings(findings: IComparableSvFinding[]): IComparableSvFinding[] {
  return [...findings].sort((left, right) => {
    const geneDiff = left.genes.localeCompare(right.genes);
    if (geneDiff !== 0) return geneDiff;

    const sortDiff = left.sortValue.localeCompare(right.sortValue);
    if (sortDiff !== 0) return sortDiff;

    return left.variantId - right.variantId;
  });
}

function groupFindings(findings: IComparableSvFinding[]): Map<string, IComparableSvFinding[]> {
  return findings.reduce((acc, finding) => {
    const bucket = acc.get(finding.key) || [];
    bucket.push(finding);
    acc.set(finding.key, bucket);
    return acc;
  }, new Map<string, IComparableSvFinding[]>());
}

export function buildSvComparisonRows(
  primarySvs: ISomaticSV[],
  comparisonSvs: ISomaticSV[],
): IComparisonSvRow[] {
  const primaryMap = groupFindings(getComparableFindings(primarySvs));
  const comparisonMap = groupFindings(getComparableFindings(comparisonSvs));
  const keys = Array.from(new Set([
    ...primaryMap.keys(),
    ...comparisonMap.keys(),
  ]));

  const rows = keys.flatMap((key) => {
    const primaryBucket = sortFindings(primaryMap.get(key) || []);
    const comparisonBucket = sortFindings(comparisonMap.get(key) || []);
    const bucketSize = Math.max(primaryBucket.length, comparisonBucket.length);
    const bucketRows: IComparisonSvRow[] = [];

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
        genes: sourceFinding?.genes || '-',
        category: sourceFinding?.category || 'Fusion',
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

    return left.genes.localeCompare(right.genes);
  });
}

export function getSvComparisonCounts(rows: IComparisonSvRow[]): IComparisonSvCounts {
  return rows.reduce((acc, row) => {
    if (row.status === 'Shared') acc.shared += 1;
    if (row.status === 'Unique') acc.unique += 1;
    if (row.status === 'Changed') acc.changed += 1;
    return acc;
  }, { ...defaultCounts });
}
