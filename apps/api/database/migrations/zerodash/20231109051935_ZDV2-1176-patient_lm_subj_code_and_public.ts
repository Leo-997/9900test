import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_patient', (table) => {
    table.integer('public_subject_id').unsigned().after('zcc_subject_id');
    table.integer('lm_subj_id').unsigned().after('internal_id');
    table.string('lm_subj_code', 50).after('lm_subj_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
