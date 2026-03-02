import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_clinical_comment", (table) => {
    table.string("id").primary();
    table.string("entity_type").notNullable();
    table.string("entity_id").nullable().defaultTo(null);
    table.string("comment").notNullable();
    table.boolean("is_hidden").defaultTo(false);
    table.string("comment_thread_id");

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.string("created_by").notNullable();
    table.timestamp("updated_at").defaultTo(null);
    table.string("updated_by").defaultTo(null);
    table.timestamp("deleted_at").defaultTo(null);
    table.string("deleted_by").defaultTo(null);

    table.charset("utf8");
    table.engine("InnoDB");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("zcc_clinical_comment");
}
