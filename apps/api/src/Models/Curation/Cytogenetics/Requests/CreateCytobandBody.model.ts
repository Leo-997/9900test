import { IReportableVariant } from 'Models/Common/Common.model';
import {
  IsIn, IsOptional, IsString, Min,
} from 'class-validator';
import { UpdateReportableVariantDTO } from 'Models/Common/Requests/UpdateReportableVariant.model';
import { Chromosome } from 'Models/Curation/Misc.model';
import { Arm } from '../Cytogenetics.model';

export interface ICreateCytobandBody extends Partial<IReportableVariant> {
  cytoband: string;
  chr: Chromosome;
  arm: Arm;
  customCn: number;
  cnType?: string;
}

export class CreateCytobandBodyDTO
  extends UpdateReportableVariantDTO
  implements ICreateCytobandBody {
  @IsString()
  cytoband: string;

  @IsString()
  chr: Chromosome;

  @IsIn(['p', 'q'])
  arm: Arm;

  @Min(0)
  customCn: number;

  @IsOptional()
  @IsString()
  cnType?: string;
}
