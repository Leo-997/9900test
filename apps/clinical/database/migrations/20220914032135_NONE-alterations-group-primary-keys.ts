import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations_group',(table) => {
    table.dropPrimary("group_id");
    table.dropUnique(["group_id", "mol_alteration_id"], "group_unique");
    table.primary(["group_id", "mol_alteration_id"]);
  });
}


export async function down(knex: Knex): Promise<void> {
}

