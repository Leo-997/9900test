import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_sample_somatic_rnaexp',
    function createCuratedSampleSomaticRnaexpTbl(table) {
      table.string('rnaseq_id', 150).notNullable();
      table.integer('gene_id', 11).unsigned().notNullable();

      table.specificType('fpkm', 'double').defaultTo(null);
      table.specificType('fpkm_median', 'double').defaultTo(null);
      table.specificType('tpm', 'double').defaultTo(null);
      table.specificType('tpm_median', 'double').defaultTo(null);
      table.specificType('fc', 'double').defaultTo(null);
      table.specificType('zscore_mean', 'double').defaultTo(null);

      table.string('reportable').defaultTo(null);
      table.boolean('targetable').defaultTo(null);
      table.string('evidence', 4000).defaultTo(null);
      table.text('curator_summary').defaultTo(null);
      table.text('comments').defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.primary(['rnaseq_id', 'gene_id']);
      table.index('gene_id');
      table.index('rnaseq_id');

      table
        .foreign('gene_id')
        .references('gene_id')
        .inTable('zcc_genes')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table
        .foreign('rnaseq_id')
        .references('zcc_sample.rnaseq_id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
