import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_germline_cnv_counts',
    function createCuratedGermlineCnvCountsTbl(table) {
      table.integer('gene_id', 11).unsigned().notNullable();
      table.string('cn_type', 255).notNullable();

      table.integer('sample_count', 11).defaultTo(null);
      table.integer('cancer_types', 11).defaultTo(null);

      table.primary(['gene_id', 'cn_type']);

      table.index('gene_id');
      table
        .foreign('gene_id')
        .references('gene_id')
        .inTable('zcc_genes')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
