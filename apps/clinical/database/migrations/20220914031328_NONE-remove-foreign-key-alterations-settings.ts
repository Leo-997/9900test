import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations_settings', (table) => {
    table.dropForeign("clinical_version_id", "clinical_version_id_mol");
  });
}


export async function down(knex: Knex): Promise<void> {
}

