import { fileTypes, platforms, referenceGenomes, sampleTypes } from "../../constants/options";
import { FileType, ReferenceGenome, Platform } from "../../types/FileTracker/FileTracker.types";
import { SampleType } from "../../types/Samples/Sample.types";

export function isFileType(type: string): type is FileType {
  return fileTypes.includes(type as FileType);
}

export function isSampleType(type: string): type is SampleType {
  return sampleTypes.includes(type as SampleType);
}

export function isReferenceGenome(type: string): type is ReferenceGenome {
  return referenceGenomes.includes(type as ReferenceGenome);
}

export function isPlatform(platform: string): platform is Platform {
  return platforms.includes(platform as Platform);
}