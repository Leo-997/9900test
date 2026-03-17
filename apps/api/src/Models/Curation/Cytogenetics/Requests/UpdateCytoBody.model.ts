import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PartialPick } from 'Models/Misc/PartialPick.model';
import { IReportableVariant } from 'Models/Common/Common.model';
import { UpdateReportableVariantDTO } from 'Models/Common/Requests/UpdateReportableVariant.model';
import { ICytogeneticsData } from '../Cytogenetics.model';

export interface IUpdateCytoBody extends PartialPick<
  ICytogeneticsData,
  'chr'
  | 'arm'
  | 'cnType'
  | 'researchCandidate'
>, Partial<IReportableVariant> {}

export class UpdateCytoBody extends UpdateReportableVariantDTO implements IUpdateCytoBody {
  @IsString()
    chr: string;

  @IsString()
    arm: string;

  @IsOptional()
  @IsString()
    cnType: string;

  @IsOptional()
  @IsBoolean()
    researchCandidate?: boolean | null;
}
