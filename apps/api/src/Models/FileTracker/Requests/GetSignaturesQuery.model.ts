import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';

export interface IGetSignaturesQuery {
  fileId?: string;
  userIds?: string[];
  includeURL?: boolean;
}

export class GetSignaturesQueryDTO implements IGetSignaturesQuery {
  @IsOptional()
  @IsString()
  fileId?: string;

  @IsOptional()
  @IsString({ each: true })
  userIds?: string[];

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  includeURL?: boolean;
}
