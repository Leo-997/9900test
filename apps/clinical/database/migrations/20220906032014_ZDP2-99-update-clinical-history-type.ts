import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_versions', (table) => {
    table.text('clinical_history').alter();
  });
}


export async function down(knex: Knex): Promise<void> {
}

