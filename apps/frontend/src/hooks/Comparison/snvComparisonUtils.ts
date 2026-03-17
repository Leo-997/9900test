import { ISomaticSnv } from '../../types/SNV.types';
import { getProteinChangeFromHgvs } from '../../utils/functions/getProteinChangeFromHgvs';
import { getVariantFromHgvs } from '../../utils/functions/getVariantFromHgvs';
import { toFixed } from '../../utils/math/toFixed';

type ComparisonStatus = 'Shared' | 'Unique' | 'Changed';

export interface IComparisonSnvDifference {
  label: string;
  primary: string;
  comparison: string;
}

interface IComparisonSnvCell {
  present: boolean;
  dnaVaf: string;
  rnaVaf: string;
  zygosity: string;
  loh: string;
  pathclass: string;
}

export interface IComparisonSnvRow {
  id: string;
  gene: string;
  variant: string;
  protein: string;
  status: ComparisonStatus;
  differences: IComparisonSnvDifference[];
  uniqueTo: 'primary' | 'comparison' | null;
  primary: IComparisonSnvCell | null;
  comparison: IComparisonSnvCell | null;
}

export interface IComparisonSnvCounts {
  shared: number;
  unique: number;
  changed: number;
}

const defaultCounts: IComparisonSnvCounts = {
  shared: 0,
  unique: 0,
  changed: 0,
};

function getDnaVaf(snv: ISomaticSnv): string {
  if (
    snv.altad === undefined
    || snv.altad === null
    || snv.depth === undefined
    || snv.depth === null
    || snv.depth === 0
  ) {
    return '-';
  }

  return `${toFixed((snv.altad / snv.depth) * 100, 2)}%`;
}

function getRnaVaf(snv: ISomaticSnv): string {
  if (snv.rnaVafNo === undefined || snv.rnaVafNo === null) return '-';
  return `${toFixed(snv.rnaVafNo * 100, 2)}%`;
}

function getLohValue(snv: ISomaticSnv): string {
  if (!snv.loh || snv.loh.toLowerCase() === 'no') return '-';
  return snv.loh.replaceAll('(WT-LOST)', '').trim();
}

function getPathclassValue(snv: ISomaticSnv): string {
  return snv.pathclass?.split(':')[1]?.trim() || snv.pathclass || '-';
}

function getComparisonCell(snv: ISomaticSnv): IComparisonSnvCell {
  return {
    present: true,
    dnaVaf: getDnaVaf(snv),
    rnaVaf: getRnaVaf(snv),
    zygosity: snv.zygosity || '-',
    loh: getLohValue(snv),
    pathclass: getPathclassValue(snv),
  };
}

function buildSnvKey(snv: ISomaticSnv): string {
  if (snv.chr && snv.pos && snv.snvRef && snv.alt) {
    return [
      snv.chr.toLowerCase(),
      snv.pos,
      snv.snvRef.toUpperCase(),
      snv.alt.toUpperCase(),
    ].join(':');
  }

  const hgvsKey = snv.hgvs?.trim().toLowerCase();
  if (hgvsKey) return hgvsKey;

  if (snv.variantId) return snv.variantId;

  return `${snv.gene}::${snv.internalId}`;
}

function getDifferences(
  primary: IComparisonSnvCell,
  comparison: IComparisonSnvCell,
): IComparisonSnvDifference[] {
  const fields: Array<[string, string, string]> = [
    ['DNA VAF', primary.dnaVaf, comparison.dnaVaf],
    ['RNA VAF', primary.rnaVaf, comparison.rnaVaf],
    ['Zygosity', primary.zygosity, comparison.zygosity],
    ['LOH', primary.loh, comparison.loh],
    ['Pathclass', primary.pathclass, comparison.pathclass],
  ];

  return fields
    .filter(([, left, right]) => left !== right)
    .map(([label, left, right]) => ({
      label,
      primary: left,
      comparison: right,
    }));
}

export function buildSnvComparisonRows(
  primarySnvs: ISomaticSnv[],
  comparisonSnvs: ISomaticSnv[],
): IComparisonSnvRow[] {
  const primaryMap = new Map(primarySnvs.map((snv) => [buildSnvKey(snv), snv]));
  const comparisonMap = new Map(comparisonSnvs.map((snv) => [buildSnvKey(snv), snv]));
  const keys = Array.from(new Set([
    ...primaryMap.keys(),
    ...comparisonMap.keys(),
  ]));

  const rows = keys.map((key) => {
    const primarySnv = primaryMap.get(key);
    const comparisonSnv = comparisonMap.get(key);

    const primaryCell = primarySnv ? getComparisonCell(primarySnv) : null;
    const comparisonCell = comparisonSnv ? getComparisonCell(comparisonSnv) : null;

    const differences = primaryCell && comparisonCell
      ? getDifferences(primaryCell, comparisonCell)
      : [];

    let status: ComparisonStatus = 'Shared';
    if (!primaryCell || !comparisonCell) {
      status = 'Unique';
    } else if (differences.length) {
      status = 'Changed';
    }

    const sourceSnv = primarySnv || comparisonSnv;
    let uniqueTo: 'primary' | 'comparison' | null = null;
    if (primaryCell && !comparisonCell) uniqueTo = 'primary';
    if (!primaryCell && comparisonCell) uniqueTo = 'comparison';

    return {
      id: key,
      gene: sourceSnv?.gene || '-',
      variant: getVariantFromHgvs(sourceSnv?.hgvs),
      protein: getProteinChangeFromHgvs(sourceSnv?.hgvs),
      status,
      differences,
      uniqueTo,
      primary: primaryCell,
      comparison: comparisonCell,
    };
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
    return left.gene.localeCompare(right.gene);
  });
}

export function getSnvComparisonCounts(rows: IComparisonSnvRow[]): IComparisonSnvCounts {
  return rows.reduce((acc, row) => {
    if (row.status === 'Shared') acc.shared += 1;
    if (row.status === 'Unique') acc.unique += 1;
    if (row.status === 'Changed') acc.changed += 1;
    return acc;
  }, { ...defaultCounts });
}
