import { AxiosInstance } from 'axios';
import {
  IDownloadURL,
  FileType,
  IDataFile,
  ISignatureFile,
  Platform,
  ReferenceGenome,
  IUploadNetappFileBody,
} from '../../../../types/FileTracker/FileTracker.types';
import { SampleType } from '../../../../types/Samples/Sample.types';
import { IFileTrackerSearchOptions } from '../../../../types/Search.types';

interface IFileTrackerFilters {
  search?: string[];
  fileType?: FileType[];
  sampleType?: SampleType[];
  refGenome?: ReferenceGenome[];
  platform?: Platform[];
  fileSize?: number[];
  sortColumns?: string[];
  sortDirections?: string[];
}

export interface IFileTrackerClient {
  getAllFiles(
    filters?: IFileTrackerFilters,
    page?: number,
    limit?: number
  ): Promise<IDataFile[]>;
  getAllFilesCount(
    filters?: IFileTrackerFilters,
  ): Promise<number>;
  generateDownloadURLs(
    files: string[],
  ): Promise<IDownloadURL[]>;
  getFile(
    fileId: string
  ): Promise<IDataFile>;
  getSecondaryFiles(
    fileId: string,
    filters?: IFileTrackerFilters,
    page?: number,
    limit?: number
  ): Promise<IDataFile[]>;
  getCollectionFiles(
    fileId: string,
    filters?: IFileTrackerFilters,
    page?: number,
    limit?: number
  ): Promise<IDataFile[]>;
  getUserSignatures(
    userIds: string[]
  ): Promise<ISignatureFile[]>;
  downloadSignatureFile(fileId: string): Promise<Blob>;
  downloadFile(fileId: string): Promise<Blob>;
  mapFileTrackerFilters(
    filters?: IFileTrackerSearchOptions
  ): IFileTrackerFilters;
  uploadFile(
    file: Blob,
    body: IUploadNetappFileBody,
  ): Promise<string>;
}

export function createFileTrackerClient(
  instance: AxiosInstance,
): IFileTrackerClient {
  async function getAllFiles(
    filters: IFileTrackerFilters = {},
    page = 1,
    limit = 10,
  ): Promise<IDataFile[]> {
    const response = await instance.get<IDataFile[]>('/files', {
      params: {
        ...filters,
        page,
        limit,
      },
    });
    return response.data;
  }

  async function getAllFilesCount(
    filters: IFileTrackerFilters = {},
  ): Promise<number> {
    const response = await instance.get<number>('/files/count', {
      params: {
        ...filters,
      },
    });
    return response.data;
  }

  async function generateDownloadURLs(
    files: string[],
  ): Promise<IDownloadURL[]> {
    const response = await instance.get<IDownloadURL[]>('/files/generate', {
      params: {
        files,
      },
    });
    return response.data;
  }

  async function getFile(
    fileId: string,
  ): Promise<IDataFile> {
    const response = await instance.get<IDataFile>(`/files/${fileId}`);
    return response.data;
  }

  async function getSecondaryFiles(
    fileId: string,
    filters: IFileTrackerFilters = {},
    page = 1,
    limit = 10,
  ): Promise<IDataFile[]> {
    const response = await instance.get<IDataFile[]>(`/files/${fileId}/secondary`, {
      params: {
        ...filters,
        page,
        limit,
      },
    });
    return response.data;
  }

  async function getCollectionFiles(
    fileId: string,
    filters: IFileTrackerFilters = {},
    page = 1,
    limit = 10,
  ): Promise<IDataFile[]> {
    const response = await instance.get<IDataFile[]>(`/files/${fileId}/collection`, {
      params: {
        ...filters,
        page,
        limit,
      },
    });
    return response.data;
  }

  async function getUserSignatures(
    userIds: string[],
  ): Promise<ISignatureFile[]> {
    const resp = await instance.get<ISignatureFile[]>('/files/user-signatures', {
      params: {
        userIds,
      },
    });
    return resp.data;
  }

  async function downloadSignatureFile(fileId: string): Promise<Blob> {
    const resp = await instance.get<Blob>(
      `/files/user-signatures/${fileId}/download`,
      {
        responseType: 'blob',
      },
    );
    return resp.data;
  }

  async function downloadFile(fileId: string): Promise<Blob> {
    const resp = await instance.get<Blob>(
      `/files/${fileId}/download`,
      {
        responseType: 'blob',
      },
    );
    return resp.data;
  }

  function mapFileTrackerFilters(
    filters: IFileTrackerSearchOptions,
  ): IFileTrackerFilters {
    const {
      searchId,
      fileType,
      sampleType,
      refGenome,
      platform,
      fileSize,
      sortColumns,
      sortDirections,
    } = filters;

    const mappedFilters: IFileTrackerFilters = {};
    if (searchId.length > 0) mappedFilters.search = searchId;
    if (fileType.length > 0) mappedFilters.fileType = fileType;
    if (sampleType.length > 0) mappedFilters.sampleType = sampleType;
    if (refGenome.length > 0) mappedFilters.refGenome = refGenome;
    if (platform.length > 0) mappedFilters.platform = platform;
    if (fileSize.min > fileSize.defaults[0] || fileSize.max < fileSize.defaults[1]) {
      mappedFilters.fileSize = [fileSize.min, fileSize.max];
    }
    if (sortColumns && sortColumns.length > 0) {
      mappedFilters.sortColumns = sortColumns;
      mappedFilters.sortDirections = sortDirections;
    }

    return mappedFilters;
  }

  async function uploadFile(
    file: Blob,
    body: IUploadNetappFileBody,
  ): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    for (const key of Object.keys(body)) {
      formData.append(key, body[key]);
    }
    const resp = await instance.post<string>(
      '/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return resp.data;
  }

  return {
    getAllFiles,
    getAllFilesCount,
    generateDownloadURLs,
    getFile,
    getSecondaryFiles,
    getCollectionFiles,
    getUserSignatures,
    downloadSignatureFile,
    downloadFile,
    mapFileTrackerFilters,
    uploadFile,
  };
}
