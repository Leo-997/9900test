import { Zygosity } from 'Models/Curation/Misc.model';
import {
  ArrayNotEmpty, IsArray, IsOptional, IsString,
} from 'class-validator';

export interface IGetVariantZygosityQuery {
  biosampleId?: string;
  variantIds: string[]
}

export class GetVariantZygosityQuery
implements IGetVariantZygosityQuery {
  @IsString()
  @IsOptional()
  biosampleId?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  variantIds: string[];
}

export interface IGetVariantZygosityResp {
  variantId: string;
  zygosity: Zygosity | null;
  somaticSnvZygosity: string | null;
}
