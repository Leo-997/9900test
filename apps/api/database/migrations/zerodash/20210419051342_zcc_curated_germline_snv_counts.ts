import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_germline_snv_counts',
    function createCuratedGermlineSnvCountsTbl(table) {
      table.integer('variant_id', 11).unsigned().notNullable().primary();

      table.integer('sample_count', 11).defaultTo(null);
      table.integer('cancer_types', 11).defaultTo(null);

      table
        .foreign('variant_id')
        .references('variant_id')
        .inTable('zcc_curated_germline_snv')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
