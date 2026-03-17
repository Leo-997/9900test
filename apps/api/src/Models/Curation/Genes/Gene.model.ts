import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Chromosome } from 'Models/Curation/Misc.model';

export interface IGene {
  geneId: number;
  gene: string;
  chromosome?: Chromosome;
  geneStart?: number;
  geneEnd?: number;
  chromosomeBand?: string;
  prismclass?: string;
  geneListImportance?: number;
}

export interface IExtendedGene extends IGene {
  entrezUID?: number;
  fullname?: string;
  alias?: string;
  summary?: string;
  expression?: string;

  // HG 38 Data
  chromosomeHg38?: string;
  // From KnexJS: Note that bigint data is returned as a string in queries because
  // JavaScript may be unable to parse them without loss of precision.
  startHg38?: string;
  endHg38?: string;
  chromosomeBandHg38?: string;
  strandHg38?: string;
}

export interface IGeneListRaw {
  listId: number;
  listName: string;
  genes: string;
}

export interface IGeneList {
  listId: number;
  listName: string;
  genes?: IGene[];
}

export interface IInvalidGene {
  gene: string;
}

export interface IFilteredGenes {
  validGenes: IGene[];
  invalidGenes: IInvalidGene[];
}

export class GeneDTO implements IGene {
  @IsNumber()
  @Type(() => Number)
  geneId: number;

  @IsString()
  gene: string;

  @IsOptional()
  @IsString()
  chromosome?: Chromosome;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  geneStart?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  geneEnd?: number;

  @IsOptional()
  @IsString()
  chromosomeBand?: string;

  @IsOptional()
  @IsString()
  prismclass?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  geneListImportance?: number;
}
