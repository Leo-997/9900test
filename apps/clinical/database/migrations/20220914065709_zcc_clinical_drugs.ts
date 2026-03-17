import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_clinical_drugs", (table) => {
    table.string("id").primary();
    table.string("external_id");
    table.string("name").notNullable();
    table.boolean("has_paediatric_dose");
    table.string("company_id");
    table.string("company_name");
    table.string("class");

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.string("created_by").nullable();
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.string("updated_by").nullable();

    table.engine("InnoDB");
    table.charset("utf8");
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable("zcc_clinical_drugs");
}
