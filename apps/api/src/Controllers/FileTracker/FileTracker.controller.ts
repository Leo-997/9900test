import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Header,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'Decorators/CurrentUser.decorator';
import { Public } from 'Decorators/Public.decorator';
import { CustomHTTPBearerAuthGuard } from 'Guards/Auth/CustomHTTPBearerAuthGuard.guard';
import { DeleteDataFilesDTO, DeleteDataFilesResponse } from 'Models/FileTracker/Requests/FileTrackerDeleteFiles.model';
import {
  DNANexusFileFilterDTO,
  FileTrackerFilterDTO,
  GenerateDownloadUrlsDTO,
  NCIMDSSFileFilterDTO,
  NetappFileFilterDTO,
  StreamS3URLQueryDTO,
} from 'Models/FileTracker/Requests/FileTrackerFilter.model';
import { PostChildFilesDTO, PostChildFilesResponse } from 'Models/FileTracker/Requests/FileTrackerPostChildFiles.model';
import {
  PostDataFileDTO,
  PostDataFilesResponse,
} from 'Models/FileTracker/Requests/FileTrackerPostFile.model';
import { PostDataFileMappingDTO, PostDataFilesMappingResponse } from 'Models/FileTracker/Requests/FileTrackerPostFileMappingModel';
import { UploadNetappFileDTO } from 'Models/FileTracker/Requests/FileTrackerUpdateFile.model';
import { GetSignaturesQueryDTO } from 'Models/FileTracker/Requests/GetSignaturesQuery.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { AccessControlService } from 'Services/AccessControl/AccessControl.service';
import { FileTrackerService } from 'Services/FileTracker/FileTracker.service';
import { Response } from 'express';
import { Readable } from 'stream';
import {
  IDNANexusFile,
  IDataFile, IDownloadURL, INCIMDSSFile, ISignatureFile,
} from '../../Models/FileTracker/FileTracker.model';

@UseGuards(CustomHTTPBearerAuthGuard)
@Controller('/files')
export class FileTrackerController {
  constructor(
    private readonly fileTrackerService: FileTrackerService,
    private readonly accessControlService: AccessControlService,
  ) {}

  @Get()
  public async getFiles(
    @Query() { page, limit, ...filters }: FileTrackerFilterDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IDataFile[]> {
    return this.fileTrackerService.getFiles(user, page, limit, filters);
  }

  @Get('/count')
  public async getFilesCount(
    @Query() { ...filters }: FileTrackerFilterDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<number> {
    return this.fileTrackerService.getFilesCount(user, filters);
  }

  @Get('/generate')
  public async generateDownloadURLs(
    @Query() { files }: GenerateDownloadUrlsDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IDownloadURL[]> {
    return this.fileTrackerService.generateDownloadURLs(files, user);
  }

  @Get('/netapp')
  public async getNetappFiles(
    @Query() { key, bucket }: NetappFileFilterDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IDataFile[]> {
    return this.fileTrackerService.getNetappFiles(key, bucket, user);
  }

  @Get('/dnanexus')
  public async getDNANexusFiles(
    @Query() { dxFileId, dxProjectId }: DNANexusFileFilterDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IDNANexusFile[]> {
    return this.fileTrackerService.getDNANexusFiles(user, dxFileId, dxProjectId);
  }

  @Get('/ncimdss')
  public async getNCIMDSSFiles(
    @Query() { filePath, account }: NCIMDSSFileFilterDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<INCIMDSSFile[]> {
    return this.fileTrackerService.getNCIMDSSFiles(user, filePath, account);
  }

  @Get('/user-signatures')
  public async getUserSignature(
    @Query() filters: GetSignaturesQueryDTO,
  ): Promise<ISignatureFile[]> {
    return this.fileTrackerService.getUserSignature(filters);
  }

  @Get('/user-signatures/:fileId/download')
  public async downloadSignatureFile(
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ): Promise<any> {
    const byteArr = await this.fileTrackerService.downloadSignatureFile(fileId);
    const buffer = Buffer.from(byteArr);
    const stream = Readable.from(buffer);
    return stream.pipe(res);
  }

  @Get('/:fileId/secondary')
  public async getSecondaryFiles(
    @Param('fileId') fileId: string,
    @Query() { page, limit, ...filters }: FileTrackerFilterDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IDataFile[]> {
    return this.fileTrackerService.getSecondaryFiles(
      user,
      fileId,
      page,
      limit,
      filters,
    );
  }

  @Get('/:fileId/collection')
  public async getCollectionFiles(
    @Param('fileId') fileId: string,
    @Query() { page, limit, ...filters }: FileTrackerFilterDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IDataFile[]> {
    return this.fileTrackerService.getCollectionFiles(user, fileId, page, limit, filters);
  }

  @Get(':fileId/download')
  public async downloadFile(
    @Param('fileId') fileId: string,
    @Res() res: Response,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<any> {
    const file = await this.fileTrackerService.getFile(fileId, user);
    const byteArr = await this.fileTrackerService.downloadFile(fileId, user);
    const buffer = Buffer.from(byteArr);
    const stream = Readable.from(buffer);
    res.setHeader('Content-Type', `application/${file.fileType}`);
    res.setHeader('Content-Disposition', 'attachment');
    return stream.pipe(res);
  }

  @Public()
  @Get('/stream-s3-url')
  @Header('Cross-Origin-Resource-Policy', 'cross-origin')
  public async streamS3URL(
    @Query() { url }: StreamS3URLQueryDTO,
    @Res() res: Response,
  ): Promise<any> {
    const { arr, fileType } = await this.fileTrackerService.streamS3URL(url);
    const buffer = Buffer.from(arr);
    const stream = Readable.from(buffer);
    res.setHeader('Content-Type', fileType);
    res.setHeader('Content-Disposition', 'attachment');
    return stream.pipe(res);
  }

  @Get(':fileId')
  public async getFile(
    @Param('fileId') fileId: string,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<IDataFile> {
    return this.fileTrackerService.getFile(fileId, user);
  }

  @Post()
  public async createFiles(
    @Body() postDataFilesBody: PostDataFileDTO[],
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<PostDataFilesResponse> {
    if (!Array.isArray(postDataFilesBody)) {
      throw new BadRequestException('Body must be an array of file objects');
    }
    const canAccess = await Promise.all(postDataFilesBody.map(async (file) => (
      this.accessControlService.canAccessResource(
        true,
        user,
        {
          biosampleId: file.sampleId,
        },
      ))));
    if (canAccess.some((access) => !access)) {
      throw new ForbiddenException();
    }
    return this.fileTrackerService.createFiles(postDataFilesBody);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5000000 } }))
  public async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadNetappFileDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<string> {
    const canAccess = await this.accessControlService.canAccessResource(
      true,
      user,
      {
        biosampleId: body.sampleId,
        analysisSetId: body.analysisSetId,
      },
    );
    if (!canAccess) {
      throw new ForbiddenException();
    }
    return this.fileTrackerService.uploadFile(file, body);
  }

  @Post('/secondary')
  public async createSecondaryFiles(
    @Body() postSecondaryFilesBody: PostChildFilesDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<PostChildFilesResponse> {
    const parentFile = await this.fileTrackerService.getFile(
      postSecondaryFilesBody.parentFileId,
      user,
    );
    const secondaryFiles = await Promise.all(
      postSecondaryFilesBody.childFileIds.map(async (fileId) => (
        this.fileTrackerService.getFile(fileId, user)
      )),
    );
    if (secondaryFiles.some((file) => !file) || !parentFile) {
      throw new ForbiddenException();
    }
    return this.fileTrackerService.createChildFiles(postSecondaryFilesBody, 'secondary_files');
  }

  @Post('/collection')
  public async createCollectionFiles(
    @Body() postSecondaryFilesBody: PostChildFilesDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<PostChildFilesResponse> {
    const parentFile = await this.fileTrackerService.getFile(
      postSecondaryFilesBody.parentFileId,
      user,
    );
    const collectionFiles = await Promise.all(
      postSecondaryFilesBody.childFileIds.map(async (fileId) => (
        this.fileTrackerService.getFile(fileId, user)
      )),
    );
    if (collectionFiles.some((file) => !file) || !parentFile) {
      throw new ForbiddenException();
    }
    return this.fileTrackerService.createChildFiles(postSecondaryFilesBody, 'collections');
  }

  @Post('/mapping')
  public async createFileMappings(
    @Body() postDataFileMappingBody: PostDataFileMappingDTO[],
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<PostDataFilesMappingResponse> {
    if (!Array.isArray(postDataFileMappingBody)) {
      throw new BadRequestException('Body must be an array of mappings');
    }
    const files = await Promise.all(
      postDataFileMappingBody.map(async (mapping) => (
        this.fileTrackerService.getFile(mapping.fileId, user)
      )),
    );
    if (files.some((file) => !file)) {
      throw new ForbiddenException();
    }
    return this.fileTrackerService.createFileMappings(postDataFileMappingBody);
  }

  @Delete()
  public async deleteFiles(
    @Body() deleteDataFilesBody: DeleteDataFilesDTO,
    @CurrentUser() user: IUserWithMetadata,
  ): Promise<DeleteDataFilesResponse> {
    const files = await Promise.all(
      deleteDataFilesBody.fileIds.map(async (fileId) => (
        this.fileTrackerService.getFile(fileId, user)
      )),
    );
    if (files.some((file) => !file)) {
      throw new ForbiddenException();
    }
    return this.fileTrackerService.deleteFiles(deleteDataFilesBody);
  }
}
