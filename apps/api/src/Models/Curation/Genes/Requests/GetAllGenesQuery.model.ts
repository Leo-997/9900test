import {
  IsBoolean,
  IsInt,
  IsOptional, IsString,
} from 'class-validator';
import {
  PaginationRequestDTO,
} from 'Models/Misc/Requests/PaginationDto.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';

export interface IGetAllGenesQuery {
  gene?: string;
  geneId?: number;
}

export interface IGetAllGeneListsQuery {
  listName?: string;
  listId?: number;
  namesOnly?: boolean;
}

export interface IGetFilteredGenesQuery {
  genes: string[];
}

export interface IGetGenesByIdsQuery {
  geneIds: number[];
}

export class GetAllGenesQueryDTO
  extends PaginationRequestDTO
  implements IGetAllGenesQuery {
  @IsOptional()
  @IsString()
  public gene?: string;

  @IsOptional()
  @IsInt()
  public geneId?: number;
}

export class GetAllGeneListsQueryDTO
  extends PaginationRequestDTO
  implements IGetAllGeneListsQuery {
  @IsOptional()
  @IsString()
  public listName?: string;

  @IsOptional()
  @IsInt()
  public listId?: number;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  public namesOnly?: boolean;
}

export class GetFilteredGenesQueryDTO
  extends PaginationRequestDTO
  implements IGetFilteredGenesQuery {
  @IsString({ each: true })
  public genes: string[];
}

export class GetGenesByIdsQueryDTO
  extends PaginationRequestDTO
  implements IGetGenesByIdsQuery {
  @IsInt({ each: true })
  public geneIds: number[];
}
