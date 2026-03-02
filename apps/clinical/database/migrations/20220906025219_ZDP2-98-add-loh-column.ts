import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_samples', (table) => {
    table.double('loh_proportion').after('som_missense_snvs');
  });
}


export async function down(knex: Knex): Promise<void> {
}

