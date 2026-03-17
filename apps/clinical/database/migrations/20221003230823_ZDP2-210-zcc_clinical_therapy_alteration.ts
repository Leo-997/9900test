import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_clinical_therapy_alteration", (table) => {
    table.string("mol_alteration_id");
    table.string("therapy_id");

    table.primary(["mol_alteration_id", "therapy_id"]);

    table.engine("InnoDB");
    table.charset("utf8");
  });

}


export async function down(knex: Knex): Promise<void> {
}

