import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("zcc_clinical_versions", (table) => {
    table.string("discussion_title").defaultTo("Discussion").after("final_diagnosis");
    table.text("discussion_note").defaultTo(null).after("discussion_title");
  });
}


export async function down(knex: Knex): Promise<void> {
}



