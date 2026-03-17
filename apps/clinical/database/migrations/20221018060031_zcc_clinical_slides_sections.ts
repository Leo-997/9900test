import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_clinical_slides_sections", (table) => {
    table.string("id").primary();
    table.smallint("order").notNullable();
    table.string("type").notNullable();
    table.string("slide_id").notNullable();
    table.string("name");
    table.text("description");

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.string("created_by").nullable();
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.string("updated_by").nullable();
    table.timestamp("deleted_at").nullable();
    table.string("deleted_by").nullable();

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
  return await knex.schema.dropTable("zcc_clinical_slides_sections");
}
