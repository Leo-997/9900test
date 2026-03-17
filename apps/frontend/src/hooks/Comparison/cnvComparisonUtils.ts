import { cnvCNTypeOptions } from '@/constants/options';
import { ISomaticCNV } from '@/types/CNV.types';
import getCNVCopyNumber from '@/utils/functions/getCNVCopyNumber';
import { toFixed } from '@/utils/math/toFixed';

type ComparisonStatus = 'Shared' | 'Unique' | 'Changed';

export interface IComparisonCnvDifference {
  label: string;
  primary: string;
  comparison: string;
}

interface IComparisonCnvCell {
  present: boolean;
  copyNumber: string;
  cnType: string;
  pathclass: string;
}

export interface IComparisonCnvRow {
  id: string;
  gene: string;
  region: string;
  status: ComparisonStatus;
  differences: IComparisonCnvDifference[];
  uniqueTo: 'primary' | 'comparison' | null;
  primary: IComparisonCnvCell | null;
  comparison: IComparisonCnvCell | null;
}

export interface IComparisonCnvCounts {
  shared: number;
  unique: number;
  changed: number;
}

const defaultCounts: IComparisonCnvCounts = {
  shared: 0,
  unique: 0,
  changed: 0,
};

function getNormalizedValue(value?: string | number | null): string {
  if (value === undefined || value === null || value === '') return '';
  return String(value).trim().toLowerCase();
}

function getRegionValue(cnv: ISomaticCNV): string {
  const chromosome = cnv.chromosome?.replace(/^chr/i, '') || '-';
  const cytoband = cnv.cytoband || '';
  return `${chromosome}${cytoband}`.trim() || '-';
}

function getCnvTypeValue(cnv: ISomaticCNV): string {
  return cnvCNTypeOptions.find((option) => option.value === cnv.cnType)?.name || '-';
}

function getPathclassValue(cnv: ISomaticCNV): string {
  if (!cnv.pathclass) return '-';
  return cnv.pathclass.split(':')[1]?.trim() || cnv.pathclass;
}

function getCopyNumberValue(cnv: ISomaticCNV): string {
  return toFixed(getCNVCopyNumber(cnv), 2);
}

function getComparisonCell(cnv: ISomaticCNV): IComparisonCnvCell {
  return {
    present: true,
    copyNumber: getCopyNumberValue(cnv),
    cnType: getCnvTypeValue(cnv),
    pathclass: getPathclassValue(cnv),
  };
}

function buildCnvKey(cnv: ISomaticCNV): string {
  const gene = getNormalizedValue(cnv.gene) || getNormalizedValue(cnv.geneId);
  const chromosome = getNormalizedValue(cnv.chromosome).replace(/^chr/, '');
  const cytoband = getNormalizedValue(cnv.cytoband);

  if (gene && chromosome && cytoband) {
    return `${gene}::${chromosome}::${cytoband}`;
  }

  if (gene && chromosome) {
    return `${gene}::${chromosome}`;
  }

  if (chromosome && cytoband) {
    return `${chromosome}::${cytoband}`;
  }

  if (gene) return gene;
  if (cnv.variantId !== undefined && cnv.variantId !== null) return `variant::${cnv.variantId}`;

  return `${getNormalizedValue(cnv.chromosome)}::${getNormalizedValue(cnv.cytoband)}::${getNormalizedValue(cnv.variantId)}`;
}

function getDifferences(
  primary: IComparisonCnvCell,
  comparison: IComparisonCnvCell,
): IComparisonCnvDifference[] {
  const fields: Array<[string, string, string]> = [
    ['Copy number', primary.copyNumber, comparison.copyNumber],
    ['CN type', primary.cnType, comparison.cnType],
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

function sortBucket(rows: ISomaticCNV[]): ISomaticCNV[] {
  return [...rows].sort((left, right) => {
    const geneDiff = (left.gene || '').localeCompare(right.gene || '');
    if (geneDiff !== 0) return geneDiff;

    const regionDiff = getRegionValue(left).localeCompare(getRegionValue(right));
    if (regionDiff !== 0) return regionDiff;

    return left.variantId - right.variantId;
  });
}

function getGroupedCnvs(cnvs: ISomaticCNV[]): Map<string, ISomaticCNV[]> {
  return cnvs.reduce((acc, cnv) => {
    const key = buildCnvKey(cnv);
    const bucket = acc.get(key) || [];
    bucket.push(cnv);
    acc.set(key, bucket);
    return acc;
  }, new Map<string, ISomaticCNV[]>());
}

export function buildCnvComparisonRows(
  primaryCnvs: ISomaticCNV[],
  comparisonCnvs: ISomaticCNV[],
): IComparisonCnvRow[] {
  const primaryMap = getGroupedCnvs(primaryCnvs);
  const comparisonMap = getGroupedCnvs(comparisonCnvs);
  const keys = Array.from(new Set([
    ...primaryMap.keys(),
    ...comparisonMap.keys(),
  ]));

  const rows = keys.flatMap((key) => {
    const primaryBucket = sortBucket(primaryMap.get(key) || []);
    const comparisonBucket = sortBucket(comparisonMap.get(key) || []);
    const bucketSize = Math.max(primaryBucket.length, comparisonBucket.length);
    const bucketRows: IComparisonCnvRow[] = [];

    for (let index = 0; index < bucketSize; index += 1) {
      const primaryCnv = primaryBucket[index];
      const comparisonCnv = comparisonBucket[index];
      const primaryCell = primaryCnv ? getComparisonCell(primaryCnv) : null;
      const comparisonCell = comparisonCnv ? getComparisonCell(comparisonCnv) : null;
      const sourceCnv = primaryCnv || comparisonCnv;
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
        gene: sourceCnv?.gene || '-',
        region: sourceCnv ? getRegionValue(sourceCnv) : '-',
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

    const geneDiff = left.gene.localeCompare(right.gene);
    if (geneDiff !== 0) return geneDiff;

    return left.region.localeCompare(right.region);
  });
}

export function getCnvComparisonCounts(rows: IComparisonCnvRow[]): IComparisonCnvCounts {
  return rows.reduce((acc, row) => {
    if (row.status === 'Shared') acc.shared += 1;
    if (row.status === 'Unique') acc.unique += 1;
    if (row.status === 'Changed') acc.changed += 1;
    return acc;
  }, { ...defaultCounts });
}
