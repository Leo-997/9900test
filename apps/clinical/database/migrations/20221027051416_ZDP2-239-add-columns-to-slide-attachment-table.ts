import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("zcc_clinical_slide_attachments", (table) => {
    table.json("additional_data").after("file_type");
    table.timestamp("updated_at").after("created_by");
    table.string("updated_by");
    table.timestamp("deleted_at");
    table.string("deleted_by");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("zcc_clinical_slide_attachments", (table) => {
    table.dropColumns(
      "deleted_at",
      "deleted_by",
      "updated_at",
      "updated_by",
      "additional_data"
    );
  });
}
