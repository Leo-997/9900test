import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('zcc_analysis_set', (table) => {
    table
      .integer('public_subject_id')
      .unsigned()
      .nullable()
      .after('patient_id');

    table.index(['public_subject_id'], 'zcc_analysis_set_public_subject_id_idx');

    table
      .foreign('public_subject_id', 'zcc_analysis_set_public_subject_id')
      .references('public_subject_id')
      .inTable('zcc_patient')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
}
