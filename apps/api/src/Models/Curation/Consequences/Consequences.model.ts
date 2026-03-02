import { IsIn, IsOptional } from "class-validator";

export interface IImpactGroups {
  high: string[];
  medium: string[];
  low: string[];
}

export interface IGetConsequencesQuery {
  impact?: "high" | "medium" | "low";
}

export class GetConsequencesQueryDTO implements IGetConsequencesQuery {
  @IsOptional()
  @IsIn([ "high", "medium", "low" ])
  impact?: "high" | "medium" | "low";
}