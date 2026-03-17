import { ISomaticRna } from '@/types/RNAseq.types';
import { toFixed } from '@/utils/math/toFixed';

type ComparisonStatus = 'Shared' | 'Unique' | 'Changed';

interface IComparisonRnaCell {
  present: boolean;
  foldChange: string;
  zScore: string;
  tpm: string;
  fpkm: string;
  expressionCall: string;
}

export interface IComparisonRnaDifference {
  label: string;
  primary: string;
  comparison: string;
}

export interface IComparisonRnaRow {
  id: string;
  gene: string;
  status: ComparisonStatus;
  differences: IComparisonRnaDifference[];
  uniqueTo: 'primary' | 'comparison' | null;
  primary: IComparisonRnaCell | null;
  comparison: IComparisonRnaCell | null;
}

export interface IComparisonRnaCounts {
  shared: number;
  unique: number;
  changed: number;
}

const defaultCounts: IComparisonRnaCounts = {
  shared: 0,
  unique: 0,
  changed: 0,
};

function getNormalizedValue(value?: string | number | null): string {
  if (value === undefined || value === null || value === '') return '';
  return String(value).trim().toLowerCase();
}

function getNumericValue(value?: string | null): string {
  if (!value) return '-';

  const parsed = parseFloat(value);
  if (Number.isNaN(parsed)) return '-';

  return toFixed(parsed, 2);
}

function getExpressionCallValue(rna: ISomaticRna): string {
  return rna.geneExpression || '-';
}

function getComparisonCell(rna: ISomaticRna): IComparisonRnaCell {
  return {
    present: true,
    foldChange: getNumericValue(rna.foldChange),
    zScore: getNumericValue(rna.meanZScore),
    tpm: getNumericValue(rna.patientTPM),
    fpkm: getNumericValue(rna.patientFPKM),
    expressionCall: getExpressionCallValue(rna),
  };
}

function buildRnaKey(rna: ISomaticRna): string {
  if (rna.geneId !== undefined && rna.geneId !== null) {
    return `gene-id::${rna.geneId}`;
  }

  const gene = getNormalizedValue(rna.gene);
  if (gene) return `gene::${gene}`;

  return `${getNormalizedValue(rna.chromosome)}::${getNormalizedValue(rna.cytoband)}`;
}

function getDifferences(
  primary: IComparisonRnaCell,
  comparison: IComparisonRnaCell,
): IComparisonRnaDifference[] {
  const fields: Array<[string, string, string]> = [
    ['Fold change', primary.foldChange, comparison.foldChange],
    ['Z-score', primary.zScore, comparison.zScore],
    ['TPM', primary.tpm, comparison.tpm],
    ['FPKM', primary.fpkm, comparison.fpkm],
    ['Expression call', primary.expressionCall, comparison.expressionCall],
  ];

  return fields
    .filter(([, left, right]) => left !== right)
    .map(([label, left, right]) => ({
      label,
      primary: left,
      comparison: right,
    }));
}

function sortBucket(rows: ISomaticRna[]): ISomaticRna[] {
  return [...rows].sort((left, right) => {
    const geneDiff = (left.gene || '').localeCompare(right.gene || '');
    if (geneDiff !== 0) return geneDiff;

    const chromosomeDiff = (left.chromosome || '').localeCompare(right.chromosome || '');
    if (chromosomeDiff !== 0) return chromosomeDiff;

    const cytobandDiff = (left.cytoband || '').localeCompare(right.cytoband || '');
    if (cytobandDiff !== 0) return cytobandDiff;

    return (left.geneId || 0) - (right.geneId || 0);
  });
}

function getGroupedRna(rows: ISomaticRna[]): Map<string, ISomaticRna[]> {
  return rows.reduce((acc, row) => {
    const key = buildRnaKey(row);
    const bucket = acc.get(key) || [];
    bucket.push(row);
    acc.set(key, bucket);
    return acc;
  }, new Map<string, ISomaticRna[]>());
}

export function buildRnaComparisonRows(
  primaryRows: ISomaticRna[],
  comparisonRows: ISomaticRna[],
): IComparisonRnaRow[] {
  const primaryMap = getGroupedRna(primaryRows);
  const comparisonMap = getGroupedRna(comparisonRows);
  const keys = Array.from(new Set([
    ...primaryMap.keys(),
    ...comparisonMap.keys(),
  ]));

  const rows = keys.flatMap((key) => {
    const primaryBucket = sortBucket(primaryMap.get(key) || []);
    const comparisonBucket = sortBucket(comparisonMap.get(key) || []);
    const bucketSize = Math.max(primaryBucket.length, comparisonBucket.length);
    const bucketRows: IComparisonRnaRow[] = [];

    for (let index = 0; index < bucketSize; index += 1) {
      const primaryRna = primaryBucket[index];
      const comparisonRna = comparisonBucket[index];
      const primaryCell = primaryRna ? getComparisonCell(primaryRna) : null;
      const comparisonCell = comparisonRna ? getComparisonCell(comparisonRna) : null;
      const sourceRna = primaryRna || comparisonRna;
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
        gene: sourceRna?.gene || '-',
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

    return left.gene.localeCompare(right.gene);
  });
}

export function getRnaComparisonCounts(rows: IComparisonRnaRow[]): IComparisonRnaCounts {
  return rows.reduce((acc, row) => {
    if (row.status === 'Shared') acc.shared += 1;
    if (row.status === 'Unique') acc.unique += 1;
    if (row.status === 'Changed') acc.changed += 1;
    return acc;
  }, { ...defaultCounts });
}
