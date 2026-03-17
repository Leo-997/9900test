import { UpdateReportableVariantDTO } from 'Models/Common/Requests/UpdateReportableVariant.model';
import { IReportableVariant } from 'Models/Common/Common.model';
import {
  IsBoolean, IsIn, IsOptional, IsString,
} from 'class-validator';
import { IsPathclass } from 'Utilities/validators/IsPathclass.util';
import {
  Confidence, Inframe, Pathclass, Platform,
} from 'Models/Curation/Misc.model';
import { IsInframe } from 'Utilities/validators/IsInframe.util';
import { IsPlatform } from 'Utilities/validators/IsPlatform.util';
import { DisruptedTypes, disruptedTypes, IGermlineSV } from '../GermlineSvSample.model';

export interface IUpdateGermlineSVSample extends Partial<Pick<
  IGermlineSV,
  | 'pathclass'
  | 'inframe'
  | 'platforms'
  | 'rnaconf'
  | 'markDisrupted'
  | 'parentId'
  | 'researchCandidate'
>>, Partial<IReportableVariant> {}

export class UpdateGermlineSVSampleBodyDTO
  extends UpdateReportableVariantDTO
  implements IUpdateGermlineSVSample {
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
  @IsString()
    parentId?: string;

  @IsOptional()
  @IsBoolean()
    researchCandidate?: boolean | null;
}

export interface IPromoteGermlineSVResp {
  newParentVariantId: number;
  oldParentVariantId: number;
}
