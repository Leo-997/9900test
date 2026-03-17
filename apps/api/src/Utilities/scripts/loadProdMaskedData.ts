/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */

import * as commander from 'commander';
import { readFileSync } from 'fs';
import knex, { Knex } from 'knex';

const database = 'zcczerodashhg38';

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
    ssl: process.env.DB_SSL_CA
      ? {
        ca: readFileSync(process.env.DB_SSL_CA || ''),
      }
      : undefined,
  },
};

const prodDb = knex(prodDbConfig);
const updateDb = knex(updateDbConfig);

interface IGetAllFromTableOptions {
  idColumn?: string;
  ids?: string[];
  customQuery?: Knex.QueryCallback;
  page?: number;
  limit?: number;
}

interface ITableToLoad {
  tableName: string;
  idColumn?: string;
  foreignIdColumn?: string;
  loadBefore?: ITableToLoad[];
  loadAfter?: ITableToLoad[];
  customQuery?: Knex.QueryCallback;
}

const tablesByBiosample: ITableToLoad[] = [
  { tableName: 'zcc_biosample_assay_xref' },
  { tableName: 'zcc_curated_sample_germline_cnv' },
  {
    tableName: 'zcc_curated_sample_germline_snv',
    loadBefore: [
      { tableName: 'zcc_curated_snv', idColumn: 'variant_id' },
      { tableName: 'zcc_curated_snv_anno', idColumn: 'variant_id' },
    ],
  },
  {
    tableName: 'zcc_curated_sample_germline_sv',
    loadBefore: [
      { tableName: 'zcc_curated_sv', idColumn: 'variant_id' },
    ],
  },
  { tableName: 'zcc_curated_sample_immunoprofile' },
  { tableName: 'zcc_curated_sample_methylation_genes' },
  { tableName: 'zcc_curated_sample_signatures' },
  { tableName: 'zcc_curated_sample_somatic_armcnv' },
  {
    tableName: 'zcc_curated_sample_somatic_cnv',
    customQuery: function getReportablesOrInGene(): void {
      this.whereIn('gene_id', prodDb.select('gene_id').from('zccreports.zcc_gene_list_version_gene_xref'))
        .orWhereNotNull('classification');
    },
  },
  { tableName: 'zcc_curated_sample_somatic_cytobandcnv' },
  { tableName: 'zcc_curated_sample_somatic_methylation' },
  { tableName: 'zcc_curated_sample_somatic_mgmtstatus' },
  { tableName: 'zcc_curated_sample_somatic_mutsig' },
  {
    tableName: 'zcc_curated_sample_somatic_rnaseq',
    customQuery: function getReportablesOrInGene(): void {
      this.whereIn('gene_id', prodDb.select('gene_id').from('zccreports.zcc_gene_list_version_gene_xref'))
        .orWhereNotNull('classification');
    },
  },
  { tableName: 'zcc_curated_sample_somatic_rnaseq_classification' },
  {
    tableName: 'zcc_curated_sample_somatic_snv',
    loadBefore: [
      { tableName: 'zcc_curated_snv', idColumn: 'variant_id' },
      { tableName: 'zcc_curated_snv_anno', idColumn: 'variant_id' },
    ],
  },
  {
    tableName: 'zcc_curated_sample_somatic_sv',
    loadBefore: [
      { tableName: 'zcc_curated_sv', idColumn: 'variant_id' },
    ],
  },
  { tableName: 'zcc_donor' },
  { tableName: 'zcc_donor', idColumn: 'donor_id' },
  { tableName: 'zcc_hts_culture' },
  { tableName: 'zcc_hts_drug_combinations' },
  { tableName: 'zcc_hts_drugstats' },
  { tableName: 'zcc_methylation_anno' },
  { tableName: 'zcc_methylation_predictions' },
  { tableName: 'zcc_pipelines' },
  { tableName: 'zcc_rna_pathways' },
  { tableName: 'zcc_seq_metrics' },
  { tableName: 'zcc_rna_relapse_comparison' },
  { tableName: 'zcc_rna_relapse_comparison', idColumn: 'relapse_biosample_id' },
  { tableName: 'zcc_rna_tsne' },
];

const tablesByAnalysisSet: ITableToLoad[] = [
  { tableName: 'zcc_curated_reportable_variants' },
  {
    tableName: 'zcc_curation_meeting_samples',
    loadBefore: [
      { tableName: 'zcc_curation_meeting', idColumn: 'meeting_id' },
    ],
  },
  { tableName: 'zcc_evidences' },
  { tableName: 'zcc_purity' },
  { tableName: 'zcc_sample_summary_notes' },
  {
    tableName: 'zcc_curation_comment_thread',
    loadAfter: [
      {
        tableName: 'zcc_curation_comment_thread_xref',
        idColumn: 'thread_id',
        foreignIdColumn: 'id',
        loadBefore: [
          {
            tableName: 'zcc_curation_comment',
            idColumn: 'id',
            foreignIdColumn: 'comment_id',
            loadAfter: [
              {
                tableName: 'zcc_curation_comment_version',
                idColumn: 'comment_id',
                foreignIdColumn: 'id',
              },
              {
                tableName: 'zcc_curation_therapy_entity_xref',
                idColumn: 'entity_id',
                foreignIdColumn: 'id',
                loadBefore: [
                  {
                    tableName: 'zcc_curation_therapies',
                    idColumn: 'id',
                    foreignIdColumn: 'therapy_id',
                    loadAfter: [
                      {
                        tableName: 'zcc_curation_therapy_drugs',
                        idColumn: 'therapy_id',
                        foreignIdColumn: 'id',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
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

  if (options.customQuery) {
    query.andWhere(options.customQuery);
  }

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
  return updateDb
    .insert(records)
    .into(tableName)
    .onConflict()
    .ignore();
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
  if (options?.customQuery) {
    totalRecordsQuery.andWhere(options.customQuery);
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

async function loadHardCodedData(): Promise<void> {
  const tables: string[] = [
    'knex_migrations',
    'knex_migrations_lock',
    'ucsc_chromosome_bands',
    'zcc_assay',
    'zcc_platforms',
    'zcc_provider',
    'zcc_consequence',
    'zcc_pathways',
    'zcc_genes',
    'zcc_gene_pathway_xref',
    'zcc_methylation_probe',
    'zcc_methylation_probe_genes_xref',
    'zcc_manifest',
    'zcc_methylation_classifier',
    'zcc_methylation_group',
    'zcc_methylation_xref',
  ];

  for (const table of tables) {
    await loadBatchedData(table);
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
        customQuery: table.customQuery,
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
      customQuery: table.customQuery,
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
        customQuery: table.customQuery,
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
    'zcc_analysis_set',
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
    'zcc_patient',
    {
      idColumn: 'patient_id',
      ids: [prodData[0].patient_id],
    },
  );
  const xrefRecords = await getAllFromTable(
    prodDb,
    'zcc_analysis_set_biosample_xref',
    {
      idColumn: 'analysis_set_id',
      ids: [analysisSetId],
    },
  );
  const biosamples = await getAllFromTable(
    prodDb,
    'zcc_biosample',
    {
      idColumn: 'biosample_id',
      ids: xrefRecords.map((xref) => xref.biosample_id),
    },
  );

  const biosampleMap = new Map(biosamples.map((b) => [b.biosample_id, b.biosample_uuid]));
  const patientMap = new Map(patient.map((p) => [p.patient_id, p.zcc_subject_id]));
  const getPatientId = (patientId: string): string => (
    skipMasking ? patientId : (patientMap.get(patientId) ?? patientId)
  );
  const getBiosampleId = (biosampleId: string): string => (
    skipMasking ? biosampleId : (biosampleMap.get(biosampleId) ?? biosampleId)
  );

  await insertIgnoreToTable('zcc_patient', patient.map((p) => ({
    ...p,
    patient_id: getPatientId(p.patient_id),
    internal_id: null,
    lm_subj_id: null,
    lm_subj_code: null,
  })));
  await insertIgnoreToTable('zcc_analysis_set', prodData.map((a) => ({
    ...a,
    patient_id: getPatientId(a.patient_id),
  })));
  await insertIgnoreToTable('zcc_biosample', biosamples.map((b) => ({
    ...b,
    biosample_id: getBiosampleId(b.biosample_id),
    patient_id: getPatientId(b.patient_id),
    lm_subj_id: null,
  })));
  await insertIgnoreToTable(
    'zcc_analysis_set_biosample_xref',
    xrefRecords.map((xref) => ({
      ...xref,
      analysis_set_id: analysisSetId,
      biosample_id: getBiosampleId(xref.biosample_id),
    })),
  );

  for (const table of tablesByBiosample) {
    await loadTable(
      { ...table, idColumn: table.idColumn || 'biosample_id' },
      biosamples.map((b) => b.biosample_id),
      skipMasking ? undefined : biosampleMap,
    );
  }

  for (const table of tablesByAnalysisSet) {
    await loadTable(
      { ...table, idColumn: table.idColumn || 'analysis_set_id' },
      [analysisSetId],
    );
  }
}

async function deleteAnalysisSet(
  analysisSetId: string,
): Promise<void> {
  const analysisSetData = await getAllFromTable(
    updateDb,
    'zcc_analysis_set',
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
    'zcc_analysis_set_biosample_xref',
    {
      idColumn: 'analysis_set_id',
      ids: [analysisSetId],
    },
  );

  const biosamples = await getAllFromTable(
    updateDb,
    'zcc_biosample',
    {
      idColumn: 'biosample_id',
      ids: xrefRecords.map((xref) => xref.biosample_id),
    },
  );

  const patient = await getAllFromTable(
    updateDb,
    'zcc_patient',
    {
      idColumn: 'patient_id',
      ids: [analysisSetData[0].patient_id],
    },
  );

  const biosampleMap = new Map(biosamples.map((b) => [b.biosample_id, b.biosample_uuid]));
  const patientMap = new Map(patient.map((p) => [p.patient_id, p.zcc_subject_id]));

  await deleteAllFromTableByIds(
    'zcc_analysis_set_biosample_xref',
    'analysis_set_id',
    [analysisSetId],
  );
  await deleteAllFromTableByIds(
    'zcc_biosample',
    'biosample_id',
    biosamples.map((b) => biosampleMap.get(b.biosample_id)),
  );
  await deleteAllFromTableByIds('zcc_analysis_set', 'analysis_set_id', [analysisSetId]);
  await deleteAllFromTableByIds('zcc_patient', 'patient_id', [patientMap.get(analysisSetData[0].patient_id)]);

  for (const table of tablesByBiosample) {
    await deleteAllFromTableByIds(
      table.tableName,
      table.idColumn || 'biosample_id',
      biosamples.map((b) => biosampleMap.get(b.biosample_id)),
    );
  }

  for (const table of tablesByAnalysisSet) {
    await deleteAllFromTableByIds(
      table.tableName,
      table.idColumn || 'analysis_set_id',
      [analysisSetId],
    );
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
    .option('-s, --skip-masking', 'Skip masking the IDs')
    .action(async (options) => {
      const analysisSets = options.analysisSets.split(',');
      for (const analysisSetId of analysisSets) {
        await loadAnalysisSet(analysisSetId, options.skipMasking);
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
