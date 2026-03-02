import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_rnaseq', function createRnaSeqTbl(table) {
    table.string('rnaseq_id', 150).notNullable();
    table.integer('gene_id', 11).unsigned().defaultTo(null);

    table.string('transcript', 1000).defaultTo(null);

    table.specificType('counts', 'double').defaultTo(null);
    table.specificType('fpkm', 'double').defaultTo(null);
    table.specificType('tpm', 'double').defaultTo(null);
    table.specificType('logFC', 'double').defaultTo(null);
    table.specificType('logCPM', 'double').defaultTo(null);
    table.specificType('lr', 'double').defaultTo(null);
    table.specificType('pvalue', 'double').defaultTo(null);
    table.specificType('fdr', 'double').defaultTo(null);
    table.specificType('fc', 'double').defaultTo(null);
    table.specificType('zscore_mean', 'double').defaultTo(null);
    table.specificType('fpkm_mean', 'double').defaultTo(null);
    table.specificType('fpkm_median', 'double').defaultTo(null);
    table.specificType('tpm_mean', 'double').defaultTo(null);
    table.specificType('tpm_median', 'double').defaultTo(null);

    table.string('reportable').defaultTo(null);
    table.boolean('targetable').defaultTo(null);
    table.string('evidence', 4000).defaultTo(null);
    table.text('curator_summary').defaultTo(null);
    table.text('comments').defaultTo(null);

    table.primary(['rnaseq_id', 'gene_id']);
    table.index('rnaseq_id');

    table.index('gene_id');
    table
      .foreign('gene_id')
      .references('zcc_genes.gene_id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
