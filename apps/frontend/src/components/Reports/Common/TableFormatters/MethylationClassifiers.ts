import { IMethylationData } from '../../../../types/Methylation.types';
import { IReportTableCell } from '../../../../types/Reports/Table.types';
import { isClassified } from '../../../../utils/functions/reportable/isClassified';
import { toFixedNoRounding } from '../../../../utils/math/toFixedNoRounding';

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
