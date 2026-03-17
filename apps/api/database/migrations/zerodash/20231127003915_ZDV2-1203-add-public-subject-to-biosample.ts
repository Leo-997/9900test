import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_patient', (table) => {
    table.index(['public_subject_id'], 'public_subject_id_idx');
  });

  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.integer('public_subject_id').unsigned().after('patient_id');
    table
      .foreign(['public_subject_id'], 'zcc_patient_public_subject_id')
      .references(['public_subject_id'])
      .inTable('zcc_patient')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
