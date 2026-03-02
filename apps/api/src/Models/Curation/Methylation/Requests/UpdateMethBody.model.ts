import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IReportableVariant } from 'Models/Common/Common.model';
import { UpdateReportableVariantDTO } from 'Models/Common/Requests/UpdateReportableVariant.model';
import { ClassifierClassification } from 'Models/Curation/Misc.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';

export const methStatuses = [
  'methylated',
  'unmethylated',
  'ambiguous',
  'unknown',
] as const;
export type MethylationStatus = typeof methStatuses[number];

export interface IMethPredBody extends Partial<IReportableVariant> {
  status?: MethylationStatus;
  estimated?: number;
  ciLower?: number;
  ciUpper?: number;
  cutoff?: number;
  researchCandidate?: boolean | null;
}

export interface IMethUpdateBody extends Partial<IReportableVariant<ClassifierClassification>> {
  score?: number;
  match?: boolean;
  interpretation?: string;
  researchCandidate?: boolean | null;
}

export interface IMethUpdateGeneBody extends Partial<IReportableVariant> {
  status?: MethylationStatus;
  researchCandidate?: boolean | null;
}

export class UpdateMethGeneBodyDTO
  extends UpdateReportableVariantDTO
  implements IMethUpdateGeneBody {
  @IsOptional()
  @IsIn(methStatuses)
    status?: MethylationStatus;

  @IsOptional()
  @IsBoolean()
    researchCandidate: boolean | null;
}

export class UpdateMethPredBodyDTO extends UpdateReportableVariantDTO implements IMethPredBody {
  @IsOptional()
  @IsIn(methStatuses)
    status?: MethylationStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
    estimated?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
    ciLower?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
    ciUpper?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
    cutoff?: number;

  @IsOptional()
  @IsBoolean()
    researchCandidate?: boolean | null;
}

export class UpdateMethDiagnosisBodyDTO
  extends UpdateReportableVariantDTO<ClassifierClassification>
  implements IMethUpdateBody {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
    score?: number;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    match?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['MATCH', 'NO MATCH'])
    interpretation?: string;

  @IsOptional()
  @IsBoolean()
    researchCandidate?: boolean | null;
}
