import {
  IsBoolean,
  IsOptional, IsString,
} from 'class-validator';
import { Pathclass } from 'Models/Curation/Misc.model';
import { PartialPick } from 'Models/Misc/PartialPick.model';
import { IsPathclass } from 'Utilities/validators/IsPathclass.util';
import { IReportableVariant } from 'Models/Common/Common.model';
import { UpdateReportableVariantDTO } from 'Models/Common/Requests/UpdateReportableVariant.model';
import { IGermlineCnv } from '../CuratedSampleGermlineCnv.model';

export interface IUpdateSampleGermlineCnv extends PartialPick<
  IGermlineCnv,
  'cnType' | 'pathclass' | 'researchCandidate'
>, Partial<IReportableVariant> {}

export class UpdateSampleGermlineCnvBodyDTO
  extends UpdateReportableVariantDTO
  implements IUpdateSampleGermlineCnv {
  @IsOptional()
  @IsString()
    cnType: string;

  @IsOptional()
  @IsPathclass()
    pathclass: Pathclass;

  @IsOptional()
  @IsBoolean()
    researchCandidate: boolean | null;
}
