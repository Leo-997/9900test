import { IRNAClassifierTable } from '@/types/RNAseq.types';
import { IMethylationData, IMethylationGeneData } from '../../../../types/Methylation.types';
import { IReportTableCell } from '../../../../types/Reports/Table.types';
import { isClassified } from '../../../../utils/functions/reportable/isClassified';
import { toFixedNoRounding } from '../../../../utils/math/toFixedNoRounding';

// METHYLATION CLASSIFIERS
function getTumourSubtypeText(classifier: IMethylationData): string {
  if (classifier.classification === 'Not Reportable - Display') {
    return 'No classification match identified.';
  }

  if (
    classifier.interpretation === 'MATCH'
    || (isClassified(classifier))
  ) {
    return `${classifier.groupName.slice(0, 1).toUpperCase()}${classifier.groupName.slice(1)}`;
  }

  return '';
}

function getScore(classifier: IMethylationData): string {
  if (classifier.classification === 'Not Reportable - Display') {
    return '-';
  }

  if (classifier.interpretation === 'MATCH' || isClassified(classifier)) {
    return toFixedNoRounding(classifier.score, 2) || '-';
  }

  return '-';
}

export function formatClassifier(
  classifier: IMethylationData,
  widths: string[],
): IReportTableCell[] {
  return [
    {
      width: widths[0],
      content: 'DNA Methylation',
    },
    {
      width: widths[1],
      content: `${classifier.classifierName} version ${classifier.version}`,
    },
    {
      width: widths[2],
      content: getTumourSubtypeText(classifier),
    },
    {
      width: widths[3],
      content: getScore(classifier),
    },
  ];
}

// PROMOTER METHYLATION
export function formatPromoter(
  promoter: IMethylationGeneData,
  widths: string[],
): IReportTableCell[] {
  const { gene, status } = promoter;

  return [
    { width: widths[0], content: 'DNA Methylation' },
    { width: widths[1], content: `${gene} promoter status` },
    { width: widths[2], content: status ? `${status[0].toUpperCase()}${status.slice(1)}` : '-' },
    { width: widths[3], content: 'N/A' },
  ];
}

// RNA CLASSIFIERS
export function formatRnaClassifier(
  rnaClassifier: IRNAClassifierTable,
  widths: string[],
): IReportTableCell[] {
  const {
    classifier,
    prediction,
    predictionLabel: preferredPredLabel,
    score,
    classification,
  } = rnaClassifier;

  const isNotRepDisplay = classification === 'Not Reportable - Display';

  const predictionLabel = preferredPredLabel || prediction;

  return [
    { width: widths[0], content: 'Transcriptomics' },
    { width: widths[1], content: classifier },
    { width: widths[2], content: isNotRepDisplay ? 'No classification match identified.' : predictionLabel },
    { width: widths[3], content: isNotRepDisplay || !score ? '-' : score.toFixed(2) },
  ];
}
