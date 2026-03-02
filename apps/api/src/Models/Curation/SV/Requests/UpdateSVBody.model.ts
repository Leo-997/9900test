import {
  IsBoolean,
  IsIn, IsInt, IsOptional,
} from 'class-validator';
import { IsPathclass } from 'Utilities/validators/IsPathclass.util';
import {
  Pathclass,
  Inframe,
  Platform,
  Confidence,
} from 'Models/Curation/Misc.model';
import { DisruptedTypes, disruptedTypes, ISomaticSV } from 'Models/Curation/SV/SVSample.model';
import { IsInframe } from 'Utilities/validators/IsInframe.util';
import { IsPlatform } from 'Utilities/validators/IsPlatform.util';
import { IReportableVariant } from 'Models/Common/Common.model';
import { UpdateReportableVariantDTO } from 'Models/Common/Requests/UpdateReportableVariant.model';

export interface IUpdateSVSample extends Partial<Pick<
  ISomaticSV,
  | 'pathclass'
  | 'inframe'
  | 'platforms'
  | 'rnaconf'
  | 'markDisrupted'
  | 'parentId'
  | 'researchCandidate'
>>, Partial<IReportableVariant> {}

export class UpdateSVSampleBodyDTO
  extends UpdateReportableVariantDTO
  implements IUpdateSVSample {
  @IsOptional()
  @IsPathclass()
    pathclass?: Pathclass;

  @IsOptional()
  @IsInframe()
    inframe?: Inframe;

  @IsOptional()
  @IsPlatform()
    platforms?: Platform;

  @IsOptional()
  @IsIn(['High', 'Med', 'Low', 'None'])
    rnaconf?: Confidence | 'None';

  @IsOptional()
  @IsIn(disruptedTypes)
    markDisrupted?: DisruptedTypes;

  @IsOptional()
  @IsInt()
    parentId?: number;

  @IsOptional()
  @IsBoolean()
    researchCandidate?: boolean | null;
}

export interface IPromoteSVResp {
  newParentVariantId: number;
  oldParentVariantId: number;
}
