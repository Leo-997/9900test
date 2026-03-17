import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_somatic_snv_counts',
    function updateSomaticCounts(table) {
      table.integer('c5_count', 11).unsigned().defaultTo(null);
      table.integer('c4_count', 11).unsigned().defaultTo(null);
      table.integer('c3_8_count', 11).unsigned().defaultTo(null);
      table.integer('c3_count', 11).unsigned().defaultTo(null);
      table.integer('reported_count', 11).unsigned().defaultTo(null);
      table.integer('targetable_count', 11).unsigned().defaultTo(null);
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
