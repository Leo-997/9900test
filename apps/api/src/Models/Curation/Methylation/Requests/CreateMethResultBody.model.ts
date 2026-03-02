import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";


export interface IMethResultBody {
  groupId: string;
  score: number;
  interpretation: string;
}


export class CreateMethResultBodyDTO implements IMethResultBody {
  
  @IsString()
  groupId: string;

  @IsNumber()
  @Type(() => Number)
  score: number;

  @IsString()
  interpretation: string;
}

export class UpdateMethResultBodyDTO implements IMethResultBody {
  
  @IsString()
  groupId: string;

  @IsNumber()
  @Type(() => Number)
  score: number;

  @IsString()
  interpretation: string;
}

