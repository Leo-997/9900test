import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_samples', (table) => {
    table.float('ipass_value').defaultTo(null).after('loh_proportion');
    table
      .enum('ipass_status', ['T-cell infiltrated', 'Cold'])
      .defaultTo(null).after('ipass_value');
  });
}

export async function down(knex: Knex): Promise<void> {
}
