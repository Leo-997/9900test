import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("zcc_annotation_summary", (t) => {
    t.integer("report_order").nullable();
  });
}


export async function down(knex: Knex): Promise<void> {
}

