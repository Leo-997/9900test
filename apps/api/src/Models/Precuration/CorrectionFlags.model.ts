import { correctionReasons } from 'Constants/CorrectionFlags/CorrectionFlags.constant';

export type CorrectionReason = keyof typeof correctionReasons;

export interface ICorrection {
  flagId: number;
  analysisSetId: string;
  reason: CorrectionReason;
  reasonNote?: string;
  flaggedById: string;
  flaggedAt: string;
  correctedById?: string;
  correctedAt?: string;
  correctionNote?: string;
  isCorrected: boolean;
  assignedResolverId: string;
}
