import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_clinical_slide_attachments", (table) => {
    table.string("slide_id");
    table.string("file_id");
    table.string("file_type");

    table.primary(["slide_id", "file_id"]);

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.string('created_by');

    table.engine("InnoDB");
    table.charset("utf8");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("zcc_clinical_slide_attachments");
}
