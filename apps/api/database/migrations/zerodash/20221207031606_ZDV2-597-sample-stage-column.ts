import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_sample', (table) => {
    table.string('curation_stage', 50).after('loh_proportion');
  });
}


export async function down(knex: Knex): Promise<void> {
}

