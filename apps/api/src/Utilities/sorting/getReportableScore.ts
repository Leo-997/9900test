import { IReportablePathclass } from 'Models/Common/Common.model';

export default function getReportableScore(variant: IReportablePathclass): number {
  const pcLessThanC2 = [
    'C2: Likely Benign',
    'C1: Benign',
    'False Positive',
    'Unclassified',
  ].includes(variant.pathclass);
  if (variant.classification === 'Not Reportable' && pcLessThanC2) return 1;
  if (variant.classification === 'Not Reportable' && !variant.pathclass) return 2;
  if (variant.classification === 'Not Reportable' && variant.pathclass) return 3;
  if (!variant.classification) return 4;
  if (variant.reportable) return 6;
  return 5;
}
