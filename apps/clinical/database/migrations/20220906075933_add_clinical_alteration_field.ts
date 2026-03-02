import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations', (table) => {
    table.text('clinical_alteration').nullable();
  });
}


export async function down(knex: Knex): Promise<void> {
}

