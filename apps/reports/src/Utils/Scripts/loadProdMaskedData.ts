/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */

import * as commander from 'commander';
import { readFileSync } from 'fs';
import knex, { Knex } from 'knex';

const database = 'zccreports';

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

const tablesByReportId: ITableToLoad[] = [
  { tableName: 'zcc_approvals' },
  { tableName: 'zcc_reports_metadata' },
];

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
): Promise<void> {
  const prodData = await getAllFromTable(
    prodDb,
    'zcc_reports',
    {
      idColumn: 'analysis_set_id',
      ids: [analysisSetId],
    },
  );

  if (prodData.length === 0) {
    console.log(`Analysis set ${analysisSetId} not found in prod`);
    return;
  }

  await insertIgnoreToTable(
    'zcc_reports',
    prodData.map((r) => ({
      ...r,
      file_id: null,
    })),
  );

  for (const table of tablesByReportId) {
    await loadTable(
      {
        ...table,
        idColumn: table.idColumn || 'report_id',
      },
      prodData.map((r) => r.id),
    );
  }
}

async function deleteAnalysisSet(
  analysisSetId: string,
): Promise<void> {
  const prodData = await getAllFromTable(
    prodDb,
    'zcc_reports',
    {
      idColumn: 'analysis_set_id',
      ids: [analysisSetId],
    },
  );

  if (prodData.length === 0) {
    console.log(`Analysis set ${analysisSetId} not found in db, skipping`);
    return;
  }

  for (const table of tablesByReportId.reverse()) {
    await deleteAllFromTableByIds(
      {
        ...table,
        idColumn: table.idColumn || 'report_id',
      },
      prodData.map((r) => r.id),
    );
  }

  await deleteAllFromTableByIds(
    { tableName: 'zcc_reports', idColumn: 'analysis_set_id' },
    [analysisSetId],
  );
}

async function loadHardCodedData(): Promise<void> {
  const tables: string[] = [
    'knex_migrations',
    'knex_migrations_lock',
    'zcc_gene_list',
    'zcc_gene_list_version',
    'zcc_gene_list_version_gene_xref',
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

  program.command('load-hard-coded')
    .action(async () => {
      await loadHardCodedData();
    });

  program.command('load')
    .requiredOption('-a, --analysis-sets <string>', 'Comma separated list of analysis sets to load')
    .action(async (options) => {
      const analysisSets = options.analysisSets.split(',');
      for (const analysisSetId of analysisSets) {
        await loadAnalysisSet(analysisSetId);
      }
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
