import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_germline_snv_counts',
    function replaceFK(table) {
      table.integer('variant_id', 10).unsigned().notNullable().alter();

      table.dropForeign(['variant_id']);

      table
        .foreign('variant_id')
        .references('variant_id')
        .inTable('zcc_curated_snv')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
