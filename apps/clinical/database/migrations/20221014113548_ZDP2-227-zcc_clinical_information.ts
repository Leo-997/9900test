import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_clinical_information", (table) => {
    table.string("id").primary();
    table.string("slide_id").notNullable().index();
    table.boolean("prior_genetic_test");
    table.text("prior_genetic_test_note");
    table.boolean("family_history");
    table.text("family_history_note");
    table.boolean("personal_history");
    table.text("personal_history_note");
    table.boolean("dysmorphic_features");
    table.text("dysmorphic_features_note");

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.string("created_by");
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.string("updated_by");
    table.timestamp("deleted_at");
    table.string("deleted_by");

    table
      .foreign("slide_id")
      .references("zcc_clinical_slides.id")
      .onDelete("RESTRICT")
      .onUpdate("RESTRICT");

    table.engine("InnoDB");
    table.charset("utf8");
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable("zcc_clinical_information");
}
