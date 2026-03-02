import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_clinical_hts_drug_hits", (table) => {
    table.string("hts_addendum_id").notNullable();
    table.string("hts_drug_id").notNullable();
    table.text("description").notNullable();
    table.string("tier").notNullable();

    table.primary(["hts_addendum_id", "hts_drug_id"]);

    table.charset("utf8");
    table.engine("InnoDB");
  });
}


export async function down(knex: Knex): Promise<void> {
}

