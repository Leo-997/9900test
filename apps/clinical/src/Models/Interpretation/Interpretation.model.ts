import { Type } from 'class-transformer';
import {
    IsIn,
    IsNumber, IsOptional, IsString, ValidateIf, ValidateNested,
} from 'class-validator';
import { reportTypes } from 'Constants/Reports/Reports.constant';
import { IComment } from '../Comment/Comment.model';
import { UpdateOrderDTO } from '../Common/Order.model';
import { IMolecularAlterationDetail } from '../MolecularAlterations/MolecularAlteration.model';
import { ReportType } from '../Reports/Reports.model';

export interface IInterpretation {
  id: string;
  title: string;
  clinicalVersionId: string;
  molAlterationGroupId: string | null;
  order: number | null;
  reportType: ReportType;
  comments?: IComment[];
  targets?: IMolecularAlterationDetail[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface IInterpretationQuery {
  molAlterationGroupId?: string;
  reportType?: ReportType;
}

export class InterpretationQueryDTO implements IInterpretationQuery {
  @IsOptional()
  @IsString()
    molAlterationGroupId?: string;

  @IsOptional()
  @IsString()
  @IsIn(reportTypes, { each: true })
    reportType?: ReportType;
}

export interface ICreateInterpretationBody {
  title: string;
  molAlterationGroupId: string;
  order?: number;
  reportType: ReportType;
}

export class CreateInterpretationBodyDTO implements ICreateInterpretationBody {
  @IsString()
    title: string;

  @IsString()
  @ValidateIf((o, v) => v !== null)
    molAlterationGroupId: string | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
    order?: number;

  @IsString()
  @IsIn(reportTypes, { each: true })
    reportType: ReportType;
}

export interface IUpdateInterpretationBody {
  title?: string;
  molAlterationGroupId?: string;
}

export class UpdateInterpretationBodyDTO implements IUpdateInterpretationBody {
  @IsOptional()
  @IsString()
    title?: string;

  @IsOptional()
  @IsString()
    molAlterationGroupId?: string;
}
export class UpdateInterpretationOrderDTO {
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderDTO)
    order: UpdateOrderDTO[];
}
