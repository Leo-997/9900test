import { Chromosome } from 'Models/Curation/Misc.model';
import { IsChromosome } from 'Utilities/validators/IsChromosome.util';
import { IsString, IsIn, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Arm } from '../Cytogenetics.model';

export interface IGetAverageCopyNumberQuery {
  chr: Chromosome;
  arm: Arm;
  start: number;
  end: number;
}

export class GetAverageCopyNumberQueryDTO implements IGetAverageCopyNumberQuery {
  @IsChromosome()
  chr: Chromosome;

  @IsString()
  @IsIn(['p', 'q'])
  arm: Arm;

  @IsNumber()
  @Type(() => Number)
  start: number;

  @IsNumber()
  @Type(() => Number)
  end: number;
}
