import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("zcc_clinical_recommendations", (table) => {
    table.boolean("show_in_discussion").after("tier").alter();
    table.text("discussion_note").after("show_in_discussion").alter();
    table.timestamp("deleted_at").nullable();
    table.string("deleted_by").nullable();
  });
}


export async function down(knex: Knex): Promise<void> {
}

