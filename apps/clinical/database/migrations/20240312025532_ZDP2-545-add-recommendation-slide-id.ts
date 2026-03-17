import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_recommendations', (table) => {
    table.string('slide_id').after('clinical_trial_id').nullable();

    table.foreign('slide_id')
      .references('id')
      .inTable('zcc_clinical_slides')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
