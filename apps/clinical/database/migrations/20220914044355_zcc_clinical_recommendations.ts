import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_clinical_recommendations", (table) => {
    table.string("id").primary();
    table.string("mol_alteration_group_id");
    table.string("recommendation");
    table.boolean("is_accepted");
    table.text("description");
    table.string("tier");
    table.string("clinical_diagnosis_recommendation_id");
    table.string("clinical_version_id");

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.string("created_by").nullable();
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.string("updated_by").nullable();

    table.engine("InnoDB");
    table.charset("utf8");
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable("zcc_clinical_recommendations");
}
