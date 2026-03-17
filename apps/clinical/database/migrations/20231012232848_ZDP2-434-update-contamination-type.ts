import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_samples', (table) => {
    table.string('contamination', 10).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
