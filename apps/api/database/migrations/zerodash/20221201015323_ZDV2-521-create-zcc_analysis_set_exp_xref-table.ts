import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_analysis_set_exp_xref', (table) => {
    table.string('biosample_id', 150).notNullable();
    table.string('analysis_set_id', 36).notNullable();

    table.primary(['biosample_id', 'analysis_set_id']);
    table.index(['biosample_id'], 'zcc_analaysis_set_exp_xref_biosamples_idx');
    table.index(['analysis_set_id'], 'zcc_analysis_set_exp_set_idx');
    table.foreign('biosample_id').references('biosample_id').inTable('zcc_samples');
    table.foreign('analysis_set_id').references('analysis_set_id').inTable('zcc_analysis_set');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}


export async function down(knex: Knex): Promise<void> {
}

