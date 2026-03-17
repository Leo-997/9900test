import { ReferenceGenomeTypes } from 'Models/FileTracker/FileTracker.model';

export interface IDatabaseConnectionConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
}
export interface IDatabaseConfig {
  connection: IDatabaseConnectionConfig;
}

export interface IAWSConfig {
  accessKeyId: string;
  accessKeySecret: string;
  endpoint: string;
  region: string;
  bucket: string;
}

export interface IDNANexusConfig {
  token: string;
}
export interface IConstants {
  refGenome: ReferenceGenomeTypes;
  rsemVer: string;
  prefix: string;
  purpleVer: string;
  deconstructsigsVer: string;
  cnvlinearplotVer: string;
  qcVer: string;
}

export interface IURLConfig {
  linx: string;
  rna: string;
}

export interface ISecrets {
  dnaNexus: string;
  cavatica: string;
  storageAccountName: string;
  storageAccountUrl: string;
  storageAccountKey: string;
  storageQueue: string;
  htsStorageQueue: string;
}

export interface IZeroDashConfig {
  baseUrl: string;
  baseAPIUrl: string;
}

export interface ISlackConfig {
  zero2Token: string;
  prismToken: string;
}

export interface IConfig {
  database: IDatabaseConfig;
  aws: IAWSConfig;
  dnanexus: IDNANexusConfig;
  constants: IConstants;
  urls: IURLConfig;
  secrets: ISecrets;
  zeroDash: IZeroDashConfig;
  slack: ISlackConfig;
}

export function normalizeString<T extends string>(str: T): string | undefined {
  if (str === undefined) {
    return undefined;
  }
  const newStr = str.trim();

  return newStr;
}

export default (): IConfig => ({
  database: {
    connection: {
      host: normalizeString(process.env.DB_HOST),
      port: process.env.DB_PORT,
      user: normalizeString(process.env.DB_USER),
      password: normalizeString(process.env.DB_PASSWORD),
      database: normalizeString(process.env.DB_NAME_API),
    },
  },
  aws: {
    accessKeyId: normalizeString(process.env.AWS_ACCESS_KEY_ID),
    accessKeySecret: normalizeString(process.env.AWS_SECRET_ACCESS_KEY),
    endpoint: normalizeString(process.env.AWS_ENDPOINT),
    region: normalizeString(process.env.AWS_REGION),
    bucket: normalizeString(process.env.AWS_BUCKET),
  },
  dnanexus: {
    token: normalizeString(process.env.DNANEXUS_TOKEN),
  },
  constants: {
    refGenome: 'hs38',
    prefix: 'wgs',
    rsemVer: 'v1.3.3',
    purpleVer: 'v3_4',
    deconstructsigsVer: 'v1_8_0',
    cnvlinearplotVer: 'v1_0',
    qcVer: '1_10_1',
  },
  urls: {
    linx: normalizeString(process.env.VITE_LINX_URL),
    rna: normalizeString(process.env.VITE_RNA_PLOTS_URL),
  },
  secrets: {
    dnaNexus: normalizeString(process.env.DNANEXUS_TOKEN),
    cavatica: normalizeString(process.env.CAVATICA_TOKEN),
    storageAccountName: normalizeString(process.env.STORAGE_ACCOUNT_NAME),
    storageAccountUrl: normalizeString(process.env.STORAGE_ACCOUNT_URL),
    storageAccountKey: normalizeString(process.env.STORAGE_ACCOUNT_KEY),
    storageQueue: normalizeString(process.env.STORAGE_EXPORT_QUEUE),
    htsStorageQueue: normalizeString(process.env.HTS_STORAGE_EXPORT_QUEUE),
  },
  zeroDash: {
    baseUrl: normalizeString(process.env.ZERO_DASH_URL),
    baseAPIUrl: normalizeString(process.env.VITE_API_URL),
  },
  slack: {
    prismToken: normalizeString(process.env.PRISM_SLACK_BOT_TOKEN),
    zero2Token: normalizeString(process.env.ZERO2_SLACK_BOT_TOKEN),
  },
});
