import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_somatic_snv_counts',
    function addFK(table) {
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
