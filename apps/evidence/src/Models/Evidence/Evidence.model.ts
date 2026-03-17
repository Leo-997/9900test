import { Type } from 'class-transformer';
import {
    IsIn, IsNumber, IsOptional, IsString, Min, ValidateIf,
} from 'class-validator';
import { evidenceSortOptions } from 'Constants/Evidence.contant';
import { CitationSource, UpdateCitationDTO, citationSources } from '../Citation/Citation.model';
import { PaginationDTO } from '../Common/Pagination.model';
import { CreateResourceDTO, ResourceType, resourceTypes } from '../Resource/Resource.model';

export type EvidenceSortOptions = typeof evidenceSortOptions[number];

export interface IEvidence {
  id: string;
  resourceId?: string;
  citationId?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface IEvidenceQuery {
  ids?: string[];
  excludeIds?: string[];
  type?: 'CITATION' | 'RESOURCE';
  citationType?: CitationSource[];
  resourceType?: ResourceType[];
  resourceId?: string;
  citationId?: string;
  title?: string[];
  author?: string[];
  year?: number | null;
  publication?: string[];
  sortColumns?: EvidenceSortOptions[];
  sortDirections?: ('asc' | 'desc')[]
}

export class QueryEvidenceDTO
  extends PaginationDTO
  implements IEvidenceQuery {
  @IsString({ each: true })
  @IsOptional()
    ids?: string[];

  @IsString({ each: true })
  @IsOptional()
    excludeIds?: string[];

  @IsIn(['CITATION', 'RESOURCE'])
  @IsOptional()
    type?: 'CITATION' | 'RESOURCE';

  @IsIn(citationSources, { each: true })
  @IsOptional()
    citationType?: CitationSource[];

  @IsIn(resourceTypes, { each: true })
  @IsOptional()
    resourceType?: ResourceType[];

  @IsString()
  @IsOptional()
    resourceId?: string;

  @IsString()
  @IsOptional()
    citationId?: string;

  @IsString({ each: true })
  @IsOptional()
    title?: string[];

  @IsString({ each: true })
  @IsOptional()
    author?: string[];

  @IsNumber()
  @Min(1900)
  @IsOptional()
    year?: number;

  @IsString({ each: true })
  @IsOptional()
    publication?: string[];

  @IsString()
  @IsOptional()
    searchQuery?: string;

  @IsIn(evidenceSortOptions, { each: true })
  @IsOptional()
    sortColumns?: EvidenceSortOptions[];

  @IsIn(['asc', 'desc'], { each: true })
  @IsOptional()
    sortDirections?: ('asc' | 'desc')[];
}

export class UpdateEvidenceDTO implements Partial<IEvidence> {
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.citationId || o.resourceId)
    resourceId?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.resourceId || o.citationId)
    citationId?: string;
}

export class CreateEvidenceDTO {
  @IsOptional()
  @Type(() => CreateResourceDTO)
  @ValidateIf((o) => !o.citationData || o.resourceData)
    resourceData?: CreateResourceDTO;

  @IsOptional()
  @Type(() => UpdateCitationDTO)
  @ValidateIf((o) => !o.resourceData || o.citationData)
    citationData?: UpdateCitationDTO;
}
