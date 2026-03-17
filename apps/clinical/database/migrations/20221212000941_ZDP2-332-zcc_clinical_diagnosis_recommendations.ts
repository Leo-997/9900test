import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_diagnosis_recommendations', (table) => {
    table.string("id").primary();
    table.text("description").nullable();
    table.string("recommended_diagnosis", 500).notNullable();
    table.string("recommended_final_diagnosis", 500).notNullable();
    table.string("recommended_cancer_category").notNullable();
    table.string("recommended_cancer_type").notNullable();
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

