import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationDTO } from '../Common/Pagination.model';

export const externalCitationSources = ['PUBMED', 'PMC'] as const;
export type ExternalCitationSource = typeof externalCitationSources[number];

export const citationSources = [
  'BOOK',
  'JOURNAL',
  'CONFERENCE',
  ...externalCitationSources,
] as const;
export type CitationSource = typeof citationSources[number];

export interface ICitationBody {
  id: string;
  title: string;
  authors?: string;
  publication?: string;
  year?: number;
  link?: string;
  source: CitationSource;
  externalId?: string;
}

export interface ICitation extends ICitationBody {
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface ICitationQuery extends Partial<Omit<ICitationBody, 'id'>> {
  ids?: string[];
  searchQuery?: string;
}

export interface IExternalCitation {
  externalId: number | string;
  url: string;
  title: string | null;
  publicationName: string | null;
  publicationYear: number | null;
  authors: string | null;
  source: ExternalCitationSource;
  duplicateId?: string;
}

interface IExternalCitationQuery {
  source: ExternalCitationSource;
  externalId: string;
}

export class GetExternalCitationDTO implements IExternalCitationQuery {
  @IsIn([...externalCitationSources])
    source: ExternalCitationSource;

  @IsString()
    externalId: string;
}

export class QueryCitationDTO
  extends PaginationDTO
  implements ICitationQuery {
  @IsString({ each: true })
  @IsOptional()
    ids?: string[];

  @IsString()
  @IsOptional()
    title?: string;

  @IsString()
  @IsOptional()
    authors?: string;

  @IsString()
  @IsOptional()
    publication?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
    year?: number;

  @IsString()
  @IsOptional()
    link?: string;

  @IsOptional()
  @IsIn(citationSources)
    source?: CitationSource;

  @IsString()
  @IsOptional()
    externalId?: string;

  @IsString()
  @IsOptional()
    searchQuery?: string;
}

export class UpdateCitationDTO implements Partial<Omit<ICitationBody, 'id'>> {
  @IsString()
    title: string;

  @IsString()
  @IsOptional()
    authors?: string;

  @IsString()
  @IsOptional()
    publication?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
    year?: number;

  @IsString()
  @IsOptional()
    link?: string;

  @IsIn(citationSources)
    source: CitationSource;

  @IsString()
  @IsOptional()
    externalId?: string;
}
