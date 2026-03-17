import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_information', (table) => {
    table.string('prior_genetic_test').alter();
    table.string('personal_history').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
