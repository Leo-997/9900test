import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_sample_germline_snv',
    function updateSomaticSnvFK(table) {
      table.dropForeign(['variant_id']);

      table
        .foreign('variant_id')
        .references('zcc_curated_snv.variant_id')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
