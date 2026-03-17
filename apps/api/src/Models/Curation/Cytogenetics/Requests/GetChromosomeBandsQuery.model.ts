import { Chromosome } from 'Models/Curation/Misc.model';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { IsChromosome } from 'Utilities/validators/IsChromosome.util';
import { Arm } from '../Cytogenetics.model';

export interface IGetChromosomeBandsQuery {
  chr?: Chromosome;
  arm?: Arm;
}

export class GetChromosomeBandsQueryDTO implements IGetChromosomeBandsQuery {
  @IsOptional()
  @IsChromosome()
  chr?: Chromosome;

  @IsOptional()
  @IsString()
  @IsIn(['p', 'q'])
  arm?: Arm;
}
