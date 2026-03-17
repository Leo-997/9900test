import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_versions', (table) => {
    table.timestamp('slides_started_at').after('cancer_geneticist_id');
    table.timestamp('slides_finalised_at').after('slides_started_at');
  });
}

export async function down(knex: Knex): Promise<void> {
}
