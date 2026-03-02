import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("zcc_clinical_mol_alterations", (table) => {
    table.json("additional_data").after("clinical_notes");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("zcc_clinical_mol_alterations", (table) => {
    table.dropColumn("additional_data");
  });
}
