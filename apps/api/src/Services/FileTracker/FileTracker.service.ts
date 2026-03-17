import {
  BadRequestException, Inject, Injectable, NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import imageSize from 'image-size';
import { Knex } from 'knex';
import md5 from 'md5';
import {
  DeleteDataFilesDTO,
  DeleteDataFilesResponse,
} from 'Models/FileTracker/Requests/FileTrackerDeleteFiles.model';
import {
  IFileTrackerFilter,
} from 'Models/FileTracker/Requests/FileTrackerFilter.model';
import {
  PostChildFilesDTO,
  PostChildFilesResponse,
} from 'Models/FileTracker/Requests/FileTrackerPostChildFiles.model';
import {
  PostDataFileDTO,
  PostDataFilesResponse,
  PostDNANexusFileDTO,
  PostNCIMDSSFileDTO,
  PostNetappFileDTO,
} from 'Models/FileTracker/Requests/FileTrackerPostFile.model';
import {
  PostBAMFileMappingDTO,
  PostCircosFileMappingDTO,
  PostDataFileMappingDTO,
  PostDataFilesMappingResponse,
  PostFusionFileMappingDTO,
  PostHTSFileMappingDTO,
  PostLinxFileMappingDTO,
  PostMethGeneFileMappingDTO,
  PostMethylationFileMappingDTO,
  PostMutsigFileMappingDTO,
  PostQCFileMappingDTO,
  PostReportFileMappingDTO,
  PostRNASeqClassifierFileMappingDTO,
  PostRNASeqFileMappingDTO,
  PostTSVFileMappingDTO,
} from 'Models/FileTracker/Requests/FileTrackerPostFileMappingModel';
import { IUploadNetappFileBody } from 'Models/FileTracker/Requests/FileTrackerUpdateFile.model';
import { IGetSignaturesQuery } from 'Models/FileTracker/Requests/GetSignaturesQuery.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { S3Service } from 'Modules/S3/S3.service';
import { FileTrackerClient } from '../../Clients/FileTracker/FileTracker.client';
import {
  IDataFile,
  IDNANexusFile,
  IDownloadURL,
  INCIMDSSFile,
  ISignatureFile,
} from '../../Models/FileTracker/FileTracker.model';

@Injectable()
export class FileTrackerService {
  constructor(
    private readonly fileTrackerClient: FileTrackerClient,
    @Inject(S3Service) private readonly s3: S3Service,
  @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  public async getFiles(
    user: IUserWithMetadata,
    page: number,
    limit: number,
    filters: IFileTrackerFilter,
  ): Promise<IDataFile[]> {
    const files = await this.fileTrackerClient.getFiles(user, page, limit, filters);
    return files;
  }

  public async getFilesCount(
    user: IUserWithMetadata,
    filters: IFileTrackerFilter,
  ): Promise<number> {
    const count = await this.fileTrackerClient.getFilesCount(user, filters);
    return count;
  }

  public async generateDownloadURLs(
    files: string[],
    user: IUserWithMetadata,
    expires?: number,
    contentDisposition?: string,
  ): Promise<IDownloadURL[]> {
    const urls = await this.fileTrackerClient.generateDownloadURLs(
      files,
      user,
      expires,
      contentDisposition,
    );
    return urls;
  }

  public async getFile(fileId: string, user: IUserWithMetadata): Promise<IDataFile> {
    const file = await this.fileTrackerClient.getFile(fileId, user);
    if (!file) {
      throw new NotFoundException(`File with id ${fileId} not found`);
    }
    return file;
  }

  public async getNetappFiles(
    key: string,
    bucket?: string,
    user?: IUserWithMetadata,
  ): Promise<IDataFile[]> {
    return this.fileTrackerClient.getNetappFiles(key, bucket, user);
  }

  public async getDNANexusFiles(
    user: IUserWithMetadata,
    dxFileId: string,
    dxProjectId: string,
  ): Promise<IDNANexusFile[]> {
    return this.fileTrackerClient.getDNANexusFiles(user, dxFileId, dxProjectId);
  }

  public async getNCIMDSSFiles(
    user: IUserWithMetadata,
    filePath: string,
    account: string,
  ): Promise<INCIMDSSFile[]> {
    return this.fileTrackerClient.getNCIMDSSFiles(user, filePath, account);
  }

  public async getSecondaryFiles(
    user: IUserWithMetadata,
    fileId: string,
    page: number,
    limit: number,
    filters: IFileTrackerFilter,
  ): Promise<IDataFile[]> {
    const files = await this.fileTrackerClient.getSecondaryFiles(
      fileId,
      user,
      page,
      limit,
      filters,
    );
    if (!files || files.length === 0) {
      throw new NotFoundException(
        `Secondary files for file with id ${fileId} not found`,
      );
    }
    return files;
  }

  public async getCollectionFiles(
    user: IUserWithMetadata,
    fileId: string,
    page: number,
    limit: number,
    filters: IFileTrackerFilter,
  ): Promise<IDataFile[]> {
    const files = await this.fileTrackerClient.getCollectionFiles(
      fileId,
      user,
      page,
      limit,
      filters,
    );
    if (!files || files.length === 0) {
      throw new NotFoundException(
        `Collection files for file with id ${fileId} not found`,
      );
    }
    return files;
  }

  public async getNetappKey(
    user: IUserWithMetadata,
    table: string,
    builder: (qb: Knex.QueryBuilder) => void,
    sampleId?: string,
  ): Promise<{ fileId: string; key: string; bucket: string }> {
    return this.fileTrackerClient.getNetappKey(user, table, builder, sampleId);
  }

  public async getNetappKeyByFileId(
    user: IUserWithMetadata,
    fileId: string,
  ): Promise<{ fileId: string; key: string; bucket: string }> {
    return this.fileTrackerClient.getNetappKeyByFileId(user, fileId);
  }

  public async getUserSignature(
    filters: IGetSignaturesQuery,
  ): Promise<ISignatureFile[]> {
    const signatures = await this.fileTrackerClient.getUserSignature(filters);
    return Promise.all(
      signatures.map(async (signature) => {
        const url = filters.includeURL
          ? await this.s3.getS3Url(signature.key, signature.bucket, 10)
          : undefined;
        const sigBody = await this.s3.getObject(signature.key, signature.bucket);
        if (sigBody.Body) {
          const byteArray = await sigBody.Body.transformToByteArray();
          const size = imageSize(byteArray);
          const { width } = size;
          const { height } = size;
          return {
            ...signature,
            width,
            height,
            url,
          };
        }
        return {
          ...signature,
          url,
        };
      }),
    );
  }

  public async downloadSignatureFile(fileId: string): Promise<Uint8Array> {
    const files = await this.getUserSignature({ fileId });
    if (files && files.length > 0) {
      const file = files[0];
      const fileBody = await this.s3.getObject(file.key, file.bucket);
      return fileBody.Body.transformToByteArray();
    }

    throw new NotFoundException(`File with file id ${fileId} not found`);
  }

  public async downloadFile(fileId: string, user: IUserWithMetadata): Promise<Uint8Array> {
    const { key, bucket } = await this.getNetappKeyByFileId(user, fileId);
    const fileBody = await this.s3.getObject(key, bucket);
    return fileBody.Body.transformToByteArray();
  }

  public async createFiles(
    postDataFilesBody: PostDataFileDTO[],
    overwrite = false,
  ): Promise<PostDataFilesResponse> {
    const validatedFiles = [];
    const invalidFiles = [];
    for (const file of postDataFilesBody) {
      const fileSchemas = [
        PostDNANexusFileDTO,
        PostNCIMDSSFileDTO,
        PostNetappFileDTO,
      ];
      let fileValidated = false;
      for (const fileSchema of fileSchemas) {
        const fileClass = plainToClass<PostDataFileDTO, unknown>(
          fileSchema,
          file,
        );
        const errors = await validate(fileClass);
        if (errors.length === 0) {
          validatedFiles.push(fileClass);
          fileValidated = true;
          break;
        }
      }
      if (!fileValidated) {
        invalidFiles.push({
          file,
          reason: 'Did not match any expected schema',
        });
      }
    }
    const {
      filesInserted,
      filesRejected,
    } = await this.fileTrackerClient.createFiles(validatedFiles, overwrite);
    return {
      filesInserted,
      filesRejected: [...invalidFiles, ...filesRejected],
    };
  }

  public async uploadFile(
    file: Express.Multer.File,
    body: IUploadNetappFileBody,
  ): Promise<string> {
    const s3Resp = await this.s3.postFile(body.key, file.buffer);
    const md5Hash = md5(file.buffer);
    const resp = await this.createFiles(
      [
        {
          fileName: body.fileName,
          fileType: body.fileType,
          fileSize: file.size,
          md5: md5Hash,
          sampleId: body.sampleId ?? body.analysisSetId,
          isHidden: body.isHidden,
          platform: 'netapp',
          key: body.key,
          bucket: s3Resp.bucket,
          etag: s3Resp.etag.replace(/"/g, ''),
        },
      ],
      true,
    );
    if (resp.filesInserted && resp.filesInserted.length > 0) {
      return resp.filesInserted[0].fileId;
    }
    throw new BadRequestException('Could not upload file');
  }

  public async createChildFiles(
    postSecondaryFilesBody: PostChildFilesDTO,
    type: 'secondary_files' | 'collections',
  ): Promise<PostChildFilesResponse> {
    return this.fileTrackerClient.createChildFiles(
      postSecondaryFilesBody,
      type,
    );
  }

  public async createFileMappings(
    postDataFileMappings: PostDataFileMappingDTO[],
  ): Promise<PostDataFilesMappingResponse> {
    const validatedFiles = [];
    const invalidFiles = [];
    for (const file of postDataFileMappings) {
      const fileSchemas = [
        PostCircosFileMappingDTO,
        PostMutsigFileMappingDTO,
        PostQCFileMappingDTO,
        PostMethylationFileMappingDTO,
        PostRNASeqFileMappingDTO,
        PostRNASeqClassifierFileMappingDTO,
        PostLinxFileMappingDTO,
        PostHTSFileMappingDTO,
        PostBAMFileMappingDTO,
        PostReportFileMappingDTO,
        PostFusionFileMappingDTO,
        PostMethGeneFileMappingDTO,
        PostTSVFileMappingDTO,
        PostRNASeqClassifierFileMappingDTO,
      ];
      let fileValidated = false;
      for (const fileSchema of fileSchemas) {
        const fileClass = plainToClass<PostDataFileMappingDTO, unknown>(
          fileSchema,
          file,
        );
        const errors = await validate(fileClass);
        if (
          errors.length === 0
          && ((fileClass.category === 'linx'
          && this.fileTrackerClient.validateLinxFile(
              fileClass as PostLinxFileMappingDTO,
          ))
          || fileClass.category !== 'linx')
        ) {
          validatedFiles.push(fileClass);
          fileValidated = true;
          break;
        }
      }
      if (!fileValidated) {
        invalidFiles.push({
          fileId: file,
          reason: 'Did not match any expected schema',
        });
      }
    }
    const {
      filesInserted,
      filesRejected,
    } = await this.fileTrackerClient.createFileMappings(validatedFiles);
    return {
      filesInserted,
      filesRejected: [...invalidFiles, ...filesRejected],
    };
  }

  public async deleteFiles(
    deleteDataFilesBody: DeleteDataFilesDTO,
  ): Promise<DeleteDataFilesResponse> {
    return this.fileTrackerClient.deleteFiles(deleteDataFilesBody);
  }

  public async streamS3URL(
    url: string,
  ): Promise<{ arr: Uint8Array, fileType: string }> {
    try {
      // create a new URL object
      const urlObj = new URL(url);
      if (urlObj.origin !== this.configService.get('aws.endpoint')) {
        throw new Error();
      }
      const [bucket, ...keyParts] = urlObj.pathname.replace(/^\//, '').split('/');
      const key = keyParts.join('/');
      const file = await this.getNetappFiles(key, bucket);
      if (!file[0] || file[0].fileSize > 5000000) {
        throw new Error();
      }
      const fileObject = await this.s3.getObject(key, bucket);
      return {
        arr: await fileObject.Body.transformToByteArray(),
        fileType: fileObject.ContentType,
      };
    } catch {
      throw new BadRequestException('URL provided is invalid');
    }
  }
}
