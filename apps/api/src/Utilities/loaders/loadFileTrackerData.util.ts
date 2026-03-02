/**
 * ZDV2-920: Deprecated file as it is using the old aws SDK.
 * If this script is needed, the SDK needs to be updated
 */
// /* eslint-disable no-await-in-loop */
// /* eslint-disable no-console */
// import { knex } from 'knex';
// import { ConfigService } from '@nestjs/config';
// import { S3 } from 'aws-sdk';
// import {
//   FileTypes, INetappFile, ReferenceGenomeTypes, SampleTypes,
// } from 'Models/FileTracker/FileTracker.model';
// import { v4 as uuidv4 } from 'uuid';
// import { ObjectList } from 'aws-sdk/clients/s3';
// import configuration, { normalizeString } from '../../Config/configuration';
// import { S3Service } from '../../Modules/S3/S3.service';
// import {
//   knexConnectionConfig as zdConfig,
//   knexConnectionConfigFileTracker as ftConfig,
// } from '../../../knexfile';

// const md5 = require('md5');

// type SampleObject = {
//   sampleId: string;
//   publicSampleId: string;
//   patientId: string;
//   publicPatientId: string;
//   matchedNormalId: string;
//   rnaSeqId: string;
//   methSampleId: string;
//   methId: string;
//   htsId: string;
// };

// const zdKnex = knex(zdConfig);
// const ftKnex = knex(ftConfig);
// const config = configuration();

// const { prefix } = config.constants;
// const { refGenome } = config.constants;
// const { purpleVer } = config.constants;
// const { cnvlinearplotVer } = config.constants;
// const { deconstructsigsVer } = config.constants;
// const { rsemVer } = config.constants;
// const { qcVer } = config.constants;

// config.aws.bucket = 'ccicbwgsresults';
// const s3 = new S3Service(new S3(config.aws), new ConfigService(config));
// const accountInfo = {
//   id: '14378533873317339022',
//   displayName: 'CompBio',
// };

// async function createNetappFile(file: INetappFile): Promise<void> {
//   return ftKnex
//     .transaction(async (tsx) => {
//       await ftKnex('datafiles').transacting(tsx).insert({
//         file_id: file.fileId,
//         patient_id: file.patientId,
//         sample_id: file.sampleId,
//         public_sample_id: file.publicSampleId,
//         public_patient_id: file.publicPatientId,
//         flowcell_id: file.flowcellId,
//         lane: file.lane,
//         ref_genome: file.refGenome,
//         sample_type: file.sampleType,
//         filename: file.fileName,
//         filetype: file.fileType,
//         md5: file.md5,
//         filesize: file.fileSize,
//         platform: file.platform,
//         updated_at: file.updatedAt,
//       });
//       await ftKnex('netapp').transacting(tsx).insert({
//         file_id: file.fileId,
//         key: file.key,
//         bucket: file.bucket,
//         account_id: accountInfo.id,
//         accountname: accountInfo.displayName,
//         etag: file.etag,
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// }

// function isGetObjectOutput(
//   value: S3.GetObjectOutput | S3.HeadObjectOutput,
// ): value is S3.GetObjectOutput {
//   return Object.keys(value).includes('Body');
// }

// async function createFileFromObj(
//   sample: Omit<SampleObject, 'rnaSeqId' | 'methSampleId' | 'methId' | 'htsId'>,
//   s3Object: S3.GetObjectOutput | S3.HeadObjectOutput,
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
//   await createNetappFile({
//     fileId,
//     patientId: sample.patientId,
//     sampleId:
//       customParams.sampleType === 'normal'
//         ? sample.matchedNormalId
//         : sample.sampleId,
//     publicSampleId:
//       customParams.sampleType === 'normal'
//         ? `${sample.publicSampleId}N`
//         : sample.publicSampleId,
//     publicPatientId: sample.publicPatientId,
//     refGenome:
//       customParams && customParams.genome ? customParams.genome : refGenome,
//     sampleType:
//       customParams && customParams.sampleType
//         ? customParams.sampleType
//         : 'tumour',
//     fileName: filename,
//     fileType:
//       customParams && customParams.fileType ? customParams.fileType : 'png',
//     md5: isGetObjectOutput(s3Object) ? md5(s3Object.Body) : null,
//     fileSize: s3Object.ContentLength,
//     platform: 'netapp',
//     isHidden: false,
//     updatedAt: s3Object.LastModified,
//     key,
//     bucket:
//       customParams && customParams.bucket
//         ? customParams.bucket
//         : config.aws.bucket,
//     etag: s3Object.ETag.replace(/"/g, ''),
//     accountId: '',
//     accountName: '',
//   });
//   return fileId;
// }

// async function insertGeneric(
//   tableName: string,
//   data: any,
// ): Promise<void | number[]> {
//   return ftKnex(tableName)
//     .insert(data)
//     .catch((err) => {
//       console.log(err);
//     });
// }

// async function getHTSCulturePlots(sample: SampleObject): Promise<void> {
//   console.log('\tFetching HTS culture plots..');
//   const htsPrefix = `hts/${sample.htsId}/plot/${sample.htsId}`;
//   const htsFiles = await s3.listObjects(htsPrefix, undefined);
//   console.log(`\t\tFound ${htsFiles.length} files`);
//   for (const file of htsFiles) {
//     const key = file.Key;
//     console.log(`\t\t\t${key}`);
//     const fileName = key.split('/').pop();
//     const fileType = fileName.split('.').pop();
//     const rawType = fileName.split('.')[0].split('_').pop().toLowerCase();
//     if (rawType === 'cellsstart' || rawType === 'cellsend') {
//       const type = rawType === 'cellsstart' ? 'CELLS_START' : 'CELLS_END';
//       const fileData = await s3.getObject(key);
//       const fileId = await createFileFromObj(sample, fileData, fileName, key, {
//         fileType: fileType as FileTypes,
//       });
//       await insertGeneric('zcc_zd_hts', {
//         hts_id: sample.htsId,
//         file_id: fileId,
//         type,
//       });
//     }
//   }
// }

// async function getHTSDrugHitsPlots(sample: SampleObject): Promise<void> {
//   console.log('\tFetching HTS Drug Hits plots..');
//   const htsPrefix = `hts/${sample.htsId}/plot/`;
//   const htsFiles = await s3.listObjects(htsPrefix, undefined);
//   for (const file of htsFiles) {
//     const key = file.Key;
//     const fileName = key.split('/').pop();
//     if (
//       fileName.split('_')[0] !== sample.htsId
//       && fileName.includes('personalised')
//     ) {
//       const fileType = fileName.split('.').pop();
//       const type = fileName.split('.')[0].split('_')[2];
//       const drugId = fileName.split('.')[0].split('_')[0];
//       if (type && drugId) {
//         const fileData = await s3.getObject(key);
//         const fileId = await createFileFromObj(
//           sample,
//           fileData,
//           fileName,
//           key,
//           {
//             fileType: fileType as FileTypes,
//           },
//         );
//         await insertGeneric('zcc_zd_hts', {
//           hts_id: sample.htsId,
//           drug_id: drugId,
//           file_id: fileId,
//           type,
//         });
//       }
//     }
//   }
// }

// // BAM, BAI and TDF Files
// async function getBAMBAITDFFiles(sample: SampleObject): Promise<void> {
//   console.log('\tFetching bam/bai/tdf files..');
//   const items = [
//     {
//       type: 'tumour',
//       id: sample.sampleId,
//       methods: ['wgs', 'rna'],
//     },
//     {
//       type: 'normal',
//       id: sample.matchedNormalId,
//       methods: ['wgs'],
//     },
//   ];

//   for (const item of items) {
//     for (const method of item.methods) {
//       if ((method === 'rna' && sample.rnaSeqId) || method === 'wgs') {
//         const key = method === 'wgs'
//           ? `bam/${item.id}/${item.id}`
//           : `bam/rna/${sample.rnaSeqId}/${sample.rnaSeqId}`;
//         const objList = await s3.listObjects(key, undefined, 'ccicbarchive');

//         // Upload all bams/bais
//         for (const obj of objList.filter((o) => o.Key.endsWith('.bam'))) {
//           const bamObj = await s3.getObjectHead(obj.Key, 'ccicbarchive');
//           const baiObj = await s3.getObjectHead(
//             `${obj.Key}.bai`,
//             'ccicbarchive',
//           );
//           const tdfObj = method === 'wgs'
//             ? await s3.getObjectHead(`${obj.Key}.tdf`, 'ccicbarchive')
//             : undefined;

//           const fileName = method === 'wgs'
//             ? obj.Key.replace(`bam/${item.id}/`, '')
//             : obj.Key.replace(`bam/rna/${sample.rnaSeqId}/`, '');

//           const genome = fileName.includes('hs37d5') ? 'hs37d5' : 'hs38';

//           // Upload bam
//           if (bamObj) {
//             const bamFileId = await createFileFromObj(
//               sample,
//               bamObj,
//               fileName,
//               obj.Key,
//               {
//                 bucket: 'ccicbarchive',
//                 fileType: 'bam',
//                 sampleType: item.type as SampleTypes,
//                 genome,
//               },
//             );

//             // Add to bam table
//             await insertGeneric('zcc_zd_bam', {
//               file_id: bamFileId,
//               method,
//               assembly: obj.Key.includes('assembly'),
//             });

//             // Upload bai
//             if (baiObj) {
//               const baiFileId = await createFileFromObj(
//                 sample,
//                 baiObj,
//                 `${fileName}.bai`,
//                 `${obj.Key}.bai`,
//                 {
//                   bucket: 'ccicbarchive',
//                   fileType: 'bai',
//                   sampleType: item.type as SampleTypes,
//                   genome,
//                 },
//               );

//               // Add bam/bai relationship
//               await insertGeneric('secondary_files', {
//                 primary_file_id: bamFileId,
//                 secondary_file_id: baiFileId,
//               });
//             }

//             // Upload tdf
//             if (tdfObj) {
//               const tdfFileId = await createFileFromObj(
//                 sample,
//                 tdfObj,
//                 `${fileName}.tdf`,
//                 `${obj.Key}.tdf`,
//                 {
//                   bucket: 'ccicbarchive',
//                   fileType: 'tdf',
//                   sampleType: item.type as SampleTypes,
//                   genome,
//                 },
//               );

//               // Add bam/tdf relationship
//               await insertGeneric('secondary_files', {
//                 primary_file_id: bamFileId,
//                 secondary_file_id: tdfFileId,
//               });
//             }
//           }
//         }
//       }
//     }
//   }
// }

// // RNA Seq Plots
// async function getRNAPlots(
//   sample: SampleObject,
//   rnaPrefix: string,
// ): Promise<void> {
//   if (!sample.rnaSeqId) return;
//   console.log('\tFetching RNASeq plot(s)..');
//   const rnaSeqObjs: ObjectList = [];
//   let page = null;
//   while (page && page.length >= 1000) {
//     const lastKey = rnaSeqObjs[rnaSeqObjs.length - 1]
//       ? rnaSeqObjs[rnaSeqObjs.length - 1].Key
//       : undefined;
//     page = await s3.listObjects(rnaPrefix, lastKey);
//     rnaSeqObjs.push(...page);
//   }

//   for (const obj of rnaSeqObjs) {
//     if (!obj.Key.includes('RIGProfile') && obj.Key.includes('.png')) {
//       const objData = await s3.getObject(obj.Key);
//       if (objData) {
//         const keyParts = obj.Key.split('/');
//         const filename = keyParts[keyParts.length - 1];
//         const fileId = await createFileFromObj(
//           sample,
//           objData,
//           filename,
//           obj.Key,
//         );
//         await insertGeneric('zcc_zd_rna_seq', {
//           file_id: fileId,
//           rnaseq_id: sample.rnaSeqId,
//           gene: filename.split('-')[0],
//         });
//       }
//     }
//   }
// }

// // LINX Plots
// async function getLinxPlots(sample: SampleObject): Promise<void> {
//   console.log('\tFetching LINX plot(s)..');
//   const zdBucket = 'ccicbzerodash';
//   const linxPrefix = `plot/${sample.sampleId}/linx`;
//   const objs = await s3.listObjects(linxPrefix, undefined, zdBucket);
//   for (const obj of objs) {
//     const key = obj.Key;
//     const filename = key.substring(linxPrefix.length + 1);
//     const objData = await s3.getObject(key, zdBucket);
//     if (objData) {
//       const fileId = await createFileFromObj(sample, objData, filename, key, {
//         bucket: zdBucket,
//       });
//       const keyParts = key.split('/').pop().split('.');
//       keyParts.pop();
//       const toInsert = {
//         file_id: fileId,
//         chr: keyParts[1].startsWith('chr') && keyParts[1].replace('chr', ''),
//         cluster_id: keyParts[1].startsWith('clusters')
//           ? keyParts[1].replace('clusters', '').split('_')
//           : null,
//         genes: keyParts[2].split('_').join(','),
//       };
//       await insertGeneric('zcc_zd_linx', toInsert);
//     }
//   }
// }

// // Circos Plots
// async function getRawCircos(
//   purplePrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching raw circos plot..');
//   const filename = `${sample.sampleId}.input.png`;
//   const key = `${purplePrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tRaw circos plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_circos', {
//     file_id: fileId,
//     type: 'raw_circos',
//   });
// }

// async function getCircos(
//   purplePrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching circos plot..');
//   const filename = `${sample.sampleId}.circos.png`;
//   const key = `${purplePrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tCircos plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_circos', {
//     file_id: fileId,
//     type: 'circos',
//   });
// }

// // Mutsig Plots
// async function getFitLink(
//   mutsigPrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching mutational signatures fit plot..');
//   const filename = `${sample.sampleId}.deconstructsigs.FitProfile_00.png`;
//   const key = `${mutsigPrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tMutational signatures fit plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_mutsig', {
//     file_id: fileId,
//     type: 'fit',
//   });
// }

// async function getMatchingLink(
//   mutsigPrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching COSMIC profile matching plot..');
//   const filename = `${sample.sampleId}.deconstructsigs.ProfileMatching_00.png`;
//   const key = `${mutsigPrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tCOSMIC profile matching plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_mutsig', {
//     file_id: fileId,
//     type: 'matching',
//   });
// }

// async function getMatrixLink(
//   mutsigPrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching tissue matrix plot..');
//   const filename = `${sample.sampleId}.deconstructsigs.ProfileHeatmap_00.png`;
//   const key = `${mutsigPrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tTissue matrix plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_mutsig', {
//     file_id: fileId,
//     type: 'matrix',
//   });
// }

// // QC Tab Plots + Report
// async function getMultiQCReport(
//   qcPrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching multiQC report..');
//   const filename = `${sample.sampleId}_multiqc_report.html`;
//   const key = `${qcPrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tMultiQC report not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key, {
//     fileType: 'html',
//     bucket: 'ccicbwgsresults',
//   });
//   await insertGeneric('zcc_zd_qc', {
//     file_id: fileId,
//     type: 'report',
//   });
// }

// async function getPurpleSomatic(
//   purplePrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching purple somatic variant ploidy plot..');
//   const filename = `${sample.sampleId}.somatic.png`;
//   const key = `${purplePrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tPurple somatic variant ploidy plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_qc', {
//     file_id: fileId,
//     type: 'purple_somatic_variant_ploidy',
//   });
// }

// async function getPurpleCopyNumber(
//   purplePrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching purple copy number plot..');
//   const filename = `${sample.sampleId}.copynumber.png`;
//   const key = `${purplePrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tPurple copy number plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_qc', {
//     file_id: fileId,
//     type: 'purple_copy_number',
//   });
// }

// async function getPurpleMinorAllelePloidy(
//   purplePrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching purple minor allele ploidy plot..');
//   const filename = `${sample.sampleId}.map.png`;
//   const key = `${purplePrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tPurple minor allele plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_qc', {
//     file_id: fileId,
//     type: 'purple_minor_allele_ploidy',
//   });
// }

// async function getPurplePurityRange(
//   purplePrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching purple purity range plot..');
//   const filename = `${sample.sampleId}.purity.range.png`;
//   const key = `${purplePrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tPurple purity range plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_qc', {
//     file_id: fileId,
//     type: 'purple_purity_range',
//   });
// }

// async function getPurpleFittedSegments(
//   purplePrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching purple fitted segments plot..');
//   const filename = `${sample.sampleId}.segment.png`;
//   const key = `${purplePrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tPurple fitted segments plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_qc', {
//     file_id: fileId,
//     type: 'purple_fitted_segment',
//   });
// }

// async function getPurpleKataegisClusters(
//   purplePrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching purple kataegis clusters plot..');
//   const filename = `${sample.sampleId}.somatic.rainfall.png`;
//   const key = `${purplePrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tPurple kataegeis clusters plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_qc', {
//     file_id: fileId,
//     type: 'purple_kataegis_clusters',
//   });
// }

// async function getPurpleClonalityModel(
//   purplePrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching purple clonality model plot..');
//   const filename = `${sample.sampleId}.somatic.clonality.png`;
//   const key = `${purplePrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tPurple clonality model plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_qc', {
//     file_id: fileId,
//     type: 'purple_clonality_model',
//   });
// }

// async function getCNVProfile(
//   cnvlinearplotPrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching copy number profile (WGS) plot..');
//   const filename = `${sample.sampleId}.genome_view.png`;
//   const key = `${cnvlinearplotPrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tCopy number profile (WGS) plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_qc', {
//     file_id: fileId,
//     type: 'cnv_profile',
//   });
//   await insertGeneric('zcc_zd_methylation', {
//     file_id: fileId,
//     type: 'wgs',
//   });
// }

// async function getVAFClonalDist(
//   purplePrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching purple clonal dist plot..');
//   const filename = `${sample.sampleId}_lt0.5_vaf_distribution.png`;
//   const key = `${purplePrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tPurple clonal dist plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_qc', {
//     file_id: fileId,
//     type: 'vaf_clonal_dist',
//   });
// }

// async function getVAFSubclonalDist(
//   purplePrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching purple subclonal dist plot..');
//   const filename = `${sample.sampleId}_gte0.8_vaf_distribution.png`;
//   const key = `${purplePrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tPurple subclonal dist plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_qc', {
//     file_id: fileId,
//     type: 'vaf_subclonal_dist',
//   });
// }

// async function getRIG(sample: SampleObject, rnaPrefix: string): Promise<void> {
//   console.log('\tFetching RIG profile plot..');
//   const filename = `${sample.rnaSeqId}_RIGProfile.png`;
//   const key = `${rnaPrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log('\t\tRIG Profile not found');
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_qc', {
//     file_id: fileId,
//     type: 'rig_profile',
//   });
// }

// async function getCNVEPICProfile(
//   methPrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching copy number profile (EPIC array) plot..');
//   const filename = `${sample.methId}.gene.png`;
//   const key = `${methPrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tCopy number profile (EPIC array) plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_methylation', {
//     file_id: fileId,
//     type: 'epic',
//   });
// }

// async function getMGMT(
//   methPrefix: string,
//   sample: SampleObject,
// ): Promise<void> {
//   console.log('\tFetching MGMT promoter status prediction plot..');
//   const filename = `${sample.methId}_mgmt.png`;
//   const key = `${methPrefix}/${filename}`;
//   const obj = await s3.getObject(key);
//   if (!obj) {
//     console.log(`\t\tMGMT promoter status prediction plot not found (${key})`);
//     return;
//   }

//   const fileId = await createFileFromObj(sample, obj, filename, key);
//   await insertGeneric('zcc_zd_methylation', {
//     file_id: fileId,
//     type: 'mgmt',
//   });
// }

// async function moveResources(): Promise<void> {
//   const bucket = normalizeString(process.env.AWS_BUCKET);
//   console.log(bucket, JSON.stringify(zdConfig));
//   const resources = await zdKnex({ a: 'zcc_sample_resources' })
//     .select({
//       resourceId: 'a.resource_id',
//       resourceName: 'a.resource_name',
//       fileKey: 'a.file_key',
//       sampleId: 'a.sample_id',
//       publicSampleId: 'b.zcc_sample_id',
//       patientId: 'b.patient_id',
//       publicPatientId: 'c.zcc_subject_id',
//       createdAt: 'a.created_at',
//     })
//     .innerJoin({ b: 'zcc_sample' }, 'a.sample_id', 'b.sample_id')
//     .innerJoin({ c: 'zcc_patient' }, 'b.patient_id', 'c.patient_id')
//     .whereNotNull('a.file_key')
//     .whereNot('a.is_deleted', true);
//   console.log(resources);
//   for (const resource of resources) {
//     console.log(resource);
//     const obj = await s3.getObject(`cciaResources/${resource.fileKey}`, bucket);
//     console.log(obj);
//     const keyParts = resource.fileKey.split('.');
//     if (obj) {
//       const fileId = await createFileFromObj(
//         { ...resource, matchedNormalId: '' },
//         obj,
//         `${resource.sampleId}-${resource.resourceName}`,
//         `cciaResources/${resource.fileKey}`,
//         {
//           bucket,
//           fileType: keyParts[keyParts.length - 1],
//         },
//       );
//       await zdKnex('zcc_sample_resources')
//         .update({
//           file_key: fileId,
//         })
//         .where('resource_id', resource.resourceId);
//     }
//   }
// }

// async function loadFileTrackerData(): Promise<void> {
//   const samples = await zdKnex
//     .select<SampleObject[]>({
//       sampleId: 'sample.sample_id',
//       publicSampleId: 'sample.zcc_sample_id',
//       patientId: 'sample.patient_id',
//       publicPatientId: 'patient.zcc_subject_id',
//       matchedNormalId: 'sample.matched_normal_id',
//       rnaSeqId: 'sample.rnaseq_id',
//       methSampleId: 'sample.meth_sample_id',
//       methId: 'sample.meth_id',
//       htsId: 'sample.hts_id',
//     })
//     .from({ sample: 'zcc_sample' })
//     .leftJoin(
//       { patient: 'zcc_patient' },
//       'sample.patient_id',
//       'patient.patient_id',
//     )
//     .innerJoin(
//       { manifest: 'zcc_manifest' },
//       'sample.manifest_id',
//       'manifest.manifest_id',
//     );

//   for (const [index, sample] of samples.entries()) {
//     console.log(
//       `Processing ${index + 1}/${samples.length}: ${sample.sampleId}`,
//     );

//     const purplePrefix = `${prefix}/${sample.sampleId}/${refGenome}/purple/${purpleVer}/plot`;
//     const mutsigPrefix = `${prefix}/${sample.sampleId}/${refGenome}/deconstructsigs/${deconstructsigsVer}/plot`;
//     const cnvlinearplotPrefix = `${prefix}/${sample.sampleId}/${refGenome}/cnvlinearplot/${cnvlinearplotVer}/plot`;
//     const methPrefix = `meth/${sample.methSampleId}/plots`;
//     const rnaPrefix = `rna/${sample.rnaSeqId}/${refGenome}/rsem/${rsemVer}`;
//     const qcPrefix = `qc/${sample.sampleId}/${refGenome}/multiqc/${qcVer}`;

//     await getRawCircos(purplePrefix, sample);
//     await getCircos(purplePrefix, sample);
//     await getFitLink(mutsigPrefix, sample);
//     await getMatchingLink(mutsigPrefix, sample);
//     await getMatrixLink(mutsigPrefix, sample);
//     await getPurpleSomatic(purplePrefix, sample);
//     await getPurpleCopyNumber(purplePrefix, sample);
//     await getPurpleMinorAllelePloidy(purplePrefix, sample);
//     await getPurplePurityRange(purplePrefix, sample);
//     await getPurpleFittedSegments(purplePrefix, sample);
//     await getPurpleKataegisClusters(purplePrefix, sample);
//     await getPurpleClonalityModel(purplePrefix, sample);
//     await getCNVProfile(cnvlinearplotPrefix, sample);
//     await getCNVEPICProfile(methPrefix, sample);
//     await getMGMT(methPrefix, sample);
//     await getVAFClonalDist(purplePrefix, sample);
//     await getVAFSubclonalDist(purplePrefix, sample);
//     await getRIG(sample, rnaPrefix);
//     await getLinxPlots(sample);
//     await getRNAPlots(sample, rnaPrefix);

//     await getHTSCulturePlots(sample);
//     await getHTSDrugHitsPlots(sample);

//     await getBAMBAITDFFiles(sample);
//     await getMultiQCReport(qcPrefix, sample);
//     console.log('----------------------------------------\n');
//   }
//   console.log('Moving resources...');
//   await moveResources();

//   process.exit(0);
// }

// loadFileTrackerData();
