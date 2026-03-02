import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_somatic_snv_counts',
    function alterVariantId(table) {
      table.integer('variant_id', 10).unsigned().notNullable().alter();
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
