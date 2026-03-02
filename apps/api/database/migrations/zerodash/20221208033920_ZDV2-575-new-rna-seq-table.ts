import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_curated_sample_somatic_rnaseq', (table) => {
    table.string('rnaseq_id', 150).notNullable();
    table.integer('gene_id').unsigned().notNullable();
    table.string('transcript', 1000).nullable();
    table.double('counts').nullable();
    table.double('fpkm').nullable();
    table.double('tpm').nullable();
    table.double('logFC').nullable();
    table.double('logCPM').nullable();
    table.double('lr').nullable();
    table.double('pvalue').nullable();
    table.double('fdr').nullable();
    table.double('fc').nullable();
    table.double('zscore_mean').nullable();
    table.double('fpkm_mean').nullable();
    table.double('fpkm_median').nullable();
    table.double('tpm_mean').nullable();
    table.double('tpm_median').nullable();
    table.string('reportable', 255).nullable();
    table.boolean('targetable').nullable();
    table.string('evidence', 4000).nullable();
    table.text('curator_summary').nullable();
    table.integer('summary_thread_id').unsigned().nullable();
    table.text('comments').nullable();
    table.integer('comment_thread_id').unsigned().nullable();
    table.boolean('outlier').nullable();
    table.string('gene_expression', 50).nullable();
    table.primary(['rnaseq_id', 'gene_id']);
    table.index(['rnaseq_id'], 'zcc_rnaseq_rnaseq_id_index');
    table.index(['gene_id'], 'zcc_rnaseq_gene_id_index');
    table.index(['comment_thread_id'], 'zcc_rnaseq_comment_thread_id_foreign');
    table.index(['summary_thread_id'], 'zcc_rnaseq_summary_thread_id_foreign');
    table.index(['reportable'], 'idx_sample_rnaseq_reportable');

    table.engine('InnoDB');
    table.charset('utf8');
  })
}


export async function down(knex: Knex): Promise<void> {
}

