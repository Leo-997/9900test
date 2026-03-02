import { Chromosome } from 'Models/Curation/Misc.model';
import { IsChromosome } from 'Utilities/validators/IsChromosome.util';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export interface IChromPosRefAlt {
  chromosome: Chromosome;
  position: number;
  ref: string;
  alt: string;
}

export class ChromPosRefAltDTO implements IChromPosRefAlt {
  @IsChromosome()
  chromosome: Chromosome;

  @IsNumber()
  @Type(() => Number)
  position: number;

  @IsString()
  ref: string;

  @IsString()
  alt: string;
}
