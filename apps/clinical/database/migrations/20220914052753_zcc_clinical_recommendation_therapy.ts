import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    "zcc_clinical_recommendation_therapy",
    (table) => {
      table.string("recommendation_id");
      table.string("mol_alteration_id");
      table.string("therapy_id");

      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
      table.string("created_by").nullable();
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
      table.string("updated_by").nullable();

      table.primary(["recommendation_id", "mol_alteration_id", "therapy_id"]);

      table
        .foreign("recommendation_id")
        .references("zcc_clinical_recommendations.id")
        .onDelete("RESTRICT")
        .onUpdate("RESTRICT");

      table
        .foreign("mol_alteration_id")
        .references("zcc_clinical_mol_alterations.id")
        .onDelete("RESTRICT")
        .onUpdate("RESTRICT");

      table
        .foreign("therapy_id")
        .references("zcc_clinical_therapies.id")
        .onDelete("RESTRICT")
        .onUpdate("RESTRICT");

      table.engine("InnoDB");
      table.charset("utf8");
    }
  );
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable("zcc_clinical_recommendation_therapy");
}
