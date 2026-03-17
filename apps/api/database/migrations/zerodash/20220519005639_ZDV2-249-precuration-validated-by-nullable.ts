import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_sample', (table) => {
    table.string('precuration_validated_by', 255)
      .after('comments')
      .nullable()
      .alter();
  });
}


export async function down(knex: Knex): Promise<void> {
}

