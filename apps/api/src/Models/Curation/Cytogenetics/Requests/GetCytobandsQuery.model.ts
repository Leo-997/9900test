import {
  IsIn, IsOptional, IsString,
} from 'class-validator';
import { GetReportableVariantDTO, IGetReportableVariant } from 'Models/Common/Requests/GetReportableVariant.model';
import { Chromosome } from 'Models/Curation/Misc.model';
import { IsChromosome } from 'Utilities/validators/IsChromosome.util';

export interface IGetCytobandsQuery extends IGetReportableVariant {
  chr?: Chromosome;
  arm?: 'p' | 'q';
  cnType?: string;
}

export class GetCytobandsQueryDTO
  extends GetReportableVariantDTO
  implements IGetCytobandsQuery {
  @IsOptional()
  @IsChromosome()
    chr?: Chromosome;

  @IsOptional()
  @IsString()
  @IsIn(['p', 'q'])
    arm?: 'p' | 'q';

  @IsOptional()
  @IsString()
    cnType?: string;
}
