import { IsArray, IsString } from 'class-validator';

export class PostChildFilesDTO {
  @IsString()
    parentFileId: string;

  @IsArray()
  @IsString({ each: true })
    childFileIds: string[];
}

export type PostChildFilesResponse = {
  filesInserted: string[];
  filesRejected: {
    fileId: string;
    reason: string;
  }[];
};
