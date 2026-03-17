import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional, IsString,
  ValidateNested,
} from 'class-validator';
import { GeneDTO } from 'Models/Curation/Genes/Gene.model';
import { ILinxPlot } from '../Plot.model';

export interface GenerateLinxPlotBody {
  chr?: string;
  clusterIds?: string[];
  genes?: GeneDTO[];
}

export class GenerateLinxPlotBodyDTO implements GenerateLinxPlotBody {
  @IsOptional()
  @IsString()
  public chr?: string;

  @IsOptional()
  @IsArray()
  public clusterIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeneDTO)
  public genes?: GeneDTO[];
}

export type NotifyUserLinxPlotDTO = Omit<ILinxPlot, 'created'> & {
  notifyUserId: string;
  description?: string;
}
