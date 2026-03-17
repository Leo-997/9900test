import {
  IsString, IsIn, IsOptional, IsBoolean, IsNumber,
} from 'class-validator';
import { Chromosome } from 'Models/Curation/Misc.model';
import { ReportType } from 'Models/Reports/Reports.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import {
  bamMethods, circosTypes, htsTypes, methylationTypes, mutsigTypes, qcTypes, tsvTypes,
} from 'Constants/FileTracker/types.constants';
import { VariantType, variantTypes } from 'Models/Misc/VariantType.model';
import { Type } from 'class-transformer';
import { reportTypes } from 'Constants/Reports/Reports.constants';
import {
  Categories, CircosTypes, MutsigTypes, QCTypes, MethylationTypes, HTSTypes, BAMMethods, TSVTypes,
} from '../FileTracker.model';

export class PostCircosFileMappingDTO {
  @IsString()
  fileId: string;

  @IsIn(['circos'])
  category: Categories;

  @IsIn(circosTypes)
  type: CircosTypes;
}

export class PostMutsigFileMappingDTO {
  @IsString()
  fileId: string;

  @IsIn(['mutsig'])
  category: Categories;

  @IsIn(mutsigTypes)
  type: MutsigTypes;
}

export class PostQCFileMappingDTO {
  @IsString()
  fileId: string;

  @IsIn(['qc'])
  category: Categories;

  @IsIn(qcTypes)
  type: QCTypes;
}

export class PostMethylationFileMappingDTO {
  @IsString()
  fileId: string;

  @IsIn(['methylation'])
  category: Categories;

  @IsIn(methylationTypes)
  type: MethylationTypes;
}

export class PostRNASeqFileMappingDTO {
  @IsString()
  fileId: string;

  @IsIn(['rnaseq'])
  category: Categories;

  @IsString()
  rnaSeqId: string;

  @IsString()
  gene: string;
}
export class PostRNASeqClassifierFileMappingDTO {
  @IsString()
  fileId: string;

  @IsIn(['rnaseq_classifier'])
  category: Categories;

  @IsString()
  rnaSeqId: string;

  @IsString()
  classifier: string;
}

export class PostMethGeneFileMappingDTO {
  @IsString()
  fileId: string;

  @IsIn(['meth_gene'])
  category: Categories;

  @IsString()
  methSampleId: string;

  @IsString()
  gene: string;
}

export class PostLinxFileMappingDTO {
  @IsString()
  fileId: string;

  @IsIn(['linx'])
  category: Categories;

  @IsOptional()
  @IsString()
  chr?: Chromosome;

  @IsOptional()
  @IsString()
  clusterId?: string;

  @IsOptional()
  @IsString()
  genes?: string;
}

export class PostHTSFileMappingDTO {
  @IsString()
  fileId: string;

  @IsIn(['hts'])
  category: Categories;

  @IsString()
  htsId: string;

  @IsString()
  @IsIn(htsTypes)
  type: HTSTypes;

  @IsString()
  @IsOptional()
  drugId: string;
}

export class PostBAMFileMappingDTO {
  @IsString()
  fileId: string;

  @IsIn(['bam'])
  category: Categories;

  @IsString()
  @IsIn(bamMethods)
  bamMethod: BAMMethods;

  @IsBoolean()
  @ToBoolean()
  assembly: boolean;
}

export class PostReportFileMappingDTO {
  @IsString()
  fileId: string;

  @IsIn(['report'])
  category: Categories;

  @IsIn(reportTypes)
  type: ReportType;

  @IsString()
  version: string;
}

export class PostTSVFileMappingDTO {
  @IsString()
  fileId: string;

  @IsIn(['tsv'])
  category: Categories;

  @IsIn(variantTypes)
  variantType: VariantType;

  @IsOptional()
  @IsIn(tsvTypes)
  type?: TSVTypes;
}

export class PostFusionFileMappingDTO {
  @IsString()
  public fileId: string;

  @IsIn(['fusion'])
  public category: Categories;

  @IsString()
  public rnaSeqId: string;

  @IsOptional()
  @IsString()
  public startGene?: string;

  @IsOptional()
  @IsString()
  public endGene?: string;

  @IsOptional()
  @IsString()
  public chrBkpt1?: Chromosome;

  @IsOptional()
  @IsString()
  public chrBkpt2?: Chromosome;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  public posBkpt1?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  public posBkpt2?: number;
}

export type PostDataFileMappingDTO =
  | PostCircosFileMappingDTO
  | PostMutsigFileMappingDTO
  | PostQCFileMappingDTO
  | PostMethylationFileMappingDTO
  | PostRNASeqFileMappingDTO
  | PostRNASeqClassifierFileMappingDTO
  | PostLinxFileMappingDTO
  | PostHTSFileMappingDTO
  | PostBAMFileMappingDTO
  | PostReportFileMappingDTO
  | PostFusionFileMappingDTO
  | PostMethGeneFileMappingDTO
  | PostTSVFileMappingDTO;

export type PostDataFilesMappingResponse = {
  filesInserted: string[];
  filesRejected: {
    file: any;
    reason: string;
  }[];
}
