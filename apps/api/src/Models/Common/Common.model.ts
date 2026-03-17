import { Pathclass, Classification, ClassifierClassification } from 'Models/Curation/Misc.model';
import { IsNumber, IsString } from 'class-validator';

export type ResponseBody = {
  error: boolean;
  msg: string;
}

export interface IReportableVariant<
  C extends Classification | ClassifierClassification = Classification
> {
  classification: C;
  targetable: boolean | null;
  reportable: boolean | null;
}

export interface ICounts {
  reportedCount: number;
  targetableCount: number;
}

export interface IReportablePathclass extends IReportableVariant {
  pathclass: Pathclass;
}

export interface IUpdateOrder {
  id: string;
  order: number;
}

export class UpdateOrderDTO {
  @IsString()
    id: string;

  @IsNumber()
    order: number;
}
