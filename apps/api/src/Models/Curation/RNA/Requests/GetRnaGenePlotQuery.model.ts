import { IsNumber, IsString } from 'class-validator';

export interface IGetRnaGenePlotQuery {
  rnaseqId: string;
  geneId: number;
}

export class GetRnaGenePlotQueryDTO implements IGetRnaGenePlotQuery {
  @IsNumber()
  public geneId: number;

  @IsString()
  public rnaseqId: string;
}
