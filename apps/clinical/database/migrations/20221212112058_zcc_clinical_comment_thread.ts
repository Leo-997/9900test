import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_clinical_comment_thread", (table) => {
    table.string("id");
    table.string("clinical_version_id");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.string("created_by").notNullable();

    table.primary(["id", "clinical_version_id"]);

    table.charset("utf8");
    table.engine("InnoDB");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("zcc_clinical_comment_thread");
}
