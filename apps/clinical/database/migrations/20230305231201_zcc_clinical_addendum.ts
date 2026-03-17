import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_clinical_addendum", (table) => {
    table.string("id").primary();
    table.text("clinical_history").nullable();
    table.string("title").notNullable().defaultTo("Addendum Title");
    table.text("note").nullable();
    table.string("discussion_title").notNullable().defaultTo("Discussion Title");
    table.text("discussion_note").nullable();
    table.string("clinical_version_id").notNullable();
    table.enum("addendum_type", ["general", "hts"]).notNullable();

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.string("created_by").notNullable();
    table.timestamp("updated_at").defaultTo(null);
    table.string("updated_by").defaultTo(null);

    table.charset("utf8");
    table.engine("InnoDB");
  });
}


export async function down(knex: Knex): Promise<void> {
}

