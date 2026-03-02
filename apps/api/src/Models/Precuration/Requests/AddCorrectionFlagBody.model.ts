import {
  IsIn, IsString,
} from 'class-validator';
import { correctionReasons } from 'Constants/CorrectionFlags/CorrectionFlags.constant';
import { CorrectionReason } from '../CorrectionFlags.model';

export interface IAddCorrectionFlagBody {
  reason: CorrectionReason;
  reasonNote: string;
  analysisSetId: string;
  assignedResolverId: string;
}

export class AddCorrectionFlagBodyDTO
implements IAddCorrectionFlagBody {
  @IsString()
  @IsIn(Object.keys(correctionReasons))
  reason: CorrectionReason;

  @IsString()
  reasonNote: string;

  @IsString()
  assignedResolverId: string;

  @IsString()
  analysisSetId: string;
}
