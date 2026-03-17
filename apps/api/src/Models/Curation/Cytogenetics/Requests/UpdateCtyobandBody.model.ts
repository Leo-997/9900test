import {
  IsOptional, IsString, Min, ValidateIf,
} from 'class-validator';
import { IReportableVariant } from 'Models/Common/Common.model';
import { UpdateReportableVariantDTO } from 'Models/Common/Requests/UpdateReportableVariant.model';

export interface IUpdateCytobandBody extends Partial<IReportableVariant> {
  cytoband?: string;
  customCn?: number | null;
  cnType?: string;
}

export class UpdateCytobandBodyDTO
  extends UpdateReportableVariantDTO
  implements IUpdateCytobandBody {
  @IsOptional()
  @IsString()
  cytoband?: string;

  @IsOptional()
  @Min(0)
  @ValidateIf((o, v) => v !== null)
  customCn?: number | null;

  @IsOptional()
  @IsString()
  cnType?: string;
}
