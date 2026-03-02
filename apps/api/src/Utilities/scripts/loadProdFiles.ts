/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import * as commander from 'commander';
import { readFileSync } from 'fs';
import knex, { Knex } from 'knex';
import { S3Service } from 'Modules/S3/S3.service';

const database = 'zcc_tracker';

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
    ssl: process.env.DB_SSL_CA ? {
      ca: readFileSync(process.env.DB_SSL_CA || ''),
    } : undefined,
  },
};

const prodDb = knex(prodDbConfig);
const updateDb = knex(updateDbConfig);

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
const s3Service = new S3Service(s3Client, new ConfigService());
const prodS3Service = new S3Service(prodS3Client, new ConfigService());

// Files in these tables will be moved to non-prod bucket
const tablesFilesToBeMoved: string[] = [
  'zcc_zd_circos',
  'zcc_zd_fusion',
  'zcc_zd_hts',
  'zcc_zd_linx',
  'zcc_zd_methylation',
  'zcc_zd_methylation_genes',
  'zcc_zd_mutsig',
  'zcc_zd_qc',
  'zcc_zd_rna_classifier',
  'zcc_zd_rna_seq',
];

const tablesFilesNotToBeMoved: string[] = [
  'zcc_zd_bam',
  'zcc_zd_tsv',
];

interface IGetAllFromTableOptions {
  idColumn?: string;
  ids?: string[];
  page?: number;
  limit?: number;
  inTables?: {
    idColumn: string;
    tables: string[];
  },
  notInTables?: {
    idColumn: string;
    tables: string[];
  },
}

interface ITableToLoad {
  tableName: string;
  idColumn?: string;
  foreignIdColumn?: string;
  loadBefore?: ITableToLoad[];
  loadAfter?: ITableToLoad[];
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

  if (options.inTables) {
    query.andWhere(function inTables() {
      for (const table of options.inTables.tables) {
        this.orWhereIn(options.inTables.idColumn, db.select(options.inTables.idColumn).from(table));
      }
    });
  }

  if (options.notInTables) {
    query.andWhere(function notInTables() {
      for (const table of options.notInTables.tables) {
        this.whereNotIn(
          options.notInTables.idColumn,
          db.select(options.notInTables.idColumn).from(table),
        );
      }
    });
  }

  if (options.page && options.limit) {
    query.limit(options.limit).offset((options.page - 1) * options.limit);
  }

  console.log(query.toString());
  return query;
}

async function deleteAllFromTableByIds(
  tableName: string,
  idColumn: string,
  ids: string[],
): Promise<number> {
  return updateDb
    .delete()
    .from(tableName)
    .whereIn(idColumn, ids);
}

async function insertIgnoreToTable(
  tableName: string,
  records: Record<string, any>[],
): Promise<number[]> {
  const query = updateDb
    .insert(records)
    .into(tableName)
    .onConflict()
    .ignore();

  console.log(query.toString());
  return query;
}

async function loadBatchedData(
  tableName: string,
  options?: IGetAllFromTableOptions,
  mapping?: (item: Record<string, string>) => Record<string, string>,
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
    const mappedData = mapping ? data.map(mapping) : data;
    await insertIgnoreToTable(tableName, mappedData);
  }
}

async function loadTable(
  table: ITableToLoad,
  ids: string[],
  idMap?: Map<string, string>,
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
    idMap
      ? (item): typeof item => ({
        ...item,
        [table.idColumn]: idMap.get(item[table.idColumn]),
      }) : undefined,
  );

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

async function copyFile(
  file: Record<string, any>,
  biosampleMap: Map<string, string>,
  patientMap: Map<string, string>,
  copyToBucket: boolean,
  skipMasking = false,
): Promise<void> {
  const netappFile = await getAllFromTable(
    prodDb,
    'netapp',
    {
      idColumn: 'file_id',
      ids: [file.file_id],
    },
  );
  if (netappFile.length === 0) {
    console.log(`Netapp file for ${file.file_id} not found in prod`);
    return;
  }
  const netappFileData = netappFile[0];
  const getPatientId = (patientId: string): string => (
    skipMasking ? patientId : (patientMap.get(patientId) ?? patientId)
  );
  const getBiosampleId = (biosampleId: string): string => (
    skipMasking ? biosampleId : (biosampleMap.get(biosampleId) ?? biosampleId)
  );
  const newKey = copyToBucket && !skipMasking
    ? Array.from(biosampleMap.entries())
      .reduce((acc, [key, value]) => acc.replaceAll(key, value), netappFileData.key as string)
    : netappFileData.key;
  const newName = skipMasking
    ? file.filename
    : Array.from(biosampleMap.entries())
      .reduce((acc, [key, value]) => acc.replaceAll(key, value), file.filename as string);
  if (copyToBucket) {
    try {
      const fileData = await prodS3Service.getObject(netappFileData.key, netappFileData.bucket);
      await s3Service.postFile(
        newKey,
        await fileData.Body.transformToByteArray(),
        process.env.AWS_BUCKET,
      );
    } catch (error) {
      console.log(`Error getting object ${netappFileData.key} from ${netappFileData.bucket}`);
      console.log(error);
    }
  }
  // insert to datafiles
  await insertIgnoreToTable(
    'datafiles',
    [{
      ...file,
      sample_id: getBiosampleId(file.sample_id),
      patient_id: getPatientId(file.patient_id),
      filename: newName,
    }],
  );
  // insert to netapp
  await insertIgnoreToTable(
    'netapp',
    [{
      ...netappFileData,
      key: newKey,
      bucket: copyToBucket ? process.env.AWS_BUCKET : netappFileData.bucket,
    }],
  );
}

async function loadAnalysisSetFiles(
  analysisSetId: string,
  skipMasking = false,
): Promise<void> {
  const prodData = await getAllFromTable(
    prodDb,
    'zcczerodashhg38.zcc_analysis_set',
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
  const xrefRecords = await getAllFromTable(
    prodDb,
    'zcczerodashhg38.zcc_analysis_set_biosample_xref',
    {
      idColumn: 'analysis_set_id',
      ids: [analysisSetId],
    },
  );
  const biosamples = await getAllFromTable(
    prodDb,
    'zcczerodashhg38.zcc_biosample',
    {
      idColumn: 'biosample_id',
      ids: xrefRecords.map((xref) => xref.biosample_id),
    },
  );

  const biosampleMap = new Map(biosamples.map((b) => [b.biosample_id, b.biosample_uuid]));
  const patientMap = new Map(patient.map((p) => [p.patient_id, p.zcc_subject_id]));

  const filesToMove = await getAllFromTable(
    prodDb,
    'datafiles',
    {
      idColumn: 'sample_id',
      ids: biosamples.map((b) => b.biosample_id),
      inTables: {
        idColumn: 'file_id',
        tables: tablesFilesToBeMoved,
      },
    },
  );

  for (const file of filesToMove) {
    await copyFile(
      file,
      biosampleMap,
      patientMap,
      true,
      skipMasking,
    );
  }

  for (const table of tablesFilesToBeMoved) {
    await loadTable(
      {
        tableName: table,
        idColumn: 'file_id',
      },
      filesToMove.map((f) => f.file_id),
    );
  }

  const filesNotToMove = await getAllFromTable(
    prodDb,
    'datafiles',
    {
      idColumn: 'sample_id',
      ids: biosamples.map((b) => b.biosample_id),
      inTables: {
        idColumn: 'file_id',
        tables: tablesFilesNotToBeMoved,
      },
    },
  );

  for (const file of filesNotToMove) {
    await copyFile(
      file,
      biosampleMap,
      patientMap,
      false,
      skipMasking,
    );
  }
  for (const table of tablesFilesNotToBeMoved) {
    await loadTable(
      {
        tableName: table,
        idColumn: 'file_id',
      },
      filesNotToMove.map((f) => f.file_id),
    );
  }
}

async function deleteAnalysisSet(
  analysisSetId: string,
): Promise<void> {
  const analysisSetData = await getAllFromTable(
    updateDb,
    'zcczerodashhg38.zcc_analysis_set',
    {
      idColumn: 'analysis_set_id',
      ids: [analysisSetId],
    },
  );
  if (analysisSetData.length === 0) {
    console.log(`Analysis set ${analysisSetId} not found in db, skipping`);
    return;
  }

  const xrefRecords = await getAllFromTable(
    updateDb,
    'zcczerodashhg38.zcc_analysis_set_biosample_xref',
    {
      idColumn: 'analysis_set_id',
      ids: [analysisSetId],
    },
  );

  const biosamples = await getAllFromTable(
    updateDb,
    'zcczerodashhg38.zcc_biosample',
    {
      idColumn: 'biosample_id',
      ids: xrefRecords.map((xref) => xref.biosample_id),
    },
  );

  const biosampleMap = new Map(biosamples.map((b) => [b.biosample_id, b.biosample_uuid]));

  // get all files from datafiles
  const files = await getAllFromTable(
    updateDb,
    'datafiles',
    {
      idColumn: 'sample_id',
      ids: biosamples.map((b) => biosampleMap.get(b.biosample_id)),
    },
  );

  for (const table of [...tablesFilesToBeMoved, ...tablesFilesNotToBeMoved]) {
    await deleteAllFromTableByIds(
      table,
      'file_id',
      files.map((f) => f.file_id),
    );
  }

  // delete from netapp
  await deleteAllFromTableByIds(
    'netapp',
    'file_id',
    files.map((f) => f.file_id),
  );

  // delete from datafiles
  await deleteAllFromTableByIds(
    'datafiles',
    'sample_id',
    files.map((f) => f.sample_id),
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
        await loadAnalysisSetFiles(analysisSetId, options.skipMasking);
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
