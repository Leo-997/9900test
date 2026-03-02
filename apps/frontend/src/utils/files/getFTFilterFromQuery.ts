import { IFileTrackerSearchOptions } from '@/types/Search.types';
import {
  isFileType, isPlatform, isReferenceGenome, isSampleType,
} from './typeChecks';

export function getFTFilterFromQuery(search: URLSearchParams): IFileTrackerSearchOptions {
  const toggled: IFileTrackerSearchOptions = {
    searchId: [],
    fileType: [],
    sampleType: [],
    refGenome: [],
    platform: [],
    sortColumns: [],
    sortDirections: [],
    fileSize: {
      min: 0, max: Infinity, defaults: [0, Infinity], unit: 'MB',
    },
  };
  search.forEach((value, key) => {
    if (key === 'searchId') {
      toggled.searchId = value.split(';');
    } else if (key === 'fileType') {
      const types = value.split(',');
      toggled.fileType = types.filter((type) => isFileType(type));
    } else if (key === 'sampleType') {
      const types = value.split(',');
      toggled.sampleType = types.filter((type) => isSampleType(type));
    } else if (key === 'refGenome') {
      const types = value.split(',');
      toggled.refGenome = types.filter((type) => isReferenceGenome(type));
    } else if (key === 'platform') {
      const types = value.split(',');
      toggled.platform = types.filter((type) => isPlatform(type));
    } else if (key === 'minFileSize') {
      toggled.fileSize = {
        ...toggled.fileSize,
        min: parseInt(value, 10), // convert to MB
      };
    } else if (key === 'maxFileSize') {
      toggled.fileSize = {
        ...toggled.fileSize,
        max: parseInt(value, 10), // convert to MB
      };
    }
  });

  return toggled;
}
