import { IMethylationData, IMethylationPredictionData } from '@/types/Methylation.types';
import { isClassified } from '@/utils/functions/reportable/isClassified';
import { toFixedNoRounding } from '@/utils/math/toFixedNoRounding';

type ComparisonStatus = 'Shared' | 'Unique' | 'Changed';
export type MethylationSubgroup = 'Classifier Results' | 'Prediction / Call';

interface IComparisonMethylationCell {
  present: boolean;
  lines: string[];
  diffFields: Array<{
    label: string;
    value: string;
  }>;
}

interface IComparableMethylationFinding {
  key: string;
  subgroup: MethylationSubgroup;
  finding: string;
  secondary: string;
  sortValue: string;
  cell: IComparisonMethylationCell;
}

export interface IComparisonMethylationDifference {
  label: string;
  primary: string;
  comparison: string;
}

export interface IComparisonMethylationRow {
  id: string;
  subgroup: MethylationSubgroup;
  finding: string;
  secondary: string;
  status: ComparisonStatus;
  differences: IComparisonMethylationDifference[];
  uniqueTo: 'primary' | 'comparison' | null;
  primary: IComparisonMethylationCell | null;
  comparison: IComparisonMethylationCell | null;
}

export interface IComparisonMethylationCounts {
  shared: number;
  unique: number;
  changed: number;
}

const defaultCounts: IComparisonMethylationCounts = {
  shared: 0,
  unique: 0,
  changed: 0,
};

const subgroupOrder: MethylationSubgroup[] = [
  'Classifier Results',
  'Prediction / Call',
];

function getScoreValue(score?: number | null): string {
  if (score === undefined || score === null || Number.isNaN(score)) return '-';
  return toFixedNoRounding(score, 2) || '-';
}

function getPredictedGroupValue(classifier: IMethylationData): string {
  if (classifier.classification === 'Not Reportable - Display') {
    return 'No classification match identified.';
  }

  if (classifier.groupName) {
    return classifier.groupName.replace(/([Mm]ethylation class )/, '').trim() || '-';
  }

  return '-';
}

function shouldIncludeClassifier(classifier: IMethylationData): boolean {
  return Boolean(
    classifier.reportable
    || classifier.classification === 'Not Reportable - Display'
    || classifier.interpretation === 'MATCH'
    || isClassified(classifier),
  );
}

function buildClassifierKey(classifier: IMethylationData): string {
  return `classifier::${classifier.classifierName.toLowerCase()}`;
}

function getClassifierFinding(classifier: IMethylationData): IComparableMethylationFinding {
  const predictedGroup = getPredictedGroupValue(classifier);

  return {
    key: buildClassifierKey(classifier),
    subgroup: 'Classifier Results',
    finding: classifier.classifierName || 'DNA Methylation',
    secondary: `Version ${classifier.version || '-'}`,
    sortValue: `${classifier.classifierName}::${classifier.version}`,
    cell: {
      present: true,
      lines: [
        `Group ${predictedGroup} | Score ${getScoreValue(classifier.score)}`,
        `Call ${classifier.interpretation || '-'} | Class ${classifier.classification || '-'}`,
      ],
      diffFields: [
        { label: 'Version', value: classifier.version || '-' },
        { label: 'Predicted group', value: predictedGroup },
        { label: 'Score', value: getScoreValue(classifier.score) },
        { label: 'Interpretation', value: classifier.interpretation || '-' },
        { label: 'Classification', value: classifier.classification || '-' },
      ],
    },
  };
}

function getPredictionFinding(
  prediction: IMethylationPredictionData,
): IComparableMethylationFinding {
  return {
    key: 'prediction::mgmt',
    subgroup: 'Prediction / Call',
    finding: 'Methylation prediction',
    secondary: 'Status / confidence',
    sortValue: 'prediction',
    cell: {
      present: true,
      lines: [
        `Call ${prediction.status || '-'} | Estimate ${getScoreValue(prediction.estimated)}`,
        `CI ${getScoreValue(prediction.ciLower)} - ${getScoreValue(prediction.ciUpper)} | Cutoff ${getScoreValue(prediction.cutoff)}`,
      ],
      diffFields: [
        { label: 'Call', value: prediction.status || '-' },
        { label: 'Estimate', value: getScoreValue(prediction.estimated) },
        { label: 'CI lower', value: getScoreValue(prediction.ciLower) },
        { label: 'CI upper', value: getScoreValue(prediction.ciUpper) },
        { label: 'Cutoff', value: getScoreValue(prediction.cutoff) },
      ],
    },
  };
}

function getComparableFindings(input: {
  classifiers: IMethylationData[];
  prediction: IMethylationPredictionData | null;
}): IComparableMethylationFinding[] {
  return [
    ...input.classifiers
      .filter(shouldIncludeClassifier)
      .map(getClassifierFinding),
    ...(input.prediction ? [getPredictionFinding(input.prediction)] : []),
  ];
}

function getDifferences(
  primary: IComparisonMethylationCell,
  comparison: IComparisonMethylationCell,
): IComparisonMethylationDifference[] {
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

function sortFindings(
  findings: IComparableMethylationFinding[],
): IComparableMethylationFinding[] {
  return [...findings].sort((left, right) => left.sortValue.localeCompare(right.sortValue));
}

function groupFindings(
  findings: IComparableMethylationFinding[],
): Map<string, IComparableMethylationFinding[]> {
  return findings.reduce((acc, finding) => {
    const bucket = acc.get(finding.key) || [];
    bucket.push(finding);
    acc.set(finding.key, bucket);
    return acc;
  }, new Map<string, IComparableMethylationFinding[]>());
}

export function buildMethylationComparisonRows(input: {
  primaryClassifiers: IMethylationData[];
  primaryPrediction: IMethylationPredictionData | null;
  comparisonClassifiers: IMethylationData[];
  comparisonPrediction: IMethylationPredictionData | null;
}): IComparisonMethylationRow[] {
  const primaryGroups = groupFindings(getComparableFindings({
    classifiers: input.primaryClassifiers,
    prediction: input.primaryPrediction,
  }));
  const comparisonGroups = groupFindings(getComparableFindings({
    classifiers: input.comparisonClassifiers,
    prediction: input.comparisonPrediction,
  }));

  const keys = Array.from(new Set([
    ...primaryGroups.keys(),
    ...comparisonGroups.keys(),
  ]));

  const rows = keys.flatMap((key) => {
    const primaryBucket = sortFindings(primaryGroups.get(key) || []);
    const comparisonBucket = sortFindings(comparisonGroups.get(key) || []);
    const bucketSize = Math.max(primaryBucket.length, comparisonBucket.length);
    const bucketRows: IComparisonMethylationRow[] = [];

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
        subgroup: sourceFinding?.subgroup || 'Classifier Results',
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

export function getMethylationComparisonCounts(
  rows: IComparisonMethylationRow[],
): IComparisonMethylationCounts {
  return rows.reduce((acc, row) => {
    if (row.status === 'Shared') acc.shared += 1;
    if (row.status === 'Unique') acc.unique += 1;
    if (row.status === 'Changed') acc.changed += 1;
    return acc;
  }, { ...defaultCounts });
}
