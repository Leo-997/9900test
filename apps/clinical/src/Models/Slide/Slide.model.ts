import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested,
} from 'class-validator';
import { IMolecularAlterationDetail } from '../MolecularAlterations/MolecularAlteration.model';

export interface ISlideSettings {
  recColumns?: number;
  layout?: string;
  showDescription?: string;
  noteWidth?: number;
}

export interface ISlide {
  id: string;
  index: number;
  title: string;
  slideNote: string | null;
  reportNote: string | null;
  hidden: boolean;
  clinicalVersionId: string;
  molAlterationGroupId?: string;
  alterations?: Partial<IMolecularAlterationDetail>[];
  settings?: ISlideSettings;
}

export interface IFetchSlide extends Partial<ISlide> {
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface IUpdateMolAlterationGroup {
  add?: string[];
  remove?: string[];
}

export interface IUpdateSlideOrder {
  id: string;
  index: number;
}

export interface ICreateSlideResponse {
  id: string;
  index: number;
}

export interface ISlideSectionBase {
  id: string;
  order: number;
  type: string;
  slideId: string;
  name?: string;
  description?: string;
  width?: number;
}

export interface ISlideSection extends ISlideSectionBase {
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface IPostSlide {
  title?: string;
  slideNote?: string | null;
  alterations?: string[];
}

export class PostSlideDTO implements IPostSlide {
  @IsString()
  @IsOptional()
  @ValidateIf((o, v) => v !== null)
    title: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o, v) => v !== null)
    slideNote: string | null;

  @IsArray()
  @IsOptional()
    alterations?: string[];
}

export class UpdateSlideDTO
implements Partial<Pick<ISlide, 'title' | 'slideNote' | 'hidden'>> {
  @IsString()
  @IsOptional()
    title?: string;

  @IsString()
  @IsOptional()
    slideNote?: string;

  @IsBoolean()
  @IsOptional()
    hidden?: boolean;
}

export class UpdateSlideSettingDTO {
  @IsString()
    setting: string;

  @IsString()
    value: string;
}

export class FetchSlideDTO extends PostSlideDTO {
  @IsString()
    createdAt: string;

  @IsString()
  @IsOptional()
    createdBy?: string;

  @IsString()
    updatedAt: string;

  @IsString()
  @IsOptional()
    updatedBy?: string;

  @IsString()
    molAlterationGroupId: string;
}

export class UpdateMolAlterationGroupDTO implements IUpdateMolAlterationGroup {
  @IsOptional()
  @IsString({ each: true })
    add?: string[];

  @IsOptional()
  @IsString({ each: true })
    remove?: string[];
}

export class NewSlideOrderDTO implements IUpdateSlideOrder {
  @IsString()
    id: string;

  @IsInt()
    index: number;
}
export class UpdateSlideOrderDTO {
  @IsArray()
  @ValidateNested()
  @Type(() => NewSlideOrderDTO)
    data: NewSlideOrderDTO[];
}

export class PostSectionDTO implements Omit<ISlideSectionBase, 'id' | 'slideId' | 'width'> {
  @IsNumber()
  @IsOptional()
    order: number;

  @IsString()
    type: string;

  @IsString()
  @IsOptional()
    name?: string;

  @IsString()
  @IsOptional()
    description?: string;
}

export class UpdateSectionDTO implements Pick<ISlideSectionBase, 'description' | 'name' | 'width'> {
  @IsString()
  @IsOptional()
    name?: string;

  @IsString()
  @IsOptional()
    description?: string;

  @IsInt()
  @IsOptional()
    width?: number;
}
