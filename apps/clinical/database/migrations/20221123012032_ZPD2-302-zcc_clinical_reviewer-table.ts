import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_clinical_reviewer", (table) => {
    table.string("clinical_version_id");
    table.string("clinical_reviewer_id");
    table.string("status").notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.string("created_by").nullable();

    table.primary(["clinical_version_id", "clinical_reviewer_id"]);

    table.charset("utf8");
    table.engine("InnoDB");
  });
}


export async function down(knex: Knex): Promise<void> {
}

