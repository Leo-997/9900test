import {
  IsBoolean, IsIn, IsOptional,
  IsString,
} from 'class-validator';
import { PartialPick } from 'Models/Misc/PartialPick.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { IReportableVariant } from 'Models/Common/Common.model';
import { UpdateReportableVariantDTO } from 'Models/Common/Requests/UpdateReportableVariant.model';
import { ISomaticRna } from '../RnaSample.model';

export interface IUpdateRnaSeqSample extends PartialPick<
  ISomaticRna,
  'outlier'
  | 'geneExpression'
  | 'researchCandidate'
>, Partial<IReportableVariant> {}

export class UpdateRnaSeqSampleBodyDTO
  extends UpdateReportableVariantDTO
  implements IUpdateRnaSeqSample {
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    outlier: boolean;

  @IsOptional()
  @IsIn(['Low', 'Medium', 'High', 'None', null])
    geneExpression: string | null;

  @IsOptional()
  @IsBoolean()
    researchCandidate?: boolean | null;
}

export interface IUpdatePlotsBody {
  subcat2: string;
}

export class UpdatePlotsBodyDTO implements IUpdatePlotsBody {
  @IsOptional()
  @IsString()
    subcat2: string;
}
