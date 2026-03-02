import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_recommendations', (table) => {
    table.dropColumns(
      'known_to_CCGS',
      'clinical_confirmation',
      'referral_to_CGS_counselling',
      'screen_program_available',
    );
  });
}

export async function down(knex: Knex): Promise<void> {
}
