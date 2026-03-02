import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations_group', (table) => {
    table.unique(["group_id", "mol_alteration_id"], { indexName: "group_unique" });
  })
}


export async function down(knex: Knex): Promise<void> {
}

