import { IsString } from 'class-validator';

export class DeleteDataFilesDTO {
  @IsString({ each: true })
  fileIds: string[];
}

export type DeleteDataFilesResponse = {
  filesDeleted: string[];
  filesRejected: {
    fileId: string;
    reason: string;
  }[];
}
