import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { zygosity } from 'Constants/SNV/Common.constant';
import { IReportableVariant } from 'Models/Common/Common.model';
import { UpdateReportableVariantDTO } from 'Models/Common/Requests/UpdateReportableVariant.model';
import { Pathclass, Platform, Zygosity } from 'Models/Curation/Misc.model';
import { IsPathclass } from 'Utilities/validators/IsPathclass.util';
import { IsPlatform } from 'Utilities/validators/IsPlatform.util';

export interface IUpdateCuratedSampleSomaticSNVsByIdBody extends Partial<IReportableVariant> {
  pathclass?: Pathclass;
  platform?: Platform | 'No';
  pecan?: boolean | null;
  zygosity?: Zygosity | null;
  researchCandidate?: boolean | null;
}

export class UpdateCuratedSampleSomaticSNVsByIdBodyDTO
  extends UpdateReportableVariantDTO
  implements IUpdateCuratedSampleSomaticSNVsByIdBody {
  @IsOptional()
  @IsPathclass()
    pathclass?: Pathclass;

  @IsOptional()
  @IsPlatform()
    platform?: Platform | 'No';

  @IsOptional()
  @IsBoolean()
    pecan?: boolean | null;

  @IsOptional()
  @IsIn([...zygosity, null])
    zygosity?: Zygosity | null;

  @IsOptional()
  @IsBoolean()
    researchCandidate?: boolean | null;
}
