import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_clinical_therapy_drugs", (table) => {
    table.string("id").primary();
    table.string("therapy_id").notNullable();
    table.string("drug_id").notNullable();
    table.string("alt_drug_id");

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.string("created_by").nullable();
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.string("updated_by").nullable();

    table.unique(["therapy_id", "drug_id", "alt_drug_id"]);
    table.index(["therapy_id", "drug_id", "alt_drug_id"]);
    table
      .foreign("therapy_id")
      .references("zcc_clinical_therapies.id")
      .onDelete("RESTRICT")
      .onUpdate("RESTRICT");

    table
      .foreign("drug_id")
      .references("zcc_clinical_drugs.id")
      .onDelete("RESTRICT")
      .onUpdate("RESTRICT");

    table.engine("InnoDB");
    table.charset("utf8");
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable("zcc_clinical_therapy_drugs");
}
