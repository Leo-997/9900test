import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_somatic_sv',
    function createCuratedSomaticSvTbl(table) {
      table.increments('variant_id');

      table.integer('start_gene_id', 11).unsigned().notNullable();
      table.integer('end_gene_id', 11).unsigned().notNullable();

      table.unique(['start_gene_id', 'end_gene_id']);
      table.index('start_gene_id');
      table.index('end_gene_id');

      table
        .foreign('start_gene_id')
        .references('gene_id')
        .inTable('zcc_genes')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table
        .foreign('end_gene_id')
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
