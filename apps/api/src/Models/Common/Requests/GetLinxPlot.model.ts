import { IsOptional, IsString } from 'class-validator';

interface GetLinxPlot {
  genes?: string[],
  chr?: string,
  clusterIds?: string[]
}

export class GetLinxPlotDTO 
  implements GetLinxPlot {
  @IsString({ each: true })
  @IsOptional()
  public genes?: string[];

  @IsOptional()
  @IsString()
  public chr?: string;

  @IsOptional()
  @IsString({ each: true })
  public clusterIds?: string[];
}