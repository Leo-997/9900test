import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_analysis_set_exp_xref', (table) => {
    table.dropForeign(['biosample_id']);
    table.foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_samples')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.dropForeign(['analysis_set_id']);
    table.foreign('analysis_set_id')
      .references('analysis_set_id')
      .inTable('zcc_analysis_set')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
}


export async function down(knex: Knex): Promise<void> {
}

