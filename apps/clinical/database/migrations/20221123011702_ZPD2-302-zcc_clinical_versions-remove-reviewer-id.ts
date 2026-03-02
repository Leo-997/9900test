import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("zcc_clinical_versions", (table) => {
    table.dropColumn("clinical_reviewer_id");
  });
}


export async function down(knex: Knex): Promise<void> {
}

