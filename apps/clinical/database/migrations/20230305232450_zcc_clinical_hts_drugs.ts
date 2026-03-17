import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_clinical_hts_drugs", (table) => {
    table.string("id").primary();
    table.string("sample_id").notNullable();
    table.string("hts_id").notNullable();
    table.string("drug_id").notNullable();
    table.string("drug_name").notNullable();
    table.string("targets").notNullable();
    table.string("reportable").notNullable();
    table.string("reported_as").nullable().defaultTo(null);
    table.string("file_id").notNullable();
    table.text("clinical_history").nullable();
    
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

