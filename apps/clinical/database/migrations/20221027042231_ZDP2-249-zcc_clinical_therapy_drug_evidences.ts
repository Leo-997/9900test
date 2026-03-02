import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_clinical_therapy_drug_evidences", (table) => {
    table.string("id").primary();
    table.string("therapy_drug_id").notNullable();
    table.string("evidence_id").notNullable();

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.string("created_by").nullable();
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.string("updated_by").nullable();
    table.timestamp("deleted_at").nullable();
    table.string("deleted_by").nullable();

    table.charset("utf8");
    table.engine("InnoDB");
  });
}


export async function down(knex: Knex): Promise<void> {
}

