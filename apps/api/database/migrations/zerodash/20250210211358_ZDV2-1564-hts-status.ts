import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_analysis_set', (table) => {
    table.string('hts_status', 50)
      .nullable()
      .after('secondary_curation_status');
  });
}

export async function down(knex: Knex): Promise<void> {
}
