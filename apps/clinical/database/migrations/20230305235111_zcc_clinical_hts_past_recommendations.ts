import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_clinical_hts_past_recommendations", (table) => {
    table.string("hts_addendum_id").notNullable();
    table.string("recommendation_id").notNullable();

    table.primary(["hts_addendum_id", "recommendation_id"]);

    table.charset("utf8");
    table.engine("InnoDB");
  });
}


export async function down(knex: Knex): Promise<void> {
}

