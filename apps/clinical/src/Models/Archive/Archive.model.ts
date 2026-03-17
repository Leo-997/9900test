import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { IPagination, PaginationDTO } from '../Common/Pagination.model';
import { IMolecularAlterationDetail } from '../MolecularAlterations/MolecularAlteration.model';

export interface IArchiveSamplesQuery extends IPagination {
  search?: string;
  geneIds?: number[];
  geneMutations?: string[];
  classifiers?: string[];
  cohort?: string[];
  zero2Category?: string[];
  zero2Subcat1?: string[];
  zero2Subcat2?: string[];
  zero2FinalDiagnosis?: string[];
  sortColumns?: string[];
  sortDirections?: string[];
}

export class GetArchiveSamplesDTO extends PaginationDTO implements IArchiveSamplesQuery {
  @IsOptional()
  @IsString()
    search?: string;

  @IsOptional()
  @IsString({ each: true })
    cohort?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2Category?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2Subcat1?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2Subcat2?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2FinalDiagnosis?: string[];

  @IsOptional()
  @IsString({ each: true })
    geneMutations?: string[];

  @IsOptional()
  @IsString({ each: true })
    classifiers?: string[];

  @IsOptional()
  @IsString({ each: true })
    sortColumns?: string[];

  @IsOptional()
  @IsString({ each: true })
    sortDirections?: string[];

  @IsOptional()
  @IsNumber(undefined, { each: true })
  @Type(() => Number)
    geneIds?: number[];
}

export interface IArchiveSample {
  clinicalVersionId: string;
  analysisSetId: string;
  patientId: string;
  cohort: string;
  zero2Category: string;
  zero2Subcat1: string;
  zero2Subcat2: string;
  zero2FinalDiagnosis: string;
  mtbDate?: string | null;
  relevantMolAlterations?: IMolecularAlterationDetail[];
}
