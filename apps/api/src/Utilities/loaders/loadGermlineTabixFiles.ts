/**
 * ZDV2-920: Deprecated file as it is using the old aws SDK.
 * If this script is needed, the SDK needs to be updated
 */
// /* eslint-disable no-console */
// import { knex, Knex } from 'knex';
// import { ConfigService } from '@nestjs/config';
// import { S3 } from 'aws-sdk';
// import { v4 as uuidv4 } from 'uuid';
// import {
//   FileTypes, INetappFile, ReferenceGenomeTypes, SampleTypes,
// } from 'Models/FileTracker/FileTracker.model';
// import {
//   knexConnectionConfig as zdConfig,
//   knexConnectionConfigFileTracker as ftConfig,
// } from '../../../knexfile';
// import { S3Service } from '../../Modules/S3/S3.service';
// import configuration from '../../Config/configuration';



// interface IBiosample {
//   sampleId: string;
//   publicSampleId: string;
//   patientId: string;
//   publicPatientId: string;
//   biosampleType: 'wgs'
//     | 'rnaseq'
//     | 'panel'
//     | 'methylation'
//     | 'hts'
//     | 'pdx';
//   biosampleStatus: SampleTypes;
// }

// const zdKnex = knex(zdConfig);
// const ftKnex = knex(ftConfig);
// const config = configuration();
// config.aws.bucket = 'ccicbwgsresults';

// const { refGenome } = config.constants;

// const s3 = new S3Service(new S3(config.aws), new ConfigService(config));
// const accountInfo = {
//   ID: '14378533873317339022',
//   // eslint-disable-next-line @typescript-eslint/naming-convention
//   DisplayName: 'CompBio',
// };

// async function createNetappFile(
//   trx: Knex.Transaction,
//   file: INetappFile,
// ): Promise<void | number[]> {
//   await trx('datafiles')
//     .insert({
//       file_id: file.fileId,
//       patient_id: file.patientId,
//       sample_id: file.sampleId,
//       public_sample_id: file.publicSampleId,
//       public_patient_id: file.publicPatientId,
//       flowcell_id: file.flowcellId,
//       lane: file.lane,
//       ref_genome: file.refGenome,
//       sample_type: file.sampleType,
//       filename: file.fileName,
//       filetype: file.fileType,
//       md5: file.md5,
//       filesize: file.fileSize,
//       platform: file.platform,
//       updated_at: file.updatedAt,
//     });
//   await trx('netapp')
//     .insert({
//       file_id: file.fileId,
//       key: file.key,
//       bucket: file.bucket,
//       account_id: accountInfo.ID,
//       accountname: accountInfo.DisplayName,
//       etag: file.etag,
//     });
// }

// async function createFileFromObj(
//   trx: Knex.Transaction,
//   sample: IBiosample,
//   s3Object: S3.Object,
//   filename: string,
//   key: string,
//   customParams?: {
//     bucket?: string,
//     fileType?: FileTypes,
//     sampleType?: SampleTypes,
//     genome?: ReferenceGenomeTypes,
//   },
// ): Promise<string> {
//   const fileId = uuidv4();
//   await createNetappFile(
//     trx,
//     {
//       fileId,
//       patientId: sample.patientId,
//       sampleId: sample.sampleId,
//       publicSampleId: sample.publicSampleId,
//       publicPatientId: sample.publicPatientId,
//       refGenome: customParams && customParams.genome ? customParams.genome : refGenome,
//       sampleType: customParams && customParams.sampleType ? customParams.sampleType : 'tumour',
//       fileName: filename,
//       fileType: customParams && customParams.fileType ? customParams.fileType : 'png',
//       md5: null,
//       fileSize: s3Object.Size,
//       platform: 'netapp',
//       isHidden: false,
//       updatedAt: s3Object.LastModified,
//       key,
//       bucket: customParams && customParams.bucket ? customParams.bucket : config.aws.bucket,
//       etag: s3Object.ETag.replace(/"/g, ''),
//       accountId: '',
//       accountName: '',
//     },
//   );
//   return fileId;
// }

// async function insertGeneric(
//   trx: Knex.Transaction,
//   tableName: string,
//   data: any,
// ): Promise<void | number[]> {
//   return trx(tableName)
//     .insert(data);
// }

// async function loadTabixFile(
//   file: S3.Object,
//   sample: IBiosample,
//   index: boolean,
// ): Promise<void> {
//   const trx = await ftKnex.transaction();
//   const name = file.Key.split('/').pop();
//   const type = index ? 'tbi' : 'gzip';
//   try {
//     const fileId = await createFileFromObj(
//       trx,
//       sample,
//       file,
//       name,
//       file.Key,
//       { fileType: type },
//     );
//     await insertGeneric(
//       trx,
//       'zcc_zd_tsv',
//       {
//         file_id: fileId,
//         variant_type: 'GERMLINE_SNV',
//         type: index ? 'index' : 'main',
//       },
//     );
//     trx.commit();
//   } catch (error) {
//     console.log(`Error: ${error.sqlMessage}`);
//     trx.rollback();
//   }
// }

// async function getTabixFiles(prefix: string, sample: IBiosample): Promise<void> {
//   const files = (await s3.listObjects(prefix)).sort(
//     (a, b) => b.Key.localeCompare(a.Key),
//   );
//   const mainFile = files.find((f) => f.Key.endsWith('complete.tsv.gz'));
//   if (mainFile) {
//     const indexFile = files.find((f) => f.Key === `${mainFile.Key}.tbi`);
//     if (indexFile) {
//       await loadTabixFile(mainFile, sample, false);
//       await loadTabixFile(indexFile, sample, true);
//     }
//   }
// }

// async function getSamples(): Promise<IBiosample[]> {
//   return zdKnex({ biosample: 'zcc_biosample' })
//     .select({
//       sampleId: 'biosample.biosample_id',
//       publicSampleId: 'biosample.zcc_sample_id',
//       patientId: 'patient.patient_id',
//       publicPatientId: 'patient.zcc_subject_id',
//       biosampleType: 'biosample.sample_type',
//       biosampleStatus: 'biosample.biosample_status',
//     })
//     .innerJoin(
//       { patient: 'zcc_patient' },
//       'patient.patient_id',
//       'biosample.patient_id',
//     )
//     .where('biosample_status', 'normal');
// }

// async function loadFiles(): Promise<void> {
//   const samples = await getSamples();
//   const promises: Promise<void>[] = [];
//   for (const sample of samples) {
//     const prefix = `wgs/${sample.sampleId}/${refGenome}/vcf2tsv`;
//     promises.push((async (): Promise<void> => {
//       console.log(`Loading ${sample.sampleId}...`);
//       return getTabixFiles(prefix, sample);
//     })());
//   }
//   await Promise.all(promises);
//   process.exit(0);
// }

// loadFiles();
