import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDTO } from '../Common/Pagination.model';

export const resourceTypes = [
  'PDF',
  'LINK',
  'IMG',
] as const;
export type ResourceType = typeof resourceTypes[number];

export interface IResourceBody {
  id: string;
  name: string;
  type: ResourceType;
  url?: string;
  fileId?: string;
}

export interface IUpdateResourceBody {
  name?: string;
}

export interface IResource extends IResourceBody {
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface IResourceQuery extends Partial<Omit<IResourceBody, 'id'>> {
  ids?: string[];
  searchQuery?: string;
}

export class QueryResourceDTO
  extends PaginationDTO
  implements IResourceQuery {
  @IsString({ each: true })
  @IsOptional()
    ids?: string[];

  @IsString()
  @IsOptional()
    name?: string;

  @IsOptional()
  @IsIn(resourceTypes)
    type?: ResourceType;

  @IsString()
  @IsOptional()
    url?: string;

  @IsString()
  @IsOptional()
    fileId?: string;

  @IsString()
  @IsOptional()
    searchQuery?: string;
}

export class CreateResourceDTO implements Partial<Omit<IResourceBody, 'id'>> {
  @IsString()
    name: string;

  @IsIn(resourceTypes)
    type: ResourceType;

  @IsString()
  @IsOptional()
    url?: string;

  @IsString()
  @IsOptional()
    fileId?: string;
}

export class UpdateResourceDTO implements IUpdateResourceBody {
  @IsString()
  @IsOptional()
    name: string;
}
