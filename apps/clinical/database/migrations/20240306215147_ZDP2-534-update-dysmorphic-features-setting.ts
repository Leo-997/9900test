import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_information_settings', async (table) => {
    table.boolean('show_other_information').after('show_personal_history');
  })
    .then(() => (
      knex
        .update({
          show_other_information: knex.raw('show_dysmorphic_features'),
        })
        .from('zcc_clinical_information_settings')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_clinical_information_settings', (table) => {
        table.dropColumn('show_dysmorphic_features');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
