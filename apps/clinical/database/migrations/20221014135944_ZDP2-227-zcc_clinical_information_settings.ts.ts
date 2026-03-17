import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    "zcc_clinical_information_settings",
    (table) => {
      table.string("id").primary();
      table.string("slide_id").notNullable().index();
      table.boolean("show_prior_genetic_test").defaultTo(true);
      table.boolean("show_family_history").defaultTo(true);
      table.boolean("show_personal_history").defaultTo(true);
      table.boolean("show_dysmorphic_features").defaultTo(false);

      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
      table.string("created_by");
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
      table.string("updated_by");

      table
        .foreign("slide_id")
        .references("zcc_clinical_slides.id")
        .onDelete("RESTRICT")
        .onUpdate("RESTRICT");

      table.engine("InnoDB");
      table.charset("utf8");
    }
  );
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable("zcc_clinical_information_settings");
}
