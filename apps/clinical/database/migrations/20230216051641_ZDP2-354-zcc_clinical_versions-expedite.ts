import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_versions', (table) => {
    table.boolean('expedite').defaultTo(false).after('clinical_history');
  });
}


export async function down(knex: Knex): Promise<void> {
}

