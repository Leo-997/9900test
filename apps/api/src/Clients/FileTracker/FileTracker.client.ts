/* eslint-disable no-await-in-loop */
import { Inject, Injectable } from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { Knex } from 'knex';
import {
  Categories,
  IDataFile,
  IDataFileRaw,
  IDNANexusFile,
  IDownloadURL,
  INCIMDSSFile,
  InsertFileRetunType,
  ISignatureFile,
} from 'Models/FileTracker/FileTracker.model';
import {
  DeleteDataFilesDTO,
  DeleteDataFilesResponse,
} from 'Models/FileTracker/Requests/FileTrackerDeleteFiles.model';
import { IFileTrackerFilter } from 'Models/FileTracker/Requests/FileTrackerFilter.model';
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
import { IGetSignaturesQuery } from 'Models/FileTracker/Requests/GetSignaturesQuery.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { DNANexusService } from 'Modules/DNANexus/DNANexus.service';
import {
  FILE_TRACKER_KNEX_CONNECTION,
  KNEX_CONNECTION,
} from 'Modules/Knex/constants';
import { S3Service } from 'Modules/S3/S3.service';
import { withAnalysisSet } from 'Utilities/query/accessControl/withAnalysisSet.util';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';
import {
  toFileTrackerColumn,
  toOrderBySQLQuery,
} from 'Utilities/transformers/SortMapping.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileTrackerClient {
  constructor(
    @Inject(FILE_TRACKER_KNEX_CONNECTION) private readonly knex: Knex,
    @Inject(KNEX_CONNECTION) private readonly zdKnex: Knex,
    @Inject(S3Service) private readonly s3: S3Service,
    @Inject(DNANexusService) private readonly dx: DNANexusService,
  ) {}

  public async getFiles(
    user: IUserWithMetadata,
    page = 1,
    limit = 10,
    filters: IFileTrackerFilter = {},
  ): Promise<IDataFile[]> {
    const query = this.baseFileQuery(user)
      .modify(this.withFilters, page, limit, filters)
      .where('c2.file_id', null)
      .then((data) => data.map((row) => this.jsonifyRows(row)));

    return query;
  }

  public async getFilesCount(
    user: IUserWithMetadata,
    filters: IFileTrackerFilter = {},
  ): Promise<number> {
    const biosamples = this.zdKnex
      .select('biosample_id')
      .modify(withBiosample, 'from', user);

    const data = await this.knex
      .count<Record<string, number>>('* as count')
      .from<IDataFile>({ d: 'datafiles' })
      .leftJoin({ c: 'collections' }, 'c.file_id', 'd.file_id')
      .where(function biosampleCheck() {
        this.whereIn('d.sample_id', biosamples)
          .orWhere('d.sample_id', '');
      })
      .modify(this.withFilters, 1, 1, filters)
      .where('c.file_id', null)
      .first();

    return data.count;
  }

  public async generateDownloadURLs(
    files: string[],
    user: IUserWithMetadata,
    expires?: number,
    contentDisposition?: string,
  ): Promise<IDownloadURL[]> {
    const biosamples = this.zdKnex
      .select('biosample_id')
      .modify(withBiosample, 'from', user);

    const urls: IDownloadURL[] = [];
    const datafiles = await this.knex
      .select({
        fileId: 'd.file_id',
        fileName: 'd.filename',
        platform: 'd.platform',
        key: 'n.key',
        bucket: 'n.bucket',
        dxFileId: 'dna.dxfile_id',
        dxProjectId: 'dna.dxproject_id',
      })
      .from<IDataFile[]>({ d: 'datafiles' })
      .leftJoin({ n: 'netapp' }, 'd.file_id', 'n.file_id')
      .leftJoin({ dna: 'dnanexus' }, 'd.file_id', 'dna.file_id')
      .where(function biosampleCheck() {
        this.whereIn('d.sample_id', biosamples)
          .orWhere('d.sample_id', '');
      })
      .whereIn('d.file_id', files)
      .where(function customWhereBuilder() {
        this.whereNotNull('n.file_id').orWhereNotNull('dna.file_id');
      });

    for (const file of datafiles) {
      let url: string;
      if (file.platform === 'netapp') {
        const { key, bucket } = file;
        url = await this.s3.getS3Url(key, bucket, expires, contentDisposition);
      } else if (file.platform === 'dnanexus') {
        const { dxFileId, dxProjectId, fileName } = file;
        url = await this.dx.getDNANexusUrl(dxFileId, dxProjectId, fileName);
      }
      urls.push({
        fileId: file.fileId,
        fileName: file.fileName,
        url,
      });
    }

    return urls;
  }

  public async getFile(fileId: string, user: IUserWithMetadata): Promise<IDataFile> {
    return this.baseFileQuery(user).where('d.file_id', fileId).first();
  }

  public async getNetappFiles(
    key: string,
    bucket?: string,
    user?: IUserWithMetadata,
  ): Promise<IDataFile[]> {
    return this.baseFileQuery(user)
      .select({
        key: 'n.key',
        bucket: 'n.bucket',
      })
      .leftJoin({ n: 'netapp' }, 'd.file_id', 'n.file_id')
      .where('n.key', key)
      .andWhere(function whereBuilder() {
        if (bucket) this.andWhere('n.bucket', bucket);
      })
      .then((data) => data.map((row) => this.jsonifyRows(row)));
  }

  public async getDNANexusFiles(
    user: IUserWithMetadata,
    dxFileId: string,
    dxProjectId: string,
  ): Promise<IDNANexusFile[]> {
    return this.baseFileQuery(user)
      .select({
        dxFileId: 'dna.dxfile_id',
        dxProjectId: 'dna.dxproject_id',
        dxRegion: 'dna.region',
        dxProject: 'dna.dxproject',
        dxfolder: 'dna.dxfolder',
      })
      .leftJoin({ dna: 'dnanexus' }, 'd.file_id', 'dna.file_id')
      .where('dna.dxfile_id', dxFileId)
      .andWhere('dna.dxproject_id', dxProjectId)
      .then((data) => data.map((row) => this.jsonifyRows(row)));
  }

  public async getNCIMDSSFiles(
    user: IUserWithMetadata,
    filePath: string,
    account?: string,
  ): Promise<INCIMDSSFile[]> {
    return this.baseFileQuery(user)
      .select({
        filePath: 'nci.filePath',
        account: 'nci.account',
      })
      .leftJoin({ nci: 'ncimdss' }, 'd.file_id', 'nci.file_id')
      .where('nci.filePath', filePath)
      .andWhere('nci.account', account)
      .then((data) => data.map((row) => this.jsonifyRows(row)));
  }

  public async getNetappKey(
    user: IUserWithMetadata,
    table: string,
    builder: (qb: Knex.QueryBuilder) => void,
    sampleId?: string,
  ): Promise<{ fileId: string; key: string; bucket: string }> {
    const biosamples = this.zdKnex
      .select('biosample_id')
      .modify(withBiosample, 'from', user);

    const query = this.knex
      .select({
        fileId: 'd.file_id',
        key: 'n.key',
        bucket: 'n.bucket',
      })
      .from({ n: 'netapp' })
      .innerJoin({ d: 'datafiles' }, 'd.file_id', 'n.file_id')
      .innerJoin({ t: table }, 't.file_id', 'd.file_id')
      .where(function biosampleCheck() {
        this.whereIn('d.sample_id', biosamples)
          .orWhere('d.sample_id', '');
      });

    if (sampleId) query.where('d.sample_id', sampleId);

    query.andWhere((qb) => builder(qb)).orderBy('d.updated_at', 'desc');

    const result = await query.first();
    return (
      result || {
        fileId: '',
        key: '',
        bucket: '',
      }
    );
  }

  public async getNetappKeyByFileId(
    user: IUserWithMetadata,
    fileId: string,
  ): Promise<{ fileId: string; key: string; bucket: string }> {
    const biosamples = this.zdKnex
      .select('biosample_id')
      .modify(withBiosample, 'from', user);

    const analysisSets = this.zdKnex
      .select('analysis_set_id')
      .modify(
        withAnalysisSet,
        'from',
        user,
        undefined,
        undefined,
        true,
      );

    return this.knex
      .select({
        fileId: 'n.file_id',
        key: 'n.key',
        bucket: 'n.bucket',
      })
      .from({ n: 'netapp' })
      .innerJoin({ d: 'datafiles' }, 'd.file_id', 'n.file_id')
      .where(function biosampleCheck() {
        this.whereIn('d.sample_id', biosamples)
          .orWhereIn('d.sample_id', analysisSets)
          .orWhere('d.sample_id', '');
      })
      .where('n.file_id', fileId)
      .first();
  }

  public async getSecondaryFiles(
    fileId: string,
    user: IUserWithMetadata,
    page = 1,
    limit = 10,
    filters: IFileTrackerFilter = {},
  ): Promise<IDataFile[]> {
    return this.baseFileQuery(user)
      .innerJoin({ s: 'secondary_files' }, 'd.file_id', 's.secondary_file_id')
      .where('s.primary_file_id', fileId)
      .modify(this.withFilters, page, limit, filters);
  }

  public async getCollectionFiles(
    fileId: string,
    user: IUserWithMetadata,
    page = 1,
    limit = 10,
    filters: IFileTrackerFilter = {},
  ): Promise<IDataFile[]> {
    return this.baseFileQuery(user)
      .innerJoin({ c: 'collections' }, 'd.file_id', 'c.file_id')
      .where('c.collection_file_id', fileId)
      .modify(this.withFilters, page, limit, filters);
  }

  public async getUserSignature({
    fileId,
    userIds,
  }: IGetSignaturesQuery): Promise<ISignatureFile[]> {
    return this.knex
      .select({
        fileId: 'file_id',
        fileName: 'filename',
        md5: 'md5',
        key: 'key',
        bucket: 'bucket',
        etag: 'etag',
        userId: 'user',
      })
      .from('zcc_zd_signatures')
      .where(function fileIdQuery() {
        if (fileId) {
          this.where('file_id', fileId);
        }
      })
      .andWhere(function userQuery() {
        if (userIds && userIds.length > 0) {
          this.whereIn('user', userIds);
        }
      });
  }

  private baseFileQuery(
    user?: IUserWithMetadata,
  ): Knex.QueryBuilder {
    const biosamples = user
      ? this.zdKnex
        .select('biosample_id')
        .modify(withBiosample, 'from', user)
      : undefined;

    const analysisSets = user
      ? this.zdKnex
        .select('analysis_set_id')
        .modify(
          withAnalysisSet,
          'from',
          user,
          undefined,
          undefined,
          true,
        )
      : undefined;

    const query = this.knex
      .select({
        fileId: 'd.file_id',
        patientId: 'd.patient_id',
        sampleId: 'd.sample_id',
        flowcellId: 'd.flowcell_id',
        lane: 'd.lane',
        refGenome: 'd.ref_genome',
        sampleType: 'd.sample_type',
        fileName: 'd.filename',
        fileType: 'd.filetype',
        md5: 'd.md5',
        fileSize: 'd.filesize',
        platform: 'd.platform',
        isHidden: 'd.is_hidden',
        updatedAt: 'd.updated_at',
        collections: this.knex.raw(
          'JSON_ARRAYAGG(JSON_OBJECT("fileId", d2.file_id, "fileName", d2.filename,  "fileType", d2.filetype, "fileSize", d2.filesize))',
        ),
        secondaryFiles: this.knex.raw(
          'JSON_ARRAYAGG(JSON_OBJECT("fileId", d3.file_id, "fileName", d3.filename,  "fileType", d3.filetype, "fileSize", d3.filesize))',
        ),
      })
      .from<IDataFile[]>({ d: 'datafiles' })
      .where(function sampleIdCheck() {
        if (biosamples !== undefined && analysisSets !== undefined) {
          this.where(function biosampleCheck() {
            this.whereIn('d.sample_id', biosamples)
              .orWhereIn('d.sample_id', analysisSets)
              .orWhere('d.sample_id', '');
          })
            .orWhere('d.sample_id', '');
        }
      })
      .leftJoin({ c: 'collections' }, 'd.file_id', 'c.collection_file_id')
      .leftJoin({ s: 'secondary_files' }, 'd.file_id', 's.primary_file_id')
      .leftJoin({ d2: 'datafiles' }, 'd2.file_id', 'c.file_id')
      .leftJoin({ d3: 'datafiles' }, 'd3.file_id', 's.secondary_file_id')
      .leftJoin({ c2: 'collections' }, 'd.file_id', 'c2.file_id')
      .groupBy('d.file_id');

    return query;
  }

  private withFilters(
    query: Knex.QueryBuilder,
    page = 1,
    limit = 10,
    filters: IFileTrackerFilter = {},
  ): void {
    const offset = (page - 1) * limit;

    const tableAliases = {
      datafilesTblAlias: 'd',
    };

    let customSort = 'd.filename ASC';
    if (filters.sortColumns) {
      customSort = toOrderBySQLQuery(
        toFileTrackerColumn,
        tableAliases,
        filters.sortColumns,
        filters.sortDirections,
      );
    }

    query
      .where(function customWhereBuilder() {
        if (filters.search) {
          for (const str of filters.search) {
            this.orWhere('d.filename', 'like', `%${str}%`)
              .orWhere('d.sample_id', 'like', `%${str}%`)
              .orWhere('d.patient_id', 'like', `%${str}%`);
          }
        }
      })
      .andWhere(function customWhereBuilder() {
        if (filters.platform) {
          this.whereIn('d.platform', filters.platform);
        }
        if (filters.fileType) {
          this.whereIn('d.filetype', filters.fileType);
        }
        if (filters.refGenome) {
          this.whereIn('d.ref_genome', filters.refGenome);
        }
        if (filters.sampleType) {
          this.whereIn('d.sample_type', filters.sampleType);
        }
        if (filters.fileSize) {
          this.andWhere('d.filesize', '>=', filters.fileSize[0]);
          if (filters.fileSize[1] < Infinity) {
            this.andWhere('d.filesize', '<=', filters.fileSize[1]);
          }
        }
        if (filters.isHidden) {
          this.andWhere('d.is_hidden', filters.isHidden);
        } else {
          this.andWhere('d.is_hidden', false);
        }
      })
      .whereNotIn('d.file_id', function reportsFilter() {
        this
          .select('file_id')
          .from('zcc_zd_reports');
      })
      .offset(offset)
      .orderByRaw(customSort)
      .limit(limit);
  }

  private jsonifyRows(
    row: IDataFileRaw,
  ): IDataFile {
    const newRow = {
      ...row,
      collections: typeof row.collections === 'string' ? JSON.parse(row.collections) : row.collections,
      secondaryFiles: typeof row.secondaryFiles === 'string' ? JSON.parse(row.secondaryFiles) : row.secondaryFiles,
    };
    if (newRow.collections[0].fileId === null) newRow.collections = [];
    if (newRow.secondaryFiles[0].fileId === null) newRow.secondaryFiles = [];
    return newRow;
  }

  public async createFiles(
    files: PostDataFileDTO[],
    overwrite = false,
  ): Promise<PostDataFilesResponse> {
    const filesInserted = [];
    const filesRejected = [];
    for (const file of files) {
      const { fileId, error } = await this.insertOrUpdateFile(file, overwrite);
      if (!fileId) {
        filesRejected.push({
          file,
          reason: error,
        });
      } else {
        filesInserted.push({
          ...file,
          fileId,
        });
      }
    }
    return {
      filesInserted,
      filesRejected,
    };
  }

  private async insertOrUpdateFile(
    file: PostDataFileDTO,
    overwrite = false,
  ): Promise<InsertFileRetunType> {
    let newFile = {
      ...file,
    };
    if (file.platform === 'netapp') {
      const accInfo = await this.getNetappAccountInfo(
        file as PostNetappFileDTO,
      );
      if (accInfo.error) {
        return {
          fileId: null,
          error: accInfo.error,
        };
      }
      newFile = accInfo.file;
    }

    if (overwrite) {
      const fileId = await this.findFileIdByPlatformKey(newFile);
      if (fileId) {
        return this.updatePlatformFile(newFile, fileId);
      }
    }
    return this.insertPlatformFile(newFile);
  }

  private async findFileIdByPlatformKey(
    file: PostDataFileDTO,
  ): Promise<string | null> {
    const { platform } = file;

    let platformCondition = {};
    if (platform === 'netapp') {
      platformCondition = {
        key: (file as PostNetappFileDTO).key,
        bucket: (file as PostNetappFileDTO).bucket,
      };
    } else if (platform === 'dnanexus') {
      platformCondition = {
        dxproject_id: (file as PostDNANexusFileDTO).dxProjectId,
        dxfile_id: (file as PostDNANexusFileDTO).dxFileId,
      };
    } else if (platform === 'ncimdss') {
      platformCondition = {
        filepath: (file as PostNCIMDSSFileDTO).filePath,
      };
    } else {
      return null;
    }

    const fileId = await this.knex
      .select('file_id')
      .from<string>(platform)
      .where(platformCondition)
      .first();
    return fileId ? fileId.file_id : null;
  }

  private async updatePlatformFile(
    file: PostDataFileDTO,
    fileId: string,
  ): Promise<InsertFileRetunType> {
    let error = '';
    const fileMapping: PostDataFileMappingDTO = await this.checkCategoryFields(
      file,
      fileId,
    );
    if (fileMapping || !file.category) {
      await this.knex.transaction((trx) => {
        this.updateDataFile(file, fileId, trx)
          .then(() => {
            let platformQuery = null;
            if (file.platform === 'netapp') {
              platformQuery = this.updateNetappFile(
                file as PostNetappFileDTO,
                fileId,
                trx,
              );
            } else if (file.platform === 'dnanexus') {
              platformQuery = this.updateDNANexusFile(
                file as PostDNANexusFileDTO,
                fileId,
                trx,
              );
            } else if (file.platform === 'ncimdss') {
              platformQuery = this.updateNCIMDSSFile(
                file as PostNCIMDSSFileDTO,
                fileId,
                trx,
              );
            }
            platformQuery
              .then(() => {
                if (file.category) {
                  this.upsertCategoryMapping(fileMapping, file.category, trx, true)
                    .then(() => {
                      trx.commit();
                    })
                    .catch(() => {
                      error = 'Error updating category mapping';
                      trx.rollback();
                    });
                } else {
                  trx.commit();
                }
              })
              .catch(() => {
                error = `Error updating ${file.platform} file`;
                trx.rollback();
              });
          })
          .catch(() => {
            error = 'Error updating data file';
            trx.rollback();
          });
      });
    } else {
      error = 'Category provided, but mapping fields are incorrect';
    }

    return {
      fileId: error ? null : fileId,
      error,
    };
  }

  private async insertPlatformFile(
    file: PostDataFileDTO,
  ): Promise<InsertFileRetunType> {
    let error = '';
    const fileId = uuidv4();
    const fileMapping: PostDataFileMappingDTO = await this.checkCategoryFields(
      file,
      fileId,
    );
    if (fileMapping || !file.category) {
      await this.knex.transaction((trx) => {
        // insert data file
        this.insertDataFile(file, fileId, trx)
          .then(() => {
            let platformQuery = null;
            if (file.platform === 'netapp') {
              platformQuery = this.insertNetappFile(
                file as PostNetappFileDTO,
                fileId,
                trx,
              );
            } else if (file.platform === 'dnanexus') {
              platformQuery = this.insertDNANexusFile(
                file as PostDNANexusFileDTO,
                fileId,
                trx,
              );
            } else if (file.platform === 'ncimdss') {
              platformQuery = this.insertNCIMDSSFile(
                file as PostNCIMDSSFileDTO,
                fileId,
                trx,
              );
            }
            platformQuery
              .then(() => {
                // insert category mapping
                if (file.category) {
                  this.upsertCategoryMapping(fileMapping, file.category, trx)
                    .then(() => {
                      trx.commit();
                    })
                    .catch((err) => {
                      console.error(err);
                      error = 'Error inserting category mapping';
                      trx.rollback();
                    });
                } else {
                  trx.commit();
                }
              })
              .catch(() => {
                error = `Error inserting ${file.platform} file`;
                trx.rollback();
              });
          })
          .catch(() => {
            error = 'Error inserting data file';
            trx.rollback();
          });
      });
    } else {
      error = 'Category provided, but mapping fields are incorrect';
    }

    return {
      fileId: error ? null : fileId,
      error,
    };
  }

  private async updateDataFile(
    file: PostDataFileDTO,
    fileId: string,
    trx: Knex.Transaction,
  ): Promise<Knex.QueryBuilder> {
    return this.knex('datafiles')
      .transacting(trx)
      .where('file_id', fileId)
      .update({
        patient_id: file.patientId,
        sample_id: file.sampleId,
        public_sample_id: file.publicSampleId,
        public_patient_id: file.publicPatientId,
        flowcell_id: file.flowcellId,
        lane: file.lane,
        ref_genome: file.refGenome,
        sample_type: file.sampleType,
        filename: file.fileName,
        filetype: file.fileType,
        filesize: file.fileSize,
        md5: file.md5,
        platform: file.platform,
        is_hidden: file.isHidden,
        updated_at: file.updatedAt ? file.updatedAt : new Date(),
      });
  }

  private async insertDataFile(
    file: PostDataFileDTO,
    fileId: string,
    trx: Knex.Transaction,
  ): Promise<Knex.QueryBuilder> {
    return this.knex('datafiles')
      .transacting(trx)
      .insert({
        file_id: fileId,
        patient_id: file.patientId,
        sample_id: file.sampleId,
        public_sample_id: file.publicSampleId,
        public_patient_id: file.publicPatientId,
        flowcell_id: file.flowcellId,
        lane: file.lane,
        ref_genome: file.refGenome ? file.refGenome : 'hs38',
        sample_type: file.sampleType ? file.sampleType : 'tumour',
        filename: file.fileName,
        filetype: file.fileType,
        filesize: file.fileSize,
        md5: file.md5,
        platform: file.platform,
        is_hidden: file.isHidden,
        updated_at: file.updatedAt,
      });
  }

  private async updateNetappFile(
    file: PostNetappFileDTO,
    fileId: string,
    trx: Knex.Transaction,
  ): Promise<Knex.QueryBuilder> {
    return this.knex('netapp')
      .transacting(trx)
      .where('file_id', fileId)
      .update({
        key: file.key,
        bucket: file.bucket,
        etag: file.etag,
        account_id: file.accountId,
        accountname: file.accountName,
      });
  }

  private async insertNetappFile(
    file: PostNetappFileDTO,
    fileId: string,
    trx: Knex.Transaction,
  ): Promise<Knex.QueryBuilder> {
    return this.knex('netapp').transacting(trx).insert({
      file_id: fileId,
      key: file.key,
      bucket: file.bucket,
      etag: file.etag,
      account_id: file.accountId,
      accountname: file.accountName,
    });
  }

  private async updateDNANexusFile(
    file: PostDNANexusFileDTO,
    fileId: string,
    trx: Knex.Transaction,
  ): Promise<Knex.QueryBuilder> {
    return this.knex('dnanexus')
      .transacting(trx)
      .where('file_id', fileId)
      .update({
        dxproject_id: file.dxProjectId,
        dxfile_id: file.dxFileId,
        dxproject: file.dxProject,
        dxfolder: file.dxFolder,
        region: file.dxRegion,
      });
  }

  private async insertDNANexusFile(
    file: PostDNANexusFileDTO,
    fileId: string,
    trx: Knex.Transaction,
  ): Promise<Knex.QueryBuilder> {
    return this.knex('dnanexus').transacting(trx).insert({
      file_id: fileId,
      dxproject_id: file.dxProjectId,
      dxfile_id: file.dxFileId,
      dxproject: file.dxProject,
      dxfolder: file.dxFolder,
      region: file.dxRegion,
    });
  }

  private async updateNCIMDSSFile(
    file: PostNCIMDSSFileDTO,
    fileId: string,
    trx: Knex.Transaction,
  ): Promise<Knex.QueryBuilder> {
    return this.knex('ncimdss')
      .transacting(trx)
      .where('file_id', fileId)
      .insert({
        filepath: file.filePath,
        account: file.account,
      });
  }

  private async insertNCIMDSSFile(
    file: PostNCIMDSSFileDTO,
    fileId: string,
    trx: Knex.Transaction,
  ): Promise<Knex.QueryBuilder> {
    return this.knex('ncimdss').transacting(trx).insert({
      file_id: fileId,
      filepath: file.filePath,
      account: file.account,
    });
  }

  public async getNetappAccountInfo(
    file: PostNetappFileDTO,
  ): Promise<{ file: PostNetappFileDTO; error: string }> {
    const newFile = {
      ...file,
    };
    if (!newFile.accountId || !newFile.accountName) {
      try {
        const accountInfo = await this.s3.getAccountInfo(newFile.bucket);
        if (accountInfo) {
          newFile.accountId = accountInfo.Owner.ID;
          newFile.accountName = accountInfo.Owner.DisplayName;
        }
      } catch {
        newFile.accountId = null;
        newFile.accountName = null;
      }
    }
    return {
      file: newFile,
      error: null,
    };
  }

  public async createChildFiles(
    postChildFilesBody: PostChildFilesDTO,
    table: 'secondary_files' | 'collections',
  ): Promise<PostChildFilesResponse> {
    const filesInserted = [];
    const filesRejected = [];

    // ensure the primary file exists, otherwise reject everything
    const { parentFileId } = await this.knex
      .select({
        parentFileId: 'd.file_id',
      })
      .from({ d: 'datafiles' })
      .where({ file_id: postChildFilesBody.parentFileId })
      .first();

    if (!parentFileId) {
      return {
        filesInserted,
        filesRejected: postChildFilesBody.childFileIds.map((fileId) => ({
          fileId,
          reason: 'Parent file not found',
        })),
      };
    }

    await this.knex.transaction(async (trx) => {
      for (const fileId of postChildFilesBody.childFileIds) {
        if (fileId !== parentFileId) {
          try {
            await this.knex(table)
              .transacting(trx)
              .insert(this.getChildFileInsertObject(table, parentFileId, fileId));
            filesInserted.push(fileId);
          } catch {
            filesRejected.push({
              fileId,
              reason: 'Child file not found, or a record already exists',
            });
          }
        } else {
          filesRejected.push({
            fileId,
            reason: 'Child ID and parent ID are the same',
          });
        }
      }
    });

    return {
      filesInserted,
      filesRejected,
    };
  }

  private getChildFileInsertObject(
    table: 'secondary_files' | 'collections',
    parentFileId: string,
    childFileId: string,
  ): {
    primary_file_id: string;
    secondary_file_id: string;
} | {
    collection_file_id: string;
    file_id: string;
} {
    if (table === 'secondary_files') {
      return {
        primary_file_id: parentFileId,
        secondary_file_id: childFileId,
      };
    }
    return {
      collection_file_id: parentFileId,
      file_id: childFileId,
    };
  }

  public async createFileMappings(
    postDataFileMappings: PostDataFileMappingDTO[],
  ): Promise<PostDataFilesMappingResponse> {
    const filesInserted = [];
    const filesRejected = [];
    for (const mapping of postDataFileMappings) {
      await this.upsertCategoryMapping(mapping, mapping.category)
        .then(() => {
          filesInserted.push({
            fileId: mapping.fileId,
          });
        })
        .catch(() => {
          filesRejected.push({
            fileId: mapping,
            reason: 'File not found, or a record already exists',
          });
        });
    }

    return {
      filesInserted,
      filesRejected,
    };
  }

  private async upsertCategoryMapping(
    fileMapping: PostDataFileMappingDTO,
    category: Categories,
    trx?: Knex.Transaction,
    overwrite?: boolean,
  ): Promise<Knex.QueryBuilder> {
    let tableName = '';
    let obj = {};
    if (category === 'circos') {
      tableName = 'zcc_zd_circos';
      obj = {
        type: (fileMapping as PostCircosFileMappingDTO).type,
      };
    } else if (category === 'mutsig') {
      tableName = 'zcc_zd_mutsig';
      obj = {
        type: (fileMapping as PostMutsigFileMappingDTO).type,
      };
    } else if (category === 'qc') {
      tableName = 'zcc_zd_qc';
      obj = {
        type: (fileMapping as PostQCFileMappingDTO).type,
      };
    } else if (category === 'methylation') {
      tableName = 'zcc_zd_methylation';
      obj = {
        type: (fileMapping as PostMethylationFileMappingDTO).type,
      };
    } else if (category === 'rnaseq') {
      tableName = 'zcc_zd_rna_seq';
      const rnaseqMapping = fileMapping as PostRNASeqFileMappingDTO;
      obj = {
        rnaseq_id: rnaseqMapping.rnaSeqId,
        gene: rnaseqMapping.gene,
      };
    } else if (category === 'rnaseq_classifier') {
      tableName = 'zcc_zd_rna_classifier';
      const rnaClassifierMapping = fileMapping as PostRNASeqClassifierFileMappingDTO;
      obj = {
        rnaseq_id: rnaClassifierMapping.rnaSeqId,
        classifier: rnaClassifierMapping.classifier,
      };
    } else if (category === 'meth_gene') {
      tableName = 'zcc_zd_methylation_genes';
      const methGeneMapping = fileMapping as PostMethGeneFileMappingDTO;
      obj = {
        meth_sample_id: methGeneMapping.methSampleId,
        gene: methGeneMapping.gene,
      };
    } else if (category === 'linx') {
      tableName = 'zcc_zd_linx';
      const linxMapping = fileMapping as PostLinxFileMappingDTO;
      obj = {
        chr: linxMapping.chr,
        cluster_id: linxMapping.clusterId,
        genes: linxMapping.genes,
      };
    } else if (category === 'hts') {
      tableName = 'zcc_zd_hts';
      const htsMapping = fileMapping as PostHTSFileMappingDTO;
      obj = {
        hts_id: htsMapping.htsId,
        type: htsMapping.type,
        drug_id: htsMapping.drugId,
      };
    } else if (category === 'bam') {
      tableName = 'zcc_zd_bam';
      const bamMapping = fileMapping as PostBAMFileMappingDTO;
      obj = {
        method: bamMapping.bamMethod,
        assembly: bamMapping.assembly,
      };
    } else if (category === 'report') {
      tableName = 'zcc_zd_reports';
      const reportMapping = fileMapping as PostReportFileMappingDTO;
      obj = {
        version: reportMapping.version,
        report_type: reportMapping.type,
      };
    } else if (category === 'tsv') {
      tableName = 'zcc_zd_tsv';
      const tsvMapping = fileMapping as PostTSVFileMappingDTO;
      obj = {
        type: tsvMapping.type,
        variant_type: tsvMapping.variantType,
      };
    } else if (category === 'fusion') {
      tableName = 'zcc_zd_fusion';
      const fusionFileMapping = fileMapping as PostFusionFileMappingDTO;
      obj = {
        rnaseq_id: fusionFileMapping.rnaSeqId,
        start_gene: fusionFileMapping.startGene,
        end_gene: fusionFileMapping.endGene,
        chr_bkpt1: fusionFileMapping.chrBkpt1,
        chr_bkpt2: fusionFileMapping.chrBkpt2,
        pos_bkpt1: fusionFileMapping.posBkpt1,
        pos_bkpt2: fusionFileMapping.posBkpt2,
      };
    }

    const query = this.knex(tableName)
      .insert({
        ...obj,
        file_id: fileMapping.fileId,
      });
    if (overwrite) {
      query
        .onConflict()
        .ignore();
    }
    if (trx) {
      return query.transacting(trx);
    }
    return query;
  }

  private async checkCategoryFields(
    file: PostDataFileDTO,
    fileId: string,
  ): Promise<PostDataFileMappingDTO> {
    let schema: ClassConstructor<PostDataFileMappingDTO> = null;
    if (file.category === 'circos') {
      schema = PostCircosFileMappingDTO;
    } else if (file.category === 'mutsig') {
      schema = PostMutsigFileMappingDTO;
    } else if (file.category === 'qc') {
      schema = PostQCFileMappingDTO;
    } else if (file.category === 'methylation') {
      schema = PostMethylationFileMappingDTO;
    } else if (file.category === 'rnaseq') {
      schema = PostRNASeqFileMappingDTO;
    } else if (file.category === 'rnaseq_classifier') {
      schema = PostRNASeqClassifierFileMappingDTO;
    } else if (file.category === 'meth_gene') {
      schema = PostMethGeneFileMappingDTO;
    } else if (file.category === 'linx') {
      schema = PostLinxFileMappingDTO;
    } else if (file.category === 'hts') {
      schema = PostHTSFileMappingDTO;
    } else if (file.category === 'bam') {
      schema = PostBAMFileMappingDTO;
    } else if (file.category === 'report') {
      schema = PostReportFileMappingDTO;
    } else if (file.category === 'tsv') {
      schema = PostTSVFileMappingDTO;
    } else if (file.category === 'fusion') {
      schema = PostFusionFileMappingDTO;
    }
    const fileClass = plainToClass<PostDataFileMappingDTO, unknown>(schema, {
      ...file,
      fileId,
    });
    const errors = await validate(fileClass);

    // Only allow linx plots if either cluster ID or chromosome are provided.
    if (file.category === 'linx' && errors.length === 0) {
      return this.validateLinxFile(fileClass as PostLinxFileMappingDTO);
    }

    return errors.length === 0 ? fileClass : null;
  }

  public validateLinxFile(
    fileMapping: PostLinxFileMappingDTO,
  ): PostLinxFileMappingDTO {
    if (
      !(fileMapping).clusterId
      && !(fileMapping).chr
    ) {
      return null;
    }
    return fileMapping;
  }

  public async deleteFiles(
    deleteDataFilesBody: DeleteDataFilesDTO,
  ): Promise<DeleteDataFilesResponse> {
    const filesDeleted = [];
    const filesRejected = [];
    // find all the files that exist
    const files: string[] = await this.knex
      .select('file_id')
      .from('datafiles')
      .whereIn('file_id', deleteDataFilesBody.fileIds)
      .pluck('file_id');

    for (const file of files) {
      const fileDeleted = await this.deleteFile(file);
      if (fileDeleted.deleted) {
        filesDeleted.push(file);
      } else {
        filesRejected.push({
          fileId: file,
          reason: fileDeleted.reason,
        });
      }
    }

    return {
      filesDeleted,
      filesRejected: filesRejected
        .concat(deleteDataFilesBody.fileIds.filter((id) => !files.includes(id)))
        .map((id) => ({
          fileId: id,
          reason: 'File not found in database',
        })),
    };
  }

  public async deleteFile(
    fileId: string,
  ): Promise<{ deleted: boolean; reason: string }> {
    const result = {
      deleted: false,
      reason: '',
    };
    await this.knex
      .transaction(async (trx) => {
        const tables = [
          'zcc_zd_circos',
          'zcc_zd_mutsig',
          'zcc_zd_qc',
          'zcc_zd_methylation',
          'zcc_zd_rna_seq',
          'zcc_zd_rna_classifier',
          'zcc_zd_methylation_genes',
          'zcc_zd_linx',
          'zcc_zd_hts',
          'zcc_zd_bam',
          'zcc_zd_reports',
          'zcc_zd_tsv',
          'zcc_zd_fusion',
          'secondary_files',
          'collections',
          'netapp',
          'dnanexus',
          'ncimdss',
          'datafiles',
        ];

        for (const table of tables) {
          await this.deleteFileFromTableQuery(fileId, table, trx);
        }
      })
      .then(() => {
        result.deleted = true;
      })
      .catch((err) => {
        console.error(err);
        result.reason = 'Error deleting file from database';
      });

    return result;
  }

  private async deleteFileFromTableQuery(
    fileId: string,
    table: string,
    trx?: Knex.Transaction,
  ): Promise<Knex.QueryBuilder> {
    const query = this.knex(table)
      .where(function customWhereBuilder() {
        if (table === 'secondary_files') {
          this.where('secondary_file_id', fileId).orWhere(
            'primary_file_id',
            fileId,
          );
        } else if (table === 'collections') {
          this.where('collection_file_id', fileId).orWhere('file_id', fileId);
        } else {
          this.where('file_id', fileId);
        }
      })
      .del();

    if (trx) {
      return query.transacting(trx);
    }
    return query;
  }
}
