import { IReportablePathclass } from 'Models/Common/Common.model';

export default function getPathclassScore(variant: IReportablePathclass): number {
  if (variant.pathclass === 'C5: Pathogenic') return 9;
  if (variant.pathclass === 'C4: Likely pathogenic') return 8;
  if (variant.pathclass === 'C3.8: VOUS') return 7;
  if (variant.pathclass === 'C3: VOUS') return 6;
  if (variant.pathclass === 'GUS') return 5;
  if (variant.pathclass === 'C2: Likely Benign') return 3;
  if (variant.pathclass === 'C1: Benign') return 2;
  if (variant.pathclass === 'False Positive') return 1;
  if (variant.pathclass === 'Unclassified') return 1;
  return 4;
}
