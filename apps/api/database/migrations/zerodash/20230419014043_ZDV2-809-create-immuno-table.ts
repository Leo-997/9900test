import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_immunoprofile', (table) => {
    table.dropForeign(['analysis_set_id'], 'zcc_curated_sample_immunoprofile_analysis');
    table.dropPrimary();
    table.dropColumn('analysis_set_id');
    table.string('rnaseq_id', 150).notNullable().primary().first();

    table
      .foreign('rnaseq_id', 'zcc_curated_sample_immunoprofile_rnaseq_biosample')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
}

export async function down(knex: Knex): Promise<void> {
}

