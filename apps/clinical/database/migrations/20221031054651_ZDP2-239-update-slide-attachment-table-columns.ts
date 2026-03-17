import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("zcc_clinical_slide_attachments", (table) => {
    table.dropColumn("additional_data")
    table.string("title").after("file_type");
    table.string("caption").after("title")
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("zcc_clinical_slide_attachments", (table) => {
    table.json("additional_data").after("file_type");
    table.dropColumns(
      "title",
      "caption"
    );
  });
}
