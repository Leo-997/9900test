/* eslint-disable no-await-in-loop */
import knex, { Knex } from 'knex';
import { VariantType } from 'Models/Misc/VariantType.model';
import { ReportType } from 'Models/Reports/Reports.model';
import { knexConnectionConfig } from '../../../knexfile';



const zdKnex = knex(knexConnectionConfig);

const commentThreadsTable = 'zcc_curation_comment_thread';
const commentsTable = 'zcc_curation_comment';

const reportableVariantsTable = 'zcc_curated_reportable_variants';

interface IVariantTable {
  tableName: string;
  sampleIdCol?: string;
  variantIdCol: string;
  variantType: VariantType;
  modifyWith?: (qb: Knex.QueryBuilder) => void;
}

function joinMatchedNormalId(qb: Knex.QueryBuilder): void {
  qb
    .innerJoin(
      { b: 'zcc_sample' },
      'a.matched_normal_id',
      'b.matched_normal_id',
    );
}

function joinRnaSeqId(qb: Knex.QueryBuilder): void {
  qb
    .innerJoin(
      { b: 'zcc_sample' },
      'a.rnaseq_id',
      'b.rnaseq_id',
    );
}

function insertReportQuery(variantTable: IVariantTable, report: ReportType = 'MTB_REPORT'): Knex.QueryBuilder {
  const selectQuery = zdKnex.select({
    sample_id: zdKnex.raw(`${variantTable.sampleIdCol || 'sample_id'}`),
    variant_type: zdKnex.raw(`'${variantTable.variantType}'`),
    variant_id: zdKnex.raw(`${variantTable.variantIdCol}`),
    report_type: zdKnex.raw(`'${report}'`),
  })
    .from({ a: variantTable.tableName })
    .where('reportable', true);

  if (variantTable.modifyWith) {
    selectQuery.modify(variantTable.modifyWith);
  }

  if (report === 'MOLECULAR_REPORT') {
    selectQuery.andWhere('in_molecular_report', true);
  }

  return zdKnex.insert(selectQuery)
    .into(reportableVariantsTable)
    .onConflict([
      'sample_id',
      'variant_type',
      'variant_id',
      'report_type',
    ])
    .ignore();
}

async function migrateVariants(): Promise<void> {
  const germlineTables: IVariantTable[] = [
    {
      tableName: 'zcc_curated_sample_germline_snv',
      variantType: 'GERMLINE_SNV',
      variantIdCol: '`variant_id`',
      sampleIdCol: 'b.sample_id',
      modifyWith: joinMatchedNormalId,
    },
    { tableName: 'zcc_curated_sample_germline_cnv', variantType: 'GERMLINE_CNV', variantIdCol: '`gene_id`' },
  ];

  const allTables: IVariantTable[] = [
    ...germlineTables,
    {
      tableName: 'zcc_curated_sample_somatic_snv',
      variantType: 'SNV',
      variantIdCol: '`variant_id`',
    },
    {
      tableName: 'zcc_curated_sample_somatic_cnv',
      variantType: 'CNV',
      variantIdCol: '`gene_id`',
    },
    {
      tableName: 'zcc_curated_sample_somatic_sv',
      variantType: 'SV',
      variantIdCol: '`variant_id`',
    },
    {
      tableName: 'zcc_curated_sample_somatic_rnaseq',
      variantType: 'RNA_SEQ',
      variantIdCol: '`gene_id`',
      sampleIdCol: 'b.sample_id',
      modifyWith: joinRnaSeqId,
    },
    {
      tableName: 'zcc_curated_sample_somatic_armcnv',
      variantType: 'CYTOGENETICS',
      variantIdCol: 'CONCAT(chr, \'-\', arm)',
    },
    {
      tableName: 'zcc_curated_sample_somatic_cytobandcnv',
      variantType: 'CYTOGENETICS',
      variantIdCol: '`cytoband`',
    },
    {
      tableName: 'zcc_curated_sample_somatic_mutsig',
      variantType: 'MUTATIONAL_SIG',
      variantIdCol: '`signature`',
    },
  ];

  await Promise.all(allTables.map((t) => insertReportQuery(t)));
  await Promise.all(allTables.map((t) => insertReportQuery(t, 'MOLECULAR_REPORT')));
  await Promise.all(germlineTables.map((t) => insertReportQuery(t, 'GERMLINE_REPORT')));
}

async function updateReportComments(): Promise<void> {
  await zdKnex.update({
    thread_type: 'MOLECULAR',
  })
    .from(commentThreadsTable)
    .where('thread_type', 'REPORTS');

  await zdKnex.update({
    original_thread_type: 'CURATION',
  })
    .from(commentsTable)
    .where('type', 'CURATION');

  await zdKnex.update({
    original_thread_type: 'COMMENT',
  })
    .from(commentsTable)
    .where('type', 'COMMENT');

  await zdKnex.update({
    original_thread_type: 'SUMMARY',
  })
    .from(commentsTable)
    .where('type', 'SUMMARY');

  await zdKnex.update({
    original_thread_type: 'SAMPLE',
  })
    .from(commentsTable)
    .where('type', 'SAMPLE');

  await zdKnex.update({
    original_thread_type: 'MOLECULAR',
  })
    .from(commentsTable)
    .whereNull('original_thread_type');

  await zdKnex.update({
    type: 'MOLECULAR_SUMMARY',
  })
    .from(commentsTable)
    .where('type', 'REPORTS');
}

async function migrateVariantsAndComments(): Promise<void> {
  await migrateVariants();
  await updateReportComments();

  process.exit(0);
}

migrateVariantsAndComments();
