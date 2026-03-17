import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_evidences',
    function variantTypeToString(table) {
      table.string('variant_type', 255).notNullable().alter();
    }
  );
}


export async function down(knex: Knex): Promise<void> {
}

