import {
  IsBoolean,
  IsOptional, IsString,
} from 'class-validator';
import { Pathclass } from 'Models/Curation/Misc.model';
import { PartialPick } from 'Models/Misc/PartialPick.model';
import { IsPathclass } from 'Utilities/validators/IsPathclass.util';
import { IReportableVariant } from 'Models/Common/Common.model';
import { UpdateReportableVariantDTO } from 'Models/Common/Requests/UpdateReportableVariant.model';
import { ISomaticCnv } from '../CuratedSampleSomaticCnv.model';

export interface IUpdateSampleSomaticCnv extends PartialPick<
  ISomaticCnv,
  'cnType' | 'pathclass' | 'researchCandidate'
>, Partial<IReportableVariant> {}

export class UpdateSampleSomaticCnvBodyDTO
  extends UpdateReportableVariantDTO
  implements IUpdateSampleSomaticCnv {
  @IsOptional()
  @IsPathclass()
    pathclass: Pathclass;

  @IsOptional()
  @IsString()
    cnType: string;

  @IsOptional()
  @IsBoolean()
    researchCandidate?: boolean | null;
}
