import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("zcc_clinical_information", (table) => {
    table.string("family_history").alter();
    table.string("dysmorphic_features").alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("zcc_clinical_information", (table) => {
    table.boolean("family_history").alter();
    table.boolean("dysmorphic_features").alter();
  });
}
