/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import {
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import * as commander from 'commander';
import { readFileSync } from 'fs';
import knex, { Knex } from 'knex';
import { Readable } from 'stream';

const database = 'zccclinical';

const prodDbConfig: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: process.env.PROD_DB_HOST,
    password: process.env.PROD_DB_PASSWORD,
    port: parseInt(process.env.PROD_DB_PORT || '3306', 10),
    user: process.env.PROD_DB_USERNAME,
    database,
    ssl: {
      ca: readFileSync(process.env.PROD_DB_SSL_CA || ''),
    },
  },
};

const updateDbConfig: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME,
    database,
    ssl: {
      ca: readFileSync(process.env.DB_SSL_CA || ''),
    },
  },
};

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const prodS3Client = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.PROD_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.PROD_AWS_SECRET_ACCESS_KEY,
  },
});

const prodDb = knex(prodDbConfig);
const updateDb = knex(updateDbConfig);

interface IGetAllFromTableOptions {
  idColumn?: string;
  ids?: string[];
  page?: number;
  limit?: number;
}

interface ITableToLoad {
  tableName: string;
  idColumn?: string;
  foreignIdColumn?: string;
  fileIdColumn?: string;
  loadBefore?: ITableToLoad[];
  loadAfter?: ITableToLoad[];
}

const tablesByClinicalVersion: ITableToLoad[] = [
  { tableName: 'zcc_clinical_addendum' },
  {
    tableName: 'zcc_clinical_comment_thread',
    loadAfter: [
      {
        tableName: 'zcc_clinical_comment_thread_xref',
        idColumn: 'thread_id',
        foreignIdColumn: 'id',
        loadBefore: [
          {
            tableName: 'zcc_clinical_comment',
            idColumn: 'id',
            foreignIdColumn: 'comment_id',
            loadAfter: [
              {
                tableName: 'zcc_clinical_comment_version',
                idColumn: 'comment_id',
                foreignIdColumn: 'id',
              },
            ],
          },
        ],
      },
    ],
  },
  { tableName: 'zcc_clinical_evidence' },
  { tableName: 'zcc_clinical_hts_drug_combinations' },
  { tableName: 'zcc_clinical_hts_drugs' },
  {
    tableName: 'zcc_clinical_meeting_version_xref',
    loadBefore: [
      {
        tableName: 'zcc_clinical_meetings',
        idColumn: 'id',
        foreignIdColumn: 'meeting_id',
      },
    ],
  },
  {
    tableName: 'zcc_clinical_mol_alterations',
    loadAfter: [
      {
        tableName: 'zcc_clinical_mol_alterations_group',
        idColumn: 'mol_alteration_id',
        foreignIdColumn: 'id',
      },
    ],
  },
  { tableName: 'zcc_clinical_interpretation_comment' },
  {
    tableName: 'zcc_clinical_recommendations',
    loadBefore: [
      {
        tableName: 'zcc_clinical_diagnosis_recommendations',
        idColumn: 'id',
        foreignIdColumn: 'clinical_diagnosis_recommendation_id',
      },
      {
        tableName: 'zcc_clinical_therapies',
        idColumn: 'id',
        foreignIdColumn: 'therapy_id',
        loadAfter: [
          {
            tableName: 'zcc_clinical_therapy_drugs',
            idColumn: 'therapy_id',
            foreignIdColumn: 'id',
          },
          {
            tableName: 'zcc_clinical_trials',
            idColumn: 'therapy_id',
            foreignIdColumn: 'id',
          },
        ],
      },
    ],
    loadAfter: [
      {
        tableName: 'zcc_clinical_discussion_recommendation_xref',
        idColumn: 'parent_recommendation_id',
        foreignIdColumn: 'id',
      },
      {
        tableName: 'zcc_clinical_discussion_recommendation_xref',
        idColumn: 'child_recommendation_id',
        foreignIdColumn: 'id',
      },
      {
        tableName: 'zcc_clinical_germline_recommendations',
        idColumn: 'id',
        foreignIdColumn: 'id',
      },
    ],
  },
  { tableName: 'zcc_clinical_recommendations_entity_xref' },
  { tableName: 'zcc_clinical_report_drugs' },
  { tableName: 'zcc_clinical_reviewer' },
  { tableName: 'zcc_clinical_slide_table_settings' },
  {
    tableName: 'zcc_clinical_slides',
    loadAfter: [
      {
        tableName: 'zcc_clinical_slide_settings',
        idColumn: 'slide_id',
        foreignIdColumn: 'id',
      },
      {
        tableName: 'zcc_clinical_slides_sections',
        idColumn: 'slide_id',
        foreignIdColumn: 'id',
      },
      {
        tableName: 'zcc_clinical_slide_attachments',
        idColumn: 'slide_id',
        foreignIdColumn: 'id',
        fileIdColumn: 'file_id',
      },
      {
        tableName: 'zcc_clinical_information',
        idColumn: 'slide_id',
        foreignIdColumn: 'id',
      },
      {
        tableName: 'zcc_clinical_information_settings',
        idColumn: 'slide_id',
        foreignIdColumn: 'id',
      },
    ],
  },
];

async function getObject(
  key: string,
  bucket?: string,
): Promise<GetObjectCommandOutput> {
  const params = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Bucket: bucket || this.configService.get('aws.bucket'),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Key: key,
  };
  const command = new GetObjectCommand(params);
  return prodS3Client.send(command);
}

async function postFile(
  key: string,
  file: string | Uint8Array | Buffer | Readable,
  bucket?: string,
): Promise<PutObjectCommandOutput> {
  const params: PutObjectCommandInput = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Bucket: bucket || this.configService.get('aws.bucket'),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Key: key,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Body: file,
  };
  const command = new PutObjectCommand(params);
  return s3Client.send(command);
}

async function getAllFromTable(
  db: Knex,
  tableName: string,
  options: IGetAllFromTableOptions,
): Promise<Record<string, any>[]> {
  const query = db
    .select('*')
    .from(tableName);

  if (options.idColumn && options.ids) {
    query.whereIn(options.idColumn, options.ids);
  }

  if (options.page && options.limit) {
    query.limit(options.limit).offset((options.page - 1) * options.limit);
  }

  return query;
}

async function deleteAllFromTableByIds(
  table: ITableToLoad,
  ids: string[],
): Promise<void> {
  const currentTableData = await getAllFromTable(
    updateDb,
    table.tableName,
    {
      idColumn: table.idColumn,
      ids,
    },
  );
  if (table.loadAfter?.length) {
    for (const afterTable of table.loadAfter.reverse()) {
      await deleteAllFromTableByIds(
        afterTable,
        currentTableData.map((d) => d[afterTable.foreignIdColumn || afterTable.idColumn]),
      );
    }
  }

  if (table.fileIdColumn) {
    const files = await getAllFromTable(
      updateDb,
      table.tableName,
      {
        idColumn: table.idColumn,
        ids,
      },
    );
    for (const file of files) {
      await deleteAllFromTableByIds(
        { tableName: 'zcc_tracker.netapp', idColumn: 'file_id' },
        [file.file_id],
      );
      await deleteAllFromTableByIds(
        { tableName: 'zcc_tracker.datafiles', idColumn: 'file_id' },
        [file.file_id],
      );
    }
  }

  const query = updateDb
    .delete()
    .from(table.tableName)
    .whereIn(table.idColumn, ids);

  console.log(query.toString());

  try {
    await query;
  } catch (error) {
    console.log(error);
  }

  if (table.loadBefore?.length) {
    for (const beforeTable of table.loadBefore.reverse()) {
      await deleteAllFromTableByIds(
        beforeTable,
        currentTableData.map((d) => d[beforeTable.foreignIdColumn || beforeTable.idColumn]),
      );
    }
  }
}

async function insertIgnoreToTable(
  tableName: string,
  records: Record<string, any>[],
): Promise<number[]> {
  return updateDb
    .insert(records)
    .into(tableName)
    .onConflict()
    .ignore();
}

async function loadBatchedData(
  tableName: string,
  options?: IGetAllFromTableOptions,
): Promise<void> {
  const batchSize = 20000;
  const totalRecordsQuery = prodDb
    .count('* as count')
    .from(tableName);
  if (options?.idColumn && options?.ids) {
    totalRecordsQuery.whereIn(options.idColumn, options.ids);
  }
  const totalRecords = await totalRecordsQuery;
  console.log(`Loading ${totalRecords[0].count} records from ${tableName}`);
  const totalCount = typeof totalRecords[0].count === 'string' ? parseInt(totalRecords[0].count, 10) : totalRecords[0].count;
  const totalBatches = Math.ceil(totalCount / batchSize);

  for (let i = 0; i < totalBatches; i += 1) {
    const data = await getAllFromTable(
      prodDb,
      tableName,
      {
        page: i + 1,
        limit: batchSize,
        ...options,
      },
    );
    await insertIgnoreToTable(tableName, data);
  }
}

async function copyFile(
  fileId: string,
): Promise<void> {
  const file = await getAllFromTable(
    prodDb,
    'zcc_tracker.datafiles',
    {
      idColumn: 'file_id',
      ids: [fileId],
    },
  );
  if (file.length === 0) {
    console.log(`File ${fileId} not found in prod`);
    return;
  }
  const netappFile = await getAllFromTable(
    prodDb,
    'zcc_tracker.netapp',
    {
      idColumn: 'file_id',
      ids: [fileId],
    },
  );
  if (netappFile.length === 0) {
    console.log(`Netapp file for ${fileId} not found in prod`);
    return;
  }
  const netappFileData = netappFile[0];
  try {
    const fileData = await getObject(netappFileData.key, netappFileData.bucket);
    await postFile(
      netappFileData.key,
      await fileData.Body.transformToByteArray(),
      process.env.AWS_BUCKET,
    );
  } catch (error) {
    console.log(`Error getting object ${netappFileData.key} from ${netappFileData.bucket}`);
    console.log(error);
  }
  // insert to datafiles
  await insertIgnoreToTable(
    'zcc_tracker.datafiles',
    file,
  );
  // insert to netapp
  await insertIgnoreToTable(
    'zcc_tracker.netapp',
    [netappFileData],
  );
}

async function loadTable(
  table: ITableToLoad,
  ids: string[],
): Promise<void> {
  if (table.loadBefore?.length) {
    const currentTableData = await getAllFromTable(
      prodDb,
      table.tableName,
      {
        idColumn: table.idColumn,
        ids,
      },
    );
    for (const beforeTable of table.loadBefore) {
      await loadTable(
        beforeTable,
        currentTableData.map((d) => d[beforeTable.foreignIdColumn || beforeTable.idColumn]),
      );
    }
  }

  await loadBatchedData(
    table.tableName,
    {
      idColumn: table.idColumn,
      ids,
    },
  );

  if (table.fileIdColumn) {
    const files = await getAllFromTable(
      prodDb,
      table.tableName,
      {
        idColumn: table.idColumn,
        ids,
      },
    );
    for (const file of files) {
      console.log(`Copying file ${file[table.fileIdColumn]} from ${table.tableName}`);
      await copyFile(file[table.fileIdColumn]);
    }
  }

  if (table.loadAfter?.length) {
    const currentTableData = await getAllFromTable(
      prodDb,
      table.tableName,
      {
        idColumn: table.idColumn,
        ids,
      },
    );
    for (const afterTable of table.loadAfter) {
      await loadTable(
        afterTable,
        currentTableData.map((d) => d[afterTable.foreignIdColumn || afterTable.idColumn]),
      );
    }
  }
}

async function loadAnalysisSet(
  analysisSetId: string,
  skipMasking = false,
): Promise<void> {
  const prodData = await getAllFromTable(
    prodDb,
    'zcc_clinical_versions',
    {
      idColumn: 'analysis_set_id',
      ids: [analysisSetId],
    },
  );

  if (prodData.length === 0) {
    console.log(`Analysis set ${analysisSetId} not found in prod`);
    return;
  }

  const patient = await getAllFromTable(
    prodDb,
    'zcczerodashhg38.zcc_patient',
    {
      idColumn: 'patient_id',
      ids: [prodData[0].patient_id],
    },
  );

  const patientMap = new Map(patient.map((p) => [p.patient_id, p.zcc_subject_id]));
  const getPatientId = (patientId: string): string => (
    skipMasking ? patientId : (patientMap.get(patientId) ?? patientId)
  );
  await insertIgnoreToTable(
    'zcc_clinical_versions',
    prodData.map((a) => ({
      ...a,
      patient_id: getPatientId(a.patient_id),
    })),
  );

  for (const table of tablesByClinicalVersion) {
    await loadTable(
      {
        ...table,
        idColumn: table.idColumn || 'clinical_version_id',
      },
      prodData.map((a) => a.id),
    );
  }
}

async function deleteAnalysisSet(
  analysisSetId: string,
): Promise<void> {
  const prodData = await getAllFromTable(
    prodDb,
    'zcc_clinical_versions',
    {
      idColumn: 'analysis_set_id',
      ids: [analysisSetId],
    },
  );
  if (prodData.length === 0) {
    console.log(`Analysis set ${analysisSetId} not found in db, skipping`);
    return;
  }

  for (const table of tablesByClinicalVersion.reverse()) {
    await deleteAllFromTableByIds(
      {
        ...table,
        idColumn: table.idColumn || 'clinical_version_id',
      },
      prodData.map((a) => a.id),
    );
  }
  await deleteAllFromTableByIds(
    { tableName: 'zcc_clinical_versions', idColumn: 'analysis_set_id' },
    [analysisSetId],
  );
}

async function loadHardCodedData(): Promise<void> {
  const tables: string[] = [
    'knex_migrations',
    'knex_migrations_lock',
  ];

  for (const table of tables) {
    await loadBatchedData(table);
  }
}

async function cli(): Promise<void> {
  const program = new commander.Command();

  program.name('load-zerodash-data')
    .version('0.0.1')
    .description('Loads masked data from prod to dev');

  program.command('load')
    .requiredOption('-a, --analysis-sets <string>', 'Comma separated list of analysis sets to load')
    .option('-s, --skip-masking', 'Skip masking the IDs')
    .action(async (options) => {
      const analysisSets = options.analysisSets.split(',');
      for (const analysisSetId of analysisSets) {
        await loadAnalysisSet(analysisSetId, options.skipMasking);
      }
    });

  program.command('load-hard-coded')
    .action(async () => {
      await loadHardCodedData();
    });

  program.command('delete')
    .requiredOption('-a, --analysis-sets <string>', 'Comma separated list of analysis sets to delete')
    .action(async (options) => {
      const analysisSets = options.analysisSets.split(',');
      for (const analysisSetId of analysisSets) {
        await deleteAnalysisSet(analysisSetId);
      }
    });

  await program.parseAsync(process.argv);

  process.exit(0);
}

cli();
