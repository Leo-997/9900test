import { correctionReasons } from '../constants/corrections';

export type CorrectionReason = typeof correctionReasons[number];

export type CorrectionInputErrors = {
  reason?: string;
  reasonNote?: string;
};

export type NewCorrectionFlagInput = {
  reason: CorrectionReason | undefined,
  reasonNote: string,
  assignedResolverId?: string,
}

export interface ISampleCorrectionFlag {
  flagId: number;
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

export interface ISampleUpdateCorrectionFlag {
  isCorrected: boolean;
  correctionNote: string;
  assignedResolver?: string;
}
