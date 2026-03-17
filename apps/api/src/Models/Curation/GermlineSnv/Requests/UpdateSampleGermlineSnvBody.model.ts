import { Type } from 'class-transformer';
import {
  IsBoolean, IsIn, IsNumber, IsOptional, IsString, ValidateIf,
} from 'class-validator';
import { zygosity } from 'Constants/SNV/Common.constant';
import { IReportableVariant } from 'Models/Common/Common.model';
import { UpdateReportableVariantDTO } from 'Models/Common/Requests/UpdateReportableVariant.model';
import {
  Chromosome,
  Classification,
  Pathclass,
  PhenoType,
  Zygosity,
} from 'Models/Curation/Misc.model';
import { PartialPick } from 'Models/Misc/PartialPick.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { IsChromosome } from 'Utilities/validators/IsChromosome.util';
import { IsClassification } from 'Utilities/validators/IsClassification.util';
import { IsPathclass } from 'Utilities/validators/IsPathclass.util';
import { IGermlineSnv } from '../CuratedSampleGermlineSnv.model';
import { IChromPosRefAlt } from './ChromosomePosition.model';

export interface IUpdateSampleGermlineSnv extends PartialPick<
  IGermlineSnv,
  | 'pathclass'
  | 'zygosity'
  | 'phenotype'
  | 'pecan'
  | 'researchCandidate'
>, IChromPosRefAlt, Partial<IReportableVariant> {}

export class UpdateSampleGermlineSnvBodyDTO
  extends UpdateReportableVariantDTO
  implements IUpdateSampleGermlineSnv {
  @IsChromosome()
    chromosome: Chromosome;

  @IsNumber()
  @Type(() => Number)
    position: number;

  @IsString()
    ref: string;

  @IsString()
    alt: string;

  @IsOptional()
  @IsPathclass()
    pathclass: Pathclass;

  @IsOptional()
  @IsIn([...zygosity, null])
    zygosity?: Zygosity | null;

  @ValidateIf((obj, val) => val !== undefined)
  @IsClassification()
  declare classification: Classification;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  declare targetable: boolean | null;

  @IsOptional()
  @IsIn(['GUS', 'GUS 3.8', 'Confirmed', 'None'])
    phenotype: PhenoType;

  @IsOptional()
  @IsBoolean()
    pecan: boolean | null;

  @IsOptional()
  @IsBoolean()
    researchCandidate: boolean | null;
}
